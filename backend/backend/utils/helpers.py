import pandas as pd
from typing import List
import io
import logging

logger = logging.getLogger(__name__)

def read_reviews_from_csv(file_content: bytes, filename: str = "file.csv") -> List[str]:
    """
    Đọc file CSV hoặc Excel, tự động phát hiện định dạng.
    """
    try:
        if filename.lower().endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file_content))
            logger.info(f"📄 Đọc file CSV: {filename}")
        elif filename.lower().endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(file_content))
            logger.info(f"📄 Đọc file Excel: {filename}")
        else:
            raise ValueError("Định dạng file không hỗ trợ. Chỉ chấp nhận .csv, .xlsx, .xls")
        
        logger.info(f"📊 File có {len(df)} dòng, các cột: {list(df.columns)}")
        
        # Danh sách các tên cột có thể chứa review
        possible_cols = [
            'review', 'Review', 'comment', 'Comment',
            'feedback', 'Feedback', 'nội dung', 'bình luận',
            'content', 'Content', 'text', 'Text', 'đánh giá', 'Đánh giá'
        ]
        
        col = None
        for c in possible_cols:
            if c in df.columns:
                col = c
                break
        
        if col is None:
            raise ValueError(
                f"Không tìm thấy cột chứa review. Các cột hiện có: {list(df.columns)}"
            )
        
        reviews = df[col].dropna().astype(str).tolist()
        reviews = [r.strip() for r in reviews if r.strip()]
        
        if not reviews:
            raise ValueError("File không chứa review hợp lệ (cột review bị trống)")
        
        logger.info(f"✅ Đọc thành công {len(reviews)} review từ cột '{col}'")
        return reviews
        
    except pd.errors.EmptyDataError:
        raise ValueError("File trống hoặc không có dữ liệu")
    except Exception as e:
        logger.error(f"❌ Lỗi khi đọc file: {e}")
        raise ValueError(f"Không thể đọc file: {str(e)}")

def handle_error(e: Exception) -> dict:
    """Chuyển đổi exception thành dict lỗi."""
    return {
        "error": str(type(e).__name__),
        "detail": str(e)
    }

def validate_reviews(reviews: List[str]) -> bool:
    """Kiểm tra danh sách review có hợp lệ không."""
    return bool(reviews) and all(isinstance(r, str) for r in reviews)