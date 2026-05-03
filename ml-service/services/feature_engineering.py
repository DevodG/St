from __future__ import annotations

import pandas as pd
from sklearn.preprocessing import MinMaxScaler


def add_rsi(frame: pd.DataFrame, window: int = 14) -> pd.Series:
    delta = frame["Close"].diff()
    gain = delta.clip(lower=0).rolling(window).mean()
    loss = (-delta.clip(upper=0)).rolling(window).mean()
    relative_strength = gain / loss.replace(0, 1e-9)
    return 100 - (100 / (1 + relative_strength))


def add_macd(frame: pd.DataFrame) -> tuple[pd.Series, pd.Series]:
    ema12 = frame["Close"].ewm(span=12, adjust=False).mean()
    ema26 = frame["Close"].ewm(span=26, adjust=False).mean()
    macd = ema12 - ema26
    signal = macd.ewm(span=9, adjust=False).mean()
    return macd, signal


def engineer_features(frame: pd.DataFrame) -> pd.DataFrame:
    features = frame.copy()
    features["RSI"] = add_rsi(features)
    features["MACD"], features["MACDSignal"] = add_macd(features)
    features["SMA20"] = features["Close"].rolling(20).mean()
    rolling_std = features["Close"].rolling(20).std()
    features["BollingerUpper"] = features["SMA20"] + 2 * rolling_std
    features["BollingerLower"] = features["SMA20"] - 2 * rolling_std
    features["VolumeSMA20"] = features["Volume"].rolling(20).mean()
    features["Momentum5"] = features["Close"].pct_change(5)
    features["Momentum20"] = features["Close"].pct_change(20)
    return features.ffill().bfill().dropna().reset_index(drop=True)


def scale_feature_window(frame: pd.DataFrame, feature_columns: list[str]) -> tuple[pd.DataFrame, MinMaxScaler]:
    scaler = MinMaxScaler()
    scaled = frame.copy()
    train_end = max(1, int(len(frame) * 0.8))
    scaler.fit(frame.loc[: train_end - 1, feature_columns])
    scaled[feature_columns] = scaler.transform(frame[feature_columns])
    return scaled, scaler


def macd_bullish_crossover(frame: pd.DataFrame) -> bool:
    recent = frame.tail(4)
    if len(recent) < 4:
      return False
    previous = recent.iloc[-2]
    current = recent.iloc[-1]
    return bool(previous["MACD"] <= previous["MACDSignal"] and current["MACD"] > current["MACDSignal"])
