"""Prop firm rule enforcement (TopStep / Apex style)."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class PropFirmRules:
    """Default: TopStep-like $50K Combine.

    - profit_target: absolute $ needed to pass the eval.
    - daily_loss_limit: max loss in a single trading day (end-of-day equity
      vs start-of-day equity).
    - trailing_max_drawdown: trailing from peak; account blown if equity
      closes below (peak - trailing_max_drawdown).
    """

    starting_balance: float = 50_000.0
    profit_target: float = 3_000.0
    daily_loss_limit: float = 1_000.0
    trailing_max_drawdown: float = 2_000.0
    min_trading_days: int = 5


@dataclass
class AccountState:
    rules: PropFirmRules
    equity: float
    peak_equity: float
    day_start_equity: float
    trading_days: int = 0
    passed: bool = False
    blown: bool = False
    blown_reason: str = ""

    @classmethod
    def new(cls, rules: PropFirmRules) -> "AccountState":
        return cls(
            rules=rules,
            equity=rules.starting_balance,
            peak_equity=rules.starting_balance,
            day_start_equity=rules.starting_balance,
        )

    def on_trade_close(self, pnl: float) -> None:
        if self.blown or self.passed:
            return
        self.equity += pnl
        self.peak_equity = max(self.peak_equity, self.equity)

        # Trailing drawdown check.
        floor_ = self.peak_equity - self.rules.trailing_max_drawdown
        if self.equity <= floor_:
            self.blown = True
            self.blown_reason = "trailing_max_drawdown"
            return

        # Daily loss check.
        day_pnl = self.equity - self.day_start_equity
        if day_pnl <= -self.rules.daily_loss_limit:
            self.blown = True
            self.blown_reason = "daily_loss_limit"
            return

        # Profit target check.
        if (
            self.equity - self.rules.starting_balance >= self.rules.profit_target
            and self.trading_days >= self.rules.min_trading_days
        ):
            self.passed = True

    def on_new_day(self) -> None:
        self.trading_days += 1
        self.day_start_equity = self.equity
