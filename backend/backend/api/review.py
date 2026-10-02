from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from models.schemas import AnalyzeResponse, SentimentResult, ReviewRequest
from services.nlp_service import SentimentAnalyzer
from services.deepseek_service import DeepSeekService
from utils.helpers import read_reviews_from_csv, handle_error, validate_reviews
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/reviews", tags=["reviews"])

# Mapping để chuẩn hóa nhãn từ model PhoBERT
LABEL_MAPPING = {
    "POS": "POSITIVE",
    "NEG": "NEGATIVE",
    "NEU": "NEUTRAL",
    "POSITIVE": "POSITIVE",
    "NEGATIVE": "NEGATIVE",
    "NEUTRAL": "NEUTRAL",
}

# Biến global để chỉ load model 1 lần
_nlp_service = None
_deepseek_service = None


def get_nlp_service() -> SentimentAnalyzer:
    """Dependency injection cho SentimentAnalyzer."""
    global _nlp_service
    if _nlp_service is None:
        logger.info("🔄 Khởi tạo SentimentAnalyzer...")
        _nlp_service = SentimentAnalyzer()
    return _nlp_service


def get_deepseek_service():
    """Dependency injection cho DeepSeekService."""
    global _deepseek_service
    if _deepseek_service is None:
        logger.info("🔄 Khởi tạo DeepSeekService...")
        try:
            _deepseek_service = DeepSeekService()
            logger.info("✅ DeepSeekService đã sẵn sàng!")
        except Exception as e:
            logger.warning(f"⚠️ Không thể khởi tạo DeepSeek: {e}")
            _deepseek_service = None
    return _deepseek_service


def _normalize_label(raw_label: str) -> str:
    """Chuẩn hóa nhãn từ model về dạng đầy đủ."""
    if not raw_label:
        return "NEUTRAL"
    return LABEL_MAPPING.get(raw_label.upper(), "NEUTRAL")


def _build_response(reviews, results, keywords, deepseek):
    """
    Tổng hợp kết quả phân tích thành AnalyzeResponse hoàn chỉnh.
    
    - Đếm đầy đủ counts cho TOÀN BỘ review
    - Chỉ trả về 50 chi tiết đầu tiên (giảm response size)
    - Gọi DeepSeek để tạo tóm tắt thông minh (nếu có)
    """
    # Đếm counts cho TOÀN BỘ review
    counts = {"POSITIVE": 0, "NEGATIVE": 0, "NEUTRAL": 0}
    details = []
    negative_samples = []
    positive_samples = []

    MAX_DETAILS = 50  # Chỉ trả 50 chi tiết để response nhỏ gọn

    for r, res in zip(reviews, results):
        label = _normalize_label(res.get("label", "NEUTRAL"))
        counts[label] = counts.get(label, 0) + 1

        # Chỉ append vào details nếu chưa đủ 50
        if len(details) < MAX_DETAILS:
            # Lưu mẫu review để gửi cho DeepSeek
            if label == "NEGATIVE" and len(negative_samples) < 5:
                negative_samples.append(r)
            elif label == "POSITIVE" and len(positive_samples) < 5:
                positive_samples.append(r)

            details.append(
                SentimentResult(
                    review=r[:200] + "..." if len(r) > 200 else r,
                    sentiment=label,
                    score=res.get("score", 0.5),
                )
            )

    # ===== TẠO TÓM TẮT BẰNG DEEPSEEK =====
    summary = ""
    if deepseek is not None:
        try:
            sample_reviews_text = "\n".join(
                [f"- {r}" for r in (negative_samples + positive_samples)]
            )
            summary_data = {
                "total_reviews": len(reviews),
                "POSITIVE": counts["POSITIVE"],
                "NEGATIVE": counts["NEGATIVE"],
                "NEUTRAL": counts["NEUTRAL"],
            }
            summary = deepseek.get_summary(
                reviews_text=sample_reviews_text,
                sentiment_counts=summary_data,
            )
            logger.info("✅ Đã tạo tóm tắt bằng DeepSeek")
        except Exception as e:
            logger.warning(f"⚠️ Lỗi DeepSeek, bỏ qua summary: {e}")
            summary = ""
    else:
        logger.info("ℹ️ DeepSeek không khả dụng, bỏ qua summary")

    # ===== TRẢ VỀ RESPONSE =====
    response = AnalyzeResponse(
        sentiment_counts=counts,
        details=details,
        top_keywords=keywords[:10],
        total_reviews=len(reviews),
        summary=summary,
    )
    return response


@router.post("/analyze-csv", response_model=AnalyzeResponse)
async def analyze_csv(
    file: UploadFile = File(...),
    service: SentimentAnalyzer = Depends(get_nlp_service),
    deepseek=Depends(get_deepseek_service),
):
    """
    Phân tích file CSV/Excel chứa cột review.

    - File phải có cột tên 'review', 'comment', hoặc tương tự
    - Trả về kết quả phân tích cảm xúc, từ khóa, và tóm tắt thông minh
    """
    try:
        # Kiểm tra định dạng file
        if not file.filename.lower().endswith((".csv", ".xlsx", ".xls")):
            raise HTTPException(
                status_code=400,
                detail="Chỉ hỗ trợ file CSV hoặc Excel (.csv, .xlsx, .xls)",
            )

        # Đọc nội dung file
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="File trống")

        # Trích xuất review từ file
        reviews = read_reviews_from_csv(content, file.filename)
        if not validate_reviews(reviews):
            raise HTTPException(status_code=400, detail="Danh sách review không hợp lệ")

        logger.info(f"📥 Nhận {len(reviews)} review từ file {file.filename}")

        # Phân tích cảm xúc
        results = service.analyze_batch(reviews)

        # Trích xuất từ khóa
        keywords = service.extract_keywords(reviews, top_n=10)

        # Tổng hợp và trả về
        response = _build_response(reviews, results, keywords, deepseek)

        logger.info(
            f"✅ Phân tích hoàn tất: POS={response.sentiment_counts['POSITIVE']}, "
            f"NEG={response.sentiment_counts['NEGATIVE']}, "
            f"NEU={response.sentiment_counts['NEUTRAL']}"
        )
        return response

    except ValueError as e:
        logger.warning(f"⚠️ Lỗi dữ liệu: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Lỗi server: {e}")
        raise HTTPException(status_code=500, detail=handle_error(e))


@router.post("/analyze-json", response_model=AnalyzeResponse)
async def analyze_json(
    request: ReviewRequest,
    service: SentimentAnalyzer = Depends(get_nlp_service),
    deepseek=Depends(get_deepseek_service),
):
    """
    Phân tích danh sách review từ JSON.

    - Gửi JSON với field 'reviews' là danh sách các review
    - Optional field 'max_keywords' để điều chỉnh số từ khóa
    """
    try:
        reviews = request.reviews
        if not reviews:
            raise HTTPException(status_code=400, detail="Danh sách review trống")

        if not validate_reviews(reviews):
            raise HTTPException(status_code=400, detail="Dữ liệu review không hợp lệ")

        logger.info(f"📥 Nhận {len(reviews)} review từ JSON")

        # Phân tích
        results = service.analyze_batch(reviews)
        keywords = service.extract_keywords(
            reviews, top_n=request.max_keywords or 10
        )

        # Tổng hợp và trả về
        response = _build_response(reviews, results, keywords, deepseek)

        logger.info("✅ Phân tích JSON hoàn tất")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Lỗi server: {e}")
        raise HTTPException(status_code=500, detail=handle_error(e))


from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    context: dict

@router.post("/chat")
async def chat_with_data(request: ChatRequest):
    """Chatbot trả lời câu hỏi về dữ liệu phân tích."""
    try:
        deepseek = get_deepseek_service()
        if deepseek is None:
            raise HTTPException(status_code=500, detail="Chatbot không khả dụng")

        context = request.context
        counts = context.get("sentiment_counts", {})
        keywords = context.get("top_keywords", [])
        total = context.get("total_reviews", 0)

        system_prompt = """Bạn là trợ lý phân tích dữ liệu cho chủ shop online Việt Nam.
Trả lời ngắn gọn, thân thiện, dựa trên số liệu được cung cấp.
Không bịa số liệu. Trả lời bằng tiếng Việt, tối đa 3-4 câu."""

        user_prompt = f"""Dữ liệu phân tích:
- Tổng review: {total}
- Tích cực: {counts.get('POSITIVE', 0)}
- Tiêu cực: {counts.get('NEGATIVE', 0)}
- Trung lập: {counts.get('NEUTRAL', 0)}
- Từ khóa nổi bật: {', '.join(keywords[:5])}

Câu hỏi: {request.question}

Trả lời ngắn gọn."""

        response = deepseek.client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=300,
        )

        return {"answer": response.choices[0].message.content.strip()}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        

        