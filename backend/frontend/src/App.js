import React, { useState } from 'react';
import { analyzeCSV } from './services/api';
import UploadSection from './components/UploadSection';
import KPICards from './components/KPICards';
import SentimentChart from './components/SentimentChart';
import ReviewTable from './components/ReviewTable';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileAccepted = (acceptedFile) => {
    setFile(acceptedFile);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeCSV(file);
      setResult(data);
    } catch (err) {
      console.error('Lỗi:', err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Không thể kết nối đến server. Vui lòng kiểm tra backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const topKeywords = result?.top_keywords || [];

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary inline-flex items-center gap-2">
            <span>🧠</span> Insight AI
          </h1>
          <p className="text-gray-600 mt-1 text-lg">
            Phân tích cảm xúc khách hàng – Nhanh, trực quan, miễn phí dùng thử
          </p>
        </header>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <UploadSection
            onFileAccepted={handleFileAccepted}
            isAnalyzing={loading}
          />
          {file && (
            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Đã chọn:</span>
                <span className="bg-blue-50 px-3 py-1 rounded-full text-primary truncate max-w-xs">
                  {file.name}
                </span>
                <span className="text-gray-400">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetAll}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Chọn lại
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang phân tích...
                    </>
                  ) : (
                    '🚀 Phân tích ngay'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="font-medium">Lỗi</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <KPICards data={result} />

            {/* Chart & Keywords */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SentimentChart data={result} />
              </div>
              <div className="bg-white rounded-xl shadow-card p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  🔑 Từ khóa nổi bật
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topKeywords.length > 0 ? (
                    topKeywords.map((keyword, idx) => {
                      const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
                      return (
                        <span
                          key={idx}
                          className={`${sizes[idx % sizes.length]} font-medium px-3 py-1 bg-blue-50 text-primary rounded-full shadow-sm hover:shadow-md transition-shadow cursor-default`}
                        >
                          #{keyword}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-400 text-sm">Không tìm thấy từ khóa nổi bật</span>
                  )}
                </div>
              </div>
            </div>

            {/* Review Table */}
            <ReviewTable details={result.details} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-400 border-t border-gray-200 pt-6">
          Made with ❤️ by Insight AI Team &nbsp;|&nbsp; © 2026
          <br />
          <span className="text-xs">
            Phiên bản 1.0 &bull; Dự án tham gia Cuộc thi Sáng tạo trẻ Quốc gia AI 2026
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;