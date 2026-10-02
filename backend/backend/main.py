from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.review import router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Insight AI",
    version="1.0.0",
    description="Phân tích cảm xúc review tiếng Việt"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router
app.include_router(router)

@app.get("/")
async def root():
    return {
        "message": "Chào mừng đến Insight AI API",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Insight AI đang chạy!", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)