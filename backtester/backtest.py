"""Bar-by-bar backtest engine with prop firm rule enforcement."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

import pandas as pd

from .ict import Signal, find_signals
from .prop_rules import AccountState, PropFirmRules


@dataclass
class Trade:
    entry_time: pd.Timestamp
    exit_time: pd.Timestamp
    side: str
    entry: float
    exit: float
    stop: float
    target: float
    contracts: int
    pnl: float
    outcome: str  # "tp", "sl", "timeout", "eod", "blown"


@dataclass
class BacktestResult:
    trades: list[Trade] = field(default_factory=list)
    equity_curve: list[tuple[pd.Timestamp, float]] = field(default_factory=list)
    account: Optional[AccountState] = None


class Backtester:
    """Walks the bars forward, opens trades on signals, tracks equity.

    Contract spec defaults to MES (Micro E-mini S&P 500): $5 per point.
    For MNQ use dollars_per_point=2. For ES use 50. For NQ use 20.
    """

    def __init__(
        self,
        df: pd.DataFrame,
        rules: PropFirmRules,
        dollars_per_point: float = 5.0,
        risk_per_trade_pct: float = 0.5,
        commission_per_contract: float = 1.40,
        max_bars_in_trade: int = 24,
    ):
        self.df = df
        self.rules = rules
        self.dpp = dollars_per_point
        self.risk_pct = risk_per_trade_pct / 100.0
        self.commission = commission_per_contract
        self.max_bars = max_bars_in_trade

    def _size(self, equity: float, entry: float, stop: float) -> int:
        risk_dollars = equity * self.risk_pct
        per_contract_risk = abs(entry - stop) * self.dpp
        if per_contract_risk <= 0:
            return 0
        return max(0, int(risk_dollars // per_contract_risk))

    def run(self) -> BacktestResult:
        signals = find_signals(self.df)
        sig_by_time = {s.entry_time: s for s in signals}

        account = AccountState.new(self.rules)
        result = BacktestResult(account=account)

        open_trade: Optional[Trade] = None
        bars_in_trade = 0
        last_day = None

        for ts, bar in self.df.iterrows():
            # New trading day?
            if last_day is None or ts.date() != last_day:
                if open_trade is not None:
                    # Force-close at prior bar close on day change.
                    self._close(open_trade, ts, open_trade.exit, "eod", account, result)
                    open_trade = None
                    bars_in_trade = 0
                account.on_new_day()
                last_day = ts.date()

            if account.blown or account.passed:
                break

            # Manage open trade.
            if open_trade is not None:
                bars_in_trade += 1
                if open_trade.side == "long":
                    if bar["low"] <= open_trade.stop:
                        self._close(open_trade, ts, open_trade.stop, "sl", account, result)
                        open_trade = None
                    elif bar["high"] >= open_trade.target:
                        self._close(open_trade, ts, open_trade.target, "tp", account, result)
                        open_trade = None
                else:
                    if bar["high"] >= open_trade.stop:
                        self._close(open_trade, ts, open_trade.stop, "sl", account, result)
                        open_trade = None
                    elif bar["low"] <= open_trade.target:
                        self._close(open_trade, ts, open_trade.target, "tp", account, result)
                        open_trade = None
                if open_trade is not None and bars_in_trade >= self.max_bars:
                    self._close(open_trade, ts, bar["close"], "timeout", account, result)
                    open_trade = None
                    bars_in_trade = 0

            # Open new trade on signal if flat.
            if open_trade is None and ts in sig_by_time:
                sig = sig_by_time[ts]
                contracts = self._size(account.equity, sig.entry, sig.stop)
                if contracts <= 0:
                    continue
                open_trade = Trade(
                    entry_time=ts,
                    exit_time=ts,
                    side=sig.side,
                    entry=sig.entry,
                    exit=sig.entry,
                    stop=sig.stop,
                    target=sig.target,
                    contracts=contracts,
                    pnl=0.0,
                    outcome="",
                )
                bars_in_trade = 0

            result.equity_curve.append((ts, account.equity))

        return result

    def _close(
        self,
        trade: Trade,
        ts: pd.Timestamp,
        exit_price: float,
        outcome: str,
        account: AccountState,
        result: BacktestResult,
    ) -> None:
        direction = 1 if trade.side == "long" else -1
        gross = (exit_price - trade.entry) * direction * self.dpp * trade.contracts
        fees = self.commission * trade.contracts * 2
        pnl = gross - fees
        trade.exit_time = ts
        trade.exit = exit_price
        trade.pnl = pnl
        trade.outcome = outcome
        result.trades.append(trade)
        account.on_trade_close(pnl)
