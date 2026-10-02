# 🧠 Insight AI

Công cụ phân tích cảm xúc tự động dành cho chủ shop online và doanh nghiệp nhỏ.

## 🚀 Tính năng
- 📤 Upload file CSV/Excel chứa đánh giá khách hàng
- 🤖 Phân tích cảm xúc (Tích cực/Tiêu cực/Trung lập)
- 🔑 Trích xuất từ khóa nổi bật
- 📊 Dashboard trực quan với biểu đồ
- 📥 Xuất báo cáo dạng JSON

## 🛠 Công nghệ
- Backend: FastAPI
- AI: PhoBERT (sentiment analysis)
- Dashboard: Streamlit
- Container: Docker

## 📦 Cài đặt

### Yêu cầu
- Python 3.10+
- Docker (optional)

### Cài đặt thủ công
```bash
# Clone dự án
git clone <repository-url>
cd insight-ai-engine

# Cài dependencies
pip install -r requirements.txt

# Chạy backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Chạy dashboard (terminal khác)
streamlit run dashboard.py