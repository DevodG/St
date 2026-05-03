from __future__ import annotations

import pandas as pd


def forecast_with_prophet(features: pd.DataFrame, horizon_days: int) -> dict:
    """Lightweight stub: produce deterministic forecast based on the last Close value.

    Returns a dict with keys 'prediction', 'upper', 'lower' matching the real service's shape.
    """
    try:
        last = float(features["Close"].iloc[-1])
    except Exception:
        last = 1.0
    prediction = [round(last * (1 + 0.01 * (i + 1)), 4) for i in range(max(1, horizon_days))]
    upper = [round(p * 1.05, 4) for p in prediction]
    lower = [round(p * 0.95, 4) for p in prediction]
    return {"prediction": prediction, "upper": upper, "lower": lower}
