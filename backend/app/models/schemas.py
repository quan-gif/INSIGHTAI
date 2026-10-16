from pydantic import BaseModel
from typing import List, Dict, Optional


class ReviewRequest(BaseModel):
    """Yêu cầu phân tích danh sách các review"""
    reviews: List[str]
    max_keywords: Optional[int] = 5


class SentimentResult(BaseModel):
    """Kết quả phân tích cảm xúc cho một review"""
    review: str
    sentiment: str   # POSITIVE, NEGATIVE, NEUTRAL
    score: float     # 0-1


class AnalyzeResponse(BaseModel):
    """Phản hồi tổng hợp cho toàn bộ phân tích"""
    sentiment_counts: Dict[str, int]
    details: List[SentimentResult]
    top_keywords: List[str]
    total_reviews: int
    summary: str = ""   # ← THÊM DÒNG NÀY (dùng default để không phá vỡ API cũ)