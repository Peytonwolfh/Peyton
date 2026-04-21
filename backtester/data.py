"""Data loading and synthetic generation for futures backtests."""
from __future__ import annotations

import numpy as np
import pandas as pd


def load_csv(path: str, tz: str = "America/New_York") -> pd.DataFrame:
    """Load OHLCV CSV. Expects columns: datetime, open, high, low, close, volume."""
    df = pd.read_csv(path)
    df.columns = [c.lower() for c in df.columns]
    df["datetime"] = pd.to_datetime(df["datetime"])
    if df["datetime"].dt.tz is None:
        df["datetime"] = df["datetime"].dt.tz_localize("UTC").dt.tz_convert(tz)
    else:
        df["datetime"] = df["datetime"].dt.tz_convert(tz)
    df = df.set_index("datetime").sort_index()
    return df[["open", "high", "low", "close", "volume"]]


def generate_synthetic(
    start: str = "2024-01-01",
    periods: int = 24 * 5 * 52,
    freq: str = "1h",
    start_price: float = 4500.0,
    seed: int = 7,
    tz: str = "America/New_York",
) -> pd.DataFrame:
    """Generate realistic-looking 1h futures bars (ES-like).

    Uses GBM with intraday volatility seasonality and occasional displacement
    shocks so that ICT-style structures (swings, OBs, breakers) form.
    """
    rng = np.random.default_rng(seed)
    idx = pd.date_range(start=start, periods=periods, freq=freq, tz=tz)

    hours = idx.hour.to_numpy()
    # Volatility seasonality: higher during NY/London open.
    vol_profile = np.where((hours >= 2) & (hours <= 5), 1.4,
                  np.where((hours >= 8) & (hours <= 11), 1.6, 0.7))

    base_vol = 0.0025
    drift = 0.00002
    shocks = rng.normal(0, 1, periods) * vol_profile * base_vol

    # Add occasional displacement candles (mimics news / liquidity sweeps).
    jumps = np.zeros(periods)
    jump_mask = rng.random(periods) < 0.01
    jumps[jump_mask] = rng.normal(0, 0.006, jump_mask.sum())
    rets = drift + shocks + jumps

    close = start_price * np.exp(np.cumsum(rets))
    # Build OHLC from close with realistic wicks.
    open_ = np.empty(periods)
    open_[0] = start_price
    open_[1:] = close[:-1]
    noise = rng.normal(0, base_vol * 0.6, periods)
    high = np.maximum(open_, close) * (1 + np.abs(noise) * vol_profile)
    low = np.minimum(open_, close) * (1 - np.abs(noise) * vol_profile)
    volume = rng.integers(1000, 8000, periods) * vol_profile.astype(int).clip(1)

    df = pd.DataFrame(
        {"open": open_, "high": high, "low": low, "close": close, "volume": volume},
        index=idx,
    )
    df.index.name = "datetime"
    return df
