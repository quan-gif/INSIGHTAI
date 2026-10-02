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
uvicorn main:app --reload --host 0.0.0.0 --port 8000

## Cách chạy Frontend

cd frontend
npm install
npm run dev
# Mở http://localhost:3000

## Công nghệ sử dụng

- Backend: FastAPI, Python 3.10, PhoBERT, DeepSeek API
- Frontend: React, Next.js, Tailwind CSS, Recharts
- Triển khai: Docker

## Nhóm thực hiện

Nhóm Greater Will - Cuộc thi R&D to Startup 2026
- Dương Minh Quân (Nhóm trưởng, Tech Lead)
- Minh Ngọc (Business)
- Từ Vĩnh Quý (Design)