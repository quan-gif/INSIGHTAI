from transformers import pipeline
from sklearn.feature_extraction.text import CountVectorizer
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

# Stopwords tiếng Việt cơ bản
VIETNAMESE_STOPWORDS = [
    "và", "của", "một", "các", "được", "có", "trong", "cho", "với",
    "nhưng", "vì", "nên", "rất", "quá", "thì", "là", "ở", "tại", "từ",
    "vào", "ra", "đã", "sẽ", "đang", "cũng", "nếu", "khi", "để", "bị",
    "không", "như", "này", "kia", "ấy", "đó", "nào", "cả", "mỗi", "mọi"
]

class SentimentAnalyzer:
    """
    Phân tích cảm xúc cho review tiếng Việt dùng PhoBERT.
    """
    
    def __init__(self):
        logger.info("🔄 Đang tải mô hình PhoBERT... (lần đầu có thể mất vài phút)")
        try:
            self.classifier = pipeline(
                "text-classification",
                model="mr4/phobert-base-vi-sentiment-analysis",
                device=-1  # Dùng CPU
            )
            logger.info("✅ Đã tải xong model phân tích cảm xúc!")
        except Exception as e:
            logger.error(f"❌ Lỗi khi tải model: {e}")
            raise
        
        self.vectorizer = CountVectorizer(
            ngram_range=(1, 2),
            max_features=100,
            stop_words=VIETNAMESE_STOPWORDS,
            min_df=2
        )
        logger.info("✅ CountVectorizer đã sẵn sàng!")
    
    def analyze(self, text: str) -> dict:
       if not text or len(text.strip()) < 3:
        return {"label": "NEU", "score": 0.5}
    
       try:
        result = self.classifier(text)[0]
        raw_label = result['label']
        
        # 🔧 MAPPING: Model trả về tiếng Việt có dấu
        LABEL_FIX = {
            "Tích cực": "POS",
            "Tiêu cực": "NEG",
            "Trung lập": "NEU",
            # Backup cho các trường hợp khác
            "POSITIVE": "POS",
            "NEGATIVE": "NEG",
            "NEUTRAL": "NEU",
            "POS": "POS",
            "NEG": "NEG",
            "NEU": "NEU",
            "LABEL_0": "NEG",
            "LABEL_1": "POS",
            "LABEL_2": "NEU",
        }
        
        # Chuẩn hóa: strip() để bỏ khoảng trắng thừa
        fixed_label = LABEL_FIX.get(raw_label.strip(), "NEU")
        
        return {
            "label": fixed_label,
            "score": result['score']
        }
       except Exception as e:
        logger.warning(f"⚠️ Lỗi khi phân tích: {e}")
        return {"label": "NEU", "score": 0.5}
    
    def analyze_batch(self, reviews: List[str]) -> List[dict]:
        """Phân tích nhiều review cùng lúc."""
        logger.info(f"📊 Bắt đầu phân tích {len(reviews)} review...")
        results = []
        for i, review in enumerate(reviews):
            if i % 50 == 0:
                logger.info(f"⏳ Đã xử lý {i}/{len(reviews)} review...")
            results.append(self.analyze(review))
        logger.info(f"✅ Phân tích hoàn tất!")
        return results
    
    def extract_keywords(self, reviews: List[str], top_n: int = 10) -> List[str]:
        """Trích xuất từ khóa xuất hiện nhiều nhất."""
        if not reviews:
            return []
        
        try:
            X = self.vectorizer.fit_transform(reviews)
            terms = self.vectorizer.get_feature_names_out()
            sums = X.sum(axis=0).A1
            top_indices = sums.argsort()[-top_n:][::-1]
            keywords = [terms[i] for i in top_indices if sums[i] > 0]
            logger.info(f"🔑 Đã trích xuất {len(keywords)} từ khóa")
            return keywords
        except Exception as e:
            logger.warning(f"⚠️ Lỗi khi trích xuất từ khóa: {e}")
            return []