from __future__ import annotations

import random
import time
from dataclasses import dataclass

import pandas as pd
import yfinance as yf


class SymbolNotFoundError(ValueError):
    pass


class InsufficientHistoryError(ValueError):
    pass


@dataclass(frozen=True)
class Quote:
    symbol: str
    name: str
    priceCents: int
    changeCents: int
    changeBps: int
    volumeK: int
    marketCapCents: int
    sector: str
    timestamp: int


def _sleep_with_backoff(attempt: int) -> None:
    delay = min(30.0, float(2**attempt)) + random.uniform(0.0, 0.35)
    time.sleep(delay)


def fetch_history(symbol: str, period: str = "2y", interval: str = "1d", minimum_rows: int = 100) -> pd.DataFrame:
    ticker_symbol = symbol.upper().strip()
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            ticker = yf.Ticker(ticker_symbol)
            frame = ticker.history(period=period, interval=interval, auto_adjust=False)
            if frame.empty:
                raise SymbolNotFoundError(f"Symbol not found: {ticker_symbol}")
            frame = frame.reset_index()
            frame = frame.rename(columns={"Datetime": "Date"})
            required = ["Date", "Open", "High", "Low", "Close", "Volume"]
            frame = frame[required].copy()
            frame[required[1:]] = frame[required[1:]].ffill().bfill()
            if len(frame) < minimum_rows:
                raise InsufficientHistoryError(f"Insufficient history for {ticker_symbol}")
            return frame
        except (SymbolNotFoundError, InsufficientHistoryError):
            raise
        except Exception as error:
            last_error = error
            _sleep_with_backoff(attempt)
    raise RuntimeError(f"Failed to fetch history for {ticker_symbol}: {last_error}")


def fetch_quote(symbol: str) -> Quote:
    ticker_symbol = symbol.upper().strip()
    ticker = yf.Ticker(ticker_symbol)
    info = ticker.fast_info
    price = float(info.get("last_price") or info.get("lastPrice") or 0.0)
    previous_close = float(info.get("previous_close") or info.get("previousClose") or price)
    if price <= 0:
        history = fetch_history(ticker_symbol, period="5d", interval="1d", minimum_rows=2)
        price = float(history["Close"].iloc[-1])
        previous_close = float(history["Close"].iloc[-2])

    change = price - previous_close
    change_bps = int(round((change / previous_close) * 10_000)) if previous_close else 0
    metadata = ticker.get_info() or {}
    return Quote(
        symbol=ticker_symbol,
        name=str(metadata.get("shortName") or metadata.get("longName") or ticker_symbol),
        priceCents=int(round(price * 100)),
        changeCents=int(round(change * 100)),
        changeBps=change_bps,
        volumeK=int((info.get("last_volume") or metadata.get("volume") or 0) // 1000),
        marketCapCents=int((metadata.get("marketCap") or 0) * 100),
        sector=str(metadata.get("sector") or "Unknown"),
        timestamp=int(time.time() * 1000),
    )
