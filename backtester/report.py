"""Summary stats for a backtest result."""
from __future__ import annotations

import numpy as np
import pandas as pd

from .backtest import BacktestResult


def summarize(result: BacktestResult) -> dict:
    trades = result.trades
    if not trades:
        return {"trades": 0, "note": "no trades triggered"}

    pnls = np.array([t.pnl for t in trades])
    wins = pnls[pnls > 0]
    losses = pnls[pnls <= 0]

    equity = [e for _, e in result.equity_curve]
    peak = np.maximum.accumulate(equity) if equity else [0]
    dd = np.array(equity) - np.array(peak) if equity else np.array([0])

    return {
        "trades": len(trades),
        "wins": int((pnls > 0).sum()),
        "losses": int((pnls <= 0).sum()),
        "win_rate": float((pnls > 0).mean()),
        "total_pnl": float(pnls.sum()),
        "avg_win": float(wins.mean()) if len(wins) else 0.0,
        "avg_loss": float(losses.mean()) if len(losses) else 0.0,
        "profit_factor": float(wins.sum() / -losses.sum()) if len(losses) and losses.sum() < 0 else float("inf"),
        "max_drawdown": float(dd.min()),
        "final_equity": float(equity[-1]) if equity else 0.0,
        "passed": result.account.passed if result.account else False,
        "blown": result.account.blown if result.account else False,
        "blown_reason": result.account.blown_reason if result.account else "",
        "trading_days": result.account.trading_days if result.account else 0,
    }


def monte_carlo_pass_rate(
    trade_pnls: list[float],
    rules,
    n_sims: int = 2000,
    trades_per_sim: int = 200,
    seed: int = 42,
) -> dict:
    """Bootstrap trade PnLs to estimate % of accounts that pass vs blow.

    This is a naive estimator: it samples trades with replacement, applying the
    trailing drawdown + daily loss rules (treating each trade as an atomic day).
    """
    from .prop_rules import AccountState

    rng = np.random.default_rng(seed)
    if not trade_pnls:
        return {"pass_rate": 0.0, "blow_rate": 0.0, "neither": 1.0}

    pnls = np.array(trade_pnls)
    passed = blown = 0
    for _ in range(n_sims):
        acc = AccountState.new(rules)
        draws = rng.choice(pnls, size=trades_per_sim, replace=True)
        for pnl in draws:
            acc.on_new_day()
            acc.on_trade_close(float(pnl))
            if acc.passed:
                passed += 1
                break
            if acc.blown:
                blown += 1
                break
    return {
        "pass_rate": passed / n_sims,
        "blow_rate": blown / n_sims,
        "neither": 1 - (passed + blown) / n_sims,
        "n_sims": n_sims,
    }
