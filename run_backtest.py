"""Run the ICT Breaker Block backtester on synthetic or real futures data.

Usage:
    python run_backtest.py                 # synthetic data, default config
    python run_backtest.py --csv data/mes_1h.csv
"""
from __future__ import annotations

import argparse
import json
import os
from pprint import pprint

from backtester import (
    Backtester,
    PropFirmRules,
    generate_synthetic,
    load_csv,
    summarize,
)
from backtester.report import monte_carlo_pass_rate


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--csv", default=None, help="Path to OHLCV CSV (optional)")
    p.add_argument("--dpp", type=float, default=5.0,
                   help="Dollars per point (MES=5, MNQ=2, ES=50, NQ=20)")
    p.add_argument("--balance", type=float, default=50_000)
    p.add_argument("--target", type=float, default=3_000)
    p.add_argument("--daily-loss", type=float, default=1_000)
    p.add_argument("--max-dd", type=float, default=2_000)
    p.add_argument("--risk-pct", type=float, default=0.5)
    p.add_argument("--mc-sims", type=int, default=2000)
    args = p.parse_args()

    if args.csv:
        print(f"Loading {args.csv} ...")
        df = load_csv(args.csv)
    else:
        print("Generating synthetic 1h futures data ...")
        df = generate_synthetic()
        os.makedirs("data", exist_ok=True)
        df.to_csv("data/synthetic_futures_1h.csv")
        print(f"  saved -> data/synthetic_futures_1h.csv ({len(df)} bars)")

    print(f"Data range: {df.index[0]}  ->  {df.index[-1]}  ({len(df)} bars)")

    rules = PropFirmRules(
        starting_balance=args.balance,
        profit_target=args.target,
        daily_loss_limit=args.daily_loss,
        trailing_max_drawdown=args.max_dd,
    )
    bt = Backtester(df, rules, dollars_per_point=args.dpp,
                    risk_per_trade_pct=args.risk_pct)
    result = bt.run()

    stats = summarize(result)
    print("\n=== Backtest Summary ===")
    pprint(stats)

    if result.trades:
        mc = monte_carlo_pass_rate(
            [t.pnl for t in result.trades], rules, n_sims=args.mc_sims
        )
        print("\n=== Monte Carlo Pass-Rate Estimate ===")
        pprint(mc)

        with open("results.json", "w") as f:
            json.dump(
                {
                    "config": vars(args),
                    "stats": stats,
                    "monte_carlo": mc,
                    "sample_trades": [
                        {
                            "entry_time": str(t.entry_time),
                            "exit_time": str(t.exit_time),
                            "side": t.side,
                            "entry": t.entry,
                            "exit": t.exit,
                            "contracts": t.contracts,
                            "pnl": t.pnl,
                            "outcome": t.outcome,
                        }
                        for t in result.trades[:20]
                    ],
                },
                f,
                indent=2,
                default=str,
            )
        print("\n-> wrote results.json")


if __name__ == "__main__":
    main()
