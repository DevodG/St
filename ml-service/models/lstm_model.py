from __future__ import annotations

from typing import Any, Tuple

import pandas as pd


def train_or_load_lstm(symbol: str, scaled: pd.DataFrame, feature_columns: list[str], cache_dir: str, epochs: int = 3) -> Tuple[Any, float]:
    """Lightweight stub: return a dummy model object and a nominal RMSE."""
    class DummyModel:
        pass

    return DummyModel(), 1.0


def predict_lstm(model: Any, scaled: pd.DataFrame, feature_columns: list[str], horizon_days: int) -> list[float]:
    """Return normalized scaled predictions (0..1) for horizon_days as a simple constant series.

    The real implementation would return scaled values; returning 0.5 keeps prices in the middle
    of observed min/max ranges in the calling code.
    """
    if horizon_days <= 0:
        return []
    return [0.5 for _ in range(horizon_days)]
