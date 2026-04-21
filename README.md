# Futures Prop-Firm Backtester

A Python backtester for futures strategies, with **prop-firm rule enforcement**
(TopStep / Apex / FTMO style) baked into the account model. Ships with a
rules-based approximation of the **ICT Breaker Block** setup.

## What's included

```
backtester/
  data.py         # CSV loader + synthetic OHLCV generator (with session vol)
  indicators.py   # ATR, swing highs/lows (fractal), EMA, killzone filter
  ict.py          # Displacement -> Order Block -> Breaker -> retest signals
  prop_rules.py   # Daily loss, trailing max drawdown, profit target
  backtest.py     # Bar-by-bar engine with SL/TP + prop-rule enforcement
  report.py       # Stats + Monte Carlo pass-rate estimator
run_backtest.py   # CLI entry point
```

## Quickstart

```sh
pip install -r requirements.txt
python run_backtest.py                    # synthetic data, MES, TopStep 50K defaults
python run_backtest.py --csv your_data.csv --dpp 5 --balance 50000
```

CSV format expected: `datetime,open,high,low,close,volume` (datetime in ISO 8601).

## Strategy: ICT Breaker Block (mechanical approximation)

The detector scans every bar and emits a signal when:

1. A **displacement** bar prints — a bar whose range > 1.5 × ATR(14) closing
   in the direction of the move.
2. The **last opposing candle** before the displacement is marked as an
   Order Block (OB).
3. A later bar **violates** that OB in the opposite direction → the OB is
   now a **Breaker**.
4. Price **retests** the breaker zone, closes back through it, and the
   bar is inside a **killzone** (London 02:00-05:00 or NY 08:30-11:00 local).
5. **HTF bias filter**: 50-EMA must agree with trade direction.

Entry = bar close. Stop = beyond the breaker ± 0.25×ATR. Target = 2R by default.

### What this cannot capture

ICT in practice is discretionary. The rules above approximate the *mechanical*
parts. These subjective elements are **not** modelled:

- "Meaningful liquidity purge" context
- Narrative / news alignment
- Manual HTF PD-array selection (we use a 50-EMA proxy)
- Quality of the draw-on-liquidity target

So expect the mechanical version to underperform a skilled discretionary trader.

## Prop-firm rules

Defaults target a **TopStep $50K Combine** — override via CLI flags:

| Flag            | Default | Meaning                                   |
|-----------------|---------|-------------------------------------------|
| `--balance`     | 50000   | Starting account balance                  |
| `--target`      | 3000    | Profit target to pass                     |
| `--daily-loss`  | 1000    | Daily loss limit                          |
| `--max-dd`      | 2000    | Trailing max drawdown from equity peak    |
| `--risk-pct`    | 0.5     | % of equity risked per trade              |
| `--dpp`         | 5       | $/point (MES=5, MNQ=2, ES=50, NQ=20)      |

The account is marked **blown** if trailing DD or daily loss is breached, and
**passed** when profit target is hit after `min_trading_days`.

## Monte Carlo pass-rate estimator

After a backtest, trade PnLs are bootstrapped to simulate N independent account
runs, each capped at 200 trades, applying the trailing-DD + daily-loss rules.
The output is an empirical estimate of:

- `pass_rate` — fraction of sims that hit the profit target
- `blow_rate` — fraction that hit a rule violation first
- `neither` — fraction that ran out of trades

This is far more useful than a single equity curve for evaluating whether a
strategy can survive a prop-firm rule-set.

## Honest caveats

- **No strategy is guaranteed to pass an eval.** Pass rates depend heavily on
  position sizing and rule adherence, not just signal quality.
- **Synthetic data ≠ real market.** The built-in generator produces plausible
  OHLC bars with session volatility, but it lacks regime changes, gaps, and
  real microstructure. Use your own data for anything you'd actually trade.
- **Fills are optimistic.** Backtest assumes fills at SL/TP/close. No slippage
  model is included — add a few ticks of slippage to stops if you want to be
  conservative.
- **No walk-forward / parameter tuning yet.** The current defaults are
  reasonable starting points, not optimised values.

## Next steps to make this useful for a real eval

1. Load **real MES/MNQ 15-min or 1-hour data** (e.g. from CME DataMine, Databento,
   or a broker export) via `--csv`.
2. Add **slippage + tick rounding** in `backtest.py`.
3. **Walk-forward optimise** the displacement multiplier, reward:risk, and
   killzone windows per instrument.
4. Add a **news / economic calendar filter** so signals fired around FOMC/NFP
   are skipped.
5. Layer in a **break-even stop** and **partial TP** — most prop traders scale
   out rather than run one target.
