"""Indicator primitives used by the ICT strategy."""
from __future__ import annotations

import numpy as np
import pandas as pd


def atr(df: pd.DataFrame, n: int = 14) -> pd.Series:
    h, l, c = df["high"], df["low"], df["close"]
    prev_c = c.shift(1)
    tr = pd.concat(
        [(h - l), (h - prev_c).abs(), (l - prev_c).abs()], axis=1
    ).max(axis=1)
    return tr.rolling(n, min_periods=1).mean()


def swing_points(df: pd.DataFrame, left: int = 3, right: int = 3) -> pd.DataFrame:
    """Mark confirmed swing highs/lows using a fractal with `left`/`right` bars.

    A swing is confirmed `right` bars after it forms — we shift by `right`
    so the signal is only available after confirmation (no look-ahead).
    """
    h, l = df["high"], df["low"]
    is_swing_high = (h == h.rolling(left + right + 1, center=True).max())
    is_swing_low = (l == l.rolling(left + right + 1, center=True).min())
    out = pd.DataFrame(index=df.index)
    out["swing_high"] = is_swing_high.shift(right).fillna(False).astype(bool)
    out["swing_low"] = is_swing_low.shift(right).fillna(False).astype(bool)
    return out


def ema(series: pd.Series, n: int) -> pd.Series:
    return series.ewm(span=n, adjust=False).mean()


def in_killzone(index: pd.DatetimeIndex, sessions=("london", "ny")) -> pd.Series:
    """True when the bar timestamp is inside a killzone (exchange local tz)."""
    hour = index.hour
    mask = np.zeros(len(index), dtype=bool)
    if "london" in sessions:
        mask |= (hour >= 2) & (hour <= 5)
    if "ny" in sessions:
        mask |= (hour >= 8) & (hour <= 11)
    return pd.Series(mask, index=index, name="killzone")
