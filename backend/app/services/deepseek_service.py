import os
from openai import OpenAI
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

# Tải biến môi trường
load_dotenv()


class DeepSeekService:
    """Service gọi DeepSeek API để tạo tóm tắt thông minh."""

    def __init__(self):
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise ValueError("Chưa cấu hình DEEPSEEK_API_KEY trong file .env")

        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com",
        )

    def get_summary(self, reviews_text: str, sentiment_counts: dict) -> str:
        """
        Sử dụng DeepSeek để tạo tóm tắt nhanh cho chủ shop.

        Args:
            reviews_text: Một số review tiêu biểu (dạng text)
            sentiment_counts: Dict chứa số liệu tổng quan

        Returns:
            Chuỗi tóm tắt 2-3 câu
        """
        total = sentiment_counts.get("total_reviews", 0)
        pos = sentiment_counts.get("POSITIVE", 0)
        neg = sentiment_counts.get("NEGATIVE", 0)
        neu = sentiment_counts.get("NEUTRAL", 0)

        pos_pct = round(pos / total * 100) if total > 0 else 0
        neg_pct = round(neg / total * 100) if total > 0 else 0

        system_prompt = """
Bạn là chuyên gia phân tích dữ liệu cho các chủ shop online Việt Nam.
Dựa vào dữ liệu đánh giá khách hàng, hãy viết một đoạn tóm tắt ngắn gọn 2-3 câu,
nêu bật: tỷ lệ hài lòng, 1-2 vấn đề lớn nhất, và 1-2 điểm mạnh nổi bật nhất.
Sử dụng số liệu cụ thể để lập luận. Trả lời bằng tiếng Việt, giọng văn chuyên nghiệp.
"""

        user_prompt = f"""
Dữ liệu tổng quan:
- Tổng số đánh giá: {total}
- Tích cực: {pos} ({pos_pct}%)
- Tiêu cực: {neg} ({neg_pct}%)
- Trung lập: {neu}

Một số đánh giá tiêu biểu:
{reviews_text}

Hãy viết bản tóm tắt nhanh (2-3 câu) cho chủ shop.
"""

        try:
            response = self.client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                stream=False,
                temperature=0.5,
                max_tokens=300,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"❌ DeepSeek API error: {e}")
            raise
