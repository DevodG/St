from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from typing import Any

import redis.asyncio as redis
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query

from models.lstm_model import predict_lstm, train_or_load_lstm
from models.prophet_model import forecast_with_prophet
from models.sentiment_model import score_sentiment
from services.data_fetcher import InsufficientHistoryError, SymbolNotFoundError, fetch_history, fetch_quote
from services.ensemble import classify_signal, combine_predictions
from services.feature_engineering import engineer_features, scale_feature_window

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CACHE_DIR = Path("cache")
FEATURE_COLUMNS = ["Open", "High", "Low", "Close", "Volume", "RSI", "MACD", "MACDSignal", "SMA20", "BollingerUpper", "BollingerLower", "VolumeSMA20", "Momentum5", "Momentum20"]

app = FastAPI(title="StockLy ML Service", version="1.0.0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)


class InvalidHorizonError(ValueError):
    """Raised when the horizon query parameter cannot be parsed."""


def _horizon_to_days(horizon: str) -> int:
    normalized = horizon.strip().lower()
    try:
        if normalized.endswith("d"):
            raw = normalized[:-1]
            if not raw.strip():
                raise InvalidHorizonError("Horizon suffix 'd' requires a number, e.g. 7d")
            n = int(raw)
        else:
            n = int(normalized)
    except ValueError as error:
        raise InvalidHorizonError("Horizon must be an integer days value or form like 7d (1–30).") from error
    return max(1, min(30, n))


async def _get_cached_json(key: str) -> dict[str, Any] | None:
    cached = await redis_client.get(key)
    if cached is None:
        return None
    return json.loads(cached)


async def _set_cached_json(key: str, value: dict[str, Any], seconds: int) -> None:
    await redis_client.set(key, json.dumps(value), ex=seconds)


def _predict_blocking(symbol: str, horizon: str) -> dict[str, Any]:
    horizon_days = _horizon_to_days(horizon)
    history = fetch_history(symbol)
    features = engineer_features(history)
    scaled, _scaler = scale_feature_window(features, FEATURE_COLUMNS)
    current_price = float(features["Close"].iloc[-1])

    prophet = forecast_with_prophet(features, horizon_days)
    model, rmse = train_or_load_lstm(symbol, scaled, FEATURE_COLUMNS, CACHE_DIR, epochs=3)
    lstm_scaled = predict_lstm(model, scaled, FEATURE_COLUMNS, horizon_days)
    close_min = float(features["Close"].min())
    close_max = float(features["Close"].max())
    lstm_prices = [close_min + value * (close_max - close_min) for value in lstm_scaled]
    predicted = combine_predictions(prophet["prediction"], lstm_prices, None, rmse)
    signal = classify_signal(current_price, predicted, features, horizon)

    return {
        "signal": signal.signal,
        "confidence_pct": signal.confidence_pct,
        "predicted_prices": [round(price, 2) for price in predicted],
        "band_upper": [round(price, 2) for price in prophet["upper"]],
        "band_lower": [round(price, 2) for price in prophet["lower"]],
        "reasoning": signal.reasoning,
        "current_price": round(current_price, 2),
        "horizon_days": horizon_days,
        "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    }


@app.get("/health")
async def health() -> dict[str, Any]:
    try:
        await redis_client.ping()
        redis_status = "ok"
    except Exception:
        redis_status = "unavailable"
    loaded_models = len(list(CACHE_DIR.glob("*_lstm.pt")))
    return {"status": "ok", "redis": redis_status, "modelsLoaded": loaded_models > 0, "loadedModelCount": loaded_models}


@app.get("/quote/{symbol}")
async def quote(symbol: str) -> dict[str, Any]:
    cache_key = f"quote:{symbol.upper()}"
    cached = await _get_cached_json(cache_key)
    if cached is not None:
        return cached
    try:
        result = await asyncio.to_thread(fetch_quote, symbol)
    except SymbolNotFoundError as error:
        raise HTTPException(status_code=404, detail={"error": "Symbol not found"}) from error
    payload = result.__dict__
    await _set_cached_json(cache_key, payload, 60)
    return payload


@app.get("/predict/{symbol}")
async def predict(symbol: str, horizon: str = Query(default="7d")) -> dict[str, Any]:
    try:
        _horizon_to_days(horizon)
    except InvalidHorizonError as error:
        raise HTTPException(status_code=422, detail={"error": str(error)}) from error
    cache_key = f"ml:predict:{symbol.upper()}:{horizon}"
    cached = await _get_cached_json(cache_key)
    if cached is not None:
        return cached
    try:
        payload = await asyncio.to_thread(_predict_blocking, symbol, horizon)
    except SymbolNotFoundError as error:
        raise HTTPException(status_code=404, detail={"error": "Symbol not found"}) from error
    except InsufficientHistoryError as error:
        raise HTTPException(status_code=422, detail={"error": "Insufficient history"}) from error
    except InvalidHorizonError as error:
        raise HTTPException(status_code=422, detail={"error": str(error)}) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail={"error": "Prediction failed gracefully"}) from error
    await _set_cached_json(cache_key, payload, 4 * 60 * 60)
    return payload


@app.get("/sentiment/{symbol}")
async def sentiment(symbol: str) -> dict[str, Any]:
    cache_key = f"ml:sentiment:{symbol.upper()}"
    cached = await _get_cached_json(cache_key)
    if cached is not None:
        return cached
    payload = await score_sentiment(symbol.upper())
    await _set_cached_json(cache_key, payload, 60 * 60)
    return payload


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
