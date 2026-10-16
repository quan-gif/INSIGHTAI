# Insight AI

Nền tảng SaaS phân tích cảm xúc đánh giá khách hàng cho chủ shop online Việt Nam.

## Cấu trúc dự án

- `backend/`: FastAPI backend, mô hình AI PhoBERT, tích hợp DeepSeek API
- `frontend/`: React/Next.js dashboard

## Cách chạy Backend

cd backend
pip install -r requirements.txt
cp .env.example .env
# Điền DEEPSEEK_API_KEY vào file .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## Cách chạy Frontend

cd frontend
npm install
npm run dev
# Mở http://localhost:3000

## Công nghệ sử dụng

- Backend: FastAPI, Python 3.10, PhoBERT, DeepSeek API
- Frontend: React, Next.js, Tailwind CSS, Recharts
- Triển khai: Docker
## Nghiên cứu Fine-tune

Thư mục `notebooks/` chứa notebook quá trình fine-tune mô hình PhoBERT với bộ dữ liệu UIT-ViSFD. Đây là nghiên cứu so sánh giữa mô hình gốc và mô hình fine-tune.

Kết quả:
- Model gốc mr4/phobert-base-vi-sentiment-analysis: 100% chính xác trên 5 review test
- Model fine-tune: 20% chính xác trên cùng 5 review

Kết luận: Sản phẩm sử dụng model gốc để đảm bảo ổn định.

## Nhóm thực hiện

Nhóm Greater Will 

- Dương Minh Quân (Nhóm trưởng, Tech Lead)
- Từ Vĩnh Quý (Design)