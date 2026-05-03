from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from services.feature_engineering import macd_bullish_crossover


@dataclass(frozen=True)
class SignalResult:
    signal: str
    confidence_pct: int
    reasoning: str


def combine_predictions(prophet_prices: list[float], lstm_prices: list[float], prophet_rmse: float | None = None, lstm_rmse: float | None = None) -> list[float]:
    if not prophet_prices:
        return lstm_prices
    if not lstm_prices:
        return prophet_prices
    if prophet_rmse and lstm_rmse and prophet_rmse > 0 and lstm_rmse > 0:
        prophet_weight = lstm_rmse / (prophet_rmse + lstm_rmse)
        lstm_weight = prophet_rmse / (prophet_rmse + lstm_rmse)
    else:
        prophet_weight = 0.5
        lstm_weight = 0.5
    return [round(prophet_weight * p + lstm_weight * l, 4) for p, l in zip(prophet_prices, lstm_prices)]


def classify_signal(current_price: float, predicted_prices: list[float], features: pd.DataFrame, horizon: str) -> SignalResult:
    expected_return = (predicted_prices[-1] - current_price) / current_price if current_price else 0.0
    rsi = float(features["RSI"].iloc[-1])
    crossover = macd_bullish_crossover(features)

    if expected_return > 0.03 and rsi < 70:
        signal = "BUY"
        confidence = min(95, int(60 + expected_return * 500))
    elif expected_return < -0.03 or rsi > 75:
        signal = "SELL"
        confidence = min(95, int(60 + abs(expected_return) * 500))
    else:
        signal = "HOLD"
        confidence = min(90, int(55 + abs(expected_return) * 300))

    rsi_label = "overbought" if rsi > 70 else "oversold" if rsi < 30 else "neutral"
    reasoning = (
        f"Based on {horizon} forecast: price expected to move {expected_return:+.1%}. "
        f"RSI at {rsi:.0f} ({rsi_label}). "
        f"{'MACD bullish crossover detected. ' if crossover else ''}"
    )
    return SignalResult(signal=signal, confidence_pct=confidence, reasoning=reasoning)
