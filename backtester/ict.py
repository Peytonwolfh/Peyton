"""Mechanical approximation of the ICT Breaker Block entry.

This is a best-effort rules-based version of a discretionary framework.
It detects:
  1. Swing highs/lows (fractal).
  2. "Displacement" bars = ATR-normalised range > threshold closing in trend.
  3. Order Blocks = last opposing candle before a displacement.
  4. Breakers = an OB that later got violated in the opposite direction.
  5. Retest entry inside the breaker zone during a killzone, with HTF bias filter.

It intentionally does NOT try to read "meaningful context" (news, narrative);
that remains the discretionary edge a human adds on top.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import numpy as np
import pandas as pd

from .indicators import atr, ema, in_killzone, swing_points


Side = Literal["long", "short"]


@dataclass
class Signal:
    entry_time: pd.Timestamp
    side: Side
    entry: float
    stop: float
    target: float
    breaker_low: float
    breaker_high: float


def _find_order_blocks(
    df: pd.DataFrame, displacement_atr_mult: float = 1.5
) -> pd.DataFrame:
    """Tag each bar with whether a bullish/bearish OB formed at the prior bar.

    Displacement bar at index `i` confirms an OB at `i-1`:
      - Bullish displacement (close > open and range > k*ATR) => bullish OB
        at the last down candle before it.
      - Bearish displacement => bearish OB at the last up candle before it.
    """
    a = atr(df, 14)
    rng = df["high"] - df["low"]
    is_up = df["close"] > df["open"]
    is_down = df["close"] < df["open"]
    displacement = rng > (displacement_atr_mult * a)

    bullish_disp = displacement & is_up
    bearish_disp = displacement & is_down

    out = pd.DataFrame(index=df.index)
    out["bull_ob_low"] = np.nan
    out["bull_ob_high"] = np.nan
    out["bear_ob_low"] = np.nan
    out["bear_ob_high"] = np.nan

    # Walk forward: look back for the last opposing candle.
    lookback = 6
    for i in range(lookback, len(df)):
        if bullish_disp.iloc[i]:
            # Last down candle in [i-lookback, i-1]
            window = df.iloc[i - lookback : i]
            down = window[window["close"] < window["open"]]
            if not down.empty:
                ob = down.iloc[-1]
                out.iloc[i, out.columns.get_loc("bull_ob_low")] = ob["low"]
                out.iloc[i, out.columns.get_loc("bull_ob_high")] = ob["high"]
        if bearish_disp.iloc[i]:
            window = df.iloc[i - lookback : i]
            up = window[window["close"] > window["open"]]
            if not up.empty:
                ob = up.iloc[-1]
                out.iloc[i, out.columns.get_loc("bear_ob_low")] = ob["low"]
                out.iloc[i, out.columns.get_loc("bear_ob_high")] = ob["high"]
    return out


def find_signals(
    df: pd.DataFrame,
    htf_ema: int = 50,
    displacement_atr_mult: float = 1.5,
    reward_risk: float = 2.0,
    killzone_only: bool = True,
    max_breaker_age: int = 48,
) -> list[Signal]:
    """Scan the dataframe for breaker-retest setups and emit Signal objects."""
    a = atr(df, 14)
    trend = ema(df["close"], htf_ema)
    kz = in_killzone(df.index)
    swings = swing_points(df, 3, 3)
    obs = _find_order_blocks(df, displacement_atr_mult)

    # Track active breakers: when a bearish OB is broken upward, it becomes a
    # bullish breaker. Mirror for bearish.
    active_bull_breakers: list[tuple[int, float, float]] = []  # (bar_idx, low, high)
    active_bear_breakers: list[tuple[int, float, float]] = []

    signals: list[Signal] = []

    for i in range(60, len(df)):
        bar = df.iloc[i]
        ts = df.index[i]

        # Promote OBs to breakers when violated.
        if not np.isnan(obs.iloc[i]["bear_ob_high"]):
            active_bear_breakers.append(
                (i, obs.iloc[i]["bear_ob_low"], obs.iloc[i]["bear_ob_high"])
            )
        if not np.isnan(obs.iloc[i]["bull_ob_high"]):
            active_bull_breakers.append(
                (i, obs.iloc[i]["bull_ob_low"], obs.iloc[i]["bull_ob_high"])
            )

        # Expire stale breakers.
        active_bear_breakers = [
            b for b in active_bear_breakers if i - b[0] <= max_breaker_age
        ]
        active_bull_breakers = [
            b for b in active_bull_breakers if i - b[0] <= max_breaker_age
        ]

        # Check for bullish breaker: a bearish OB that was violated upward
        # and is now being retested from above.
        for idx, lo, hi in list(active_bear_breakers):
            # Was it broken upward since it formed?
            post = df.iloc[idx + 1 : i + 1]
            if post.empty:
                continue
            broke_up = (post["close"] > hi).any()
            if not broke_up:
                continue
            # Retest: current bar dips into the zone and closes above it.
            if bar["low"] <= hi and bar["close"] > lo and bar["close"] > trend.iloc[i]:
                if killzone_only and not kz.iloc[i]:
                    continue
                stop = lo - 0.25 * a.iloc[i]
                entry = bar["close"]
                risk = entry - stop
                if risk <= 0:
                    continue
                target = entry + reward_risk * risk
                signals.append(
                    Signal(ts, "long", entry, stop, target, lo, hi)
                )
                active_bear_breakers.remove((idx, lo, hi))
                break

        # Bearish breaker: a bullish OB violated downward, retested from below.
        for idx, lo, hi in list(active_bull_breakers):
            post = df.iloc[idx + 1 : i + 1]
            if post.empty:
                continue
            broke_dn = (post["close"] < lo).any()
            if not broke_dn:
                continue
            if bar["high"] >= lo and bar["close"] < hi and bar["close"] < trend.iloc[i]:
                if killzone_only and not kz.iloc[i]:
                    continue
                stop = hi + 0.25 * a.iloc[i]
                entry = bar["close"]
                risk = stop - entry
                if risk <= 0:
                    continue
                target = entry - reward_risk * risk
                signals.append(
                    Signal(ts, "short", entry, stop, target, lo, hi)
                )
                active_bull_breakers.remove((idx, lo, hi))
                break

    return signals
