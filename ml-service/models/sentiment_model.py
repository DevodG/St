from __future__ import annotations


async def score_sentiment(symbol: str) -> dict:
    """Lightweight async stub returning neutral sentiment.

    The real implementation would call an external API or a trained model.
    """
    return {"score": 0.0, "label": "neutral"}
