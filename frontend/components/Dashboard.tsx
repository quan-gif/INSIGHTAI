'use client'

import React, { useState, useRef } from 'react'
import {
  FileText, ThumbsUp, ThumbsDown, Minus, AlertTriangle,
  TrendingUp, TrendingDown, History, Settings, X,
  Upload, CheckCircle2, Users, Share2, Table, Download,
  BarChart3, Sparkles
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts'
import Chatbot from './chatbot'

// ==================== TYPES ====================
interface SentimentCounts {
  POSITIVE: number
  NEGATIVE: number
  NEUTRAL: number
}

interface ReviewDetail {
  review: string
  sentiment: string
  score: number
}

interface AnalysisResult {
  sentiment_counts: SentimentCounts
  details: ReviewDetail[]
  top_keywords: string[]
  total_reviews: number
  summary?: string
}

interface HistoryItem {
  id: string
  fileName: string
  date: string
  reviewCount: number
  sentiment: string
  fullData: AnalysisResult
}

// ==================== API ====================
const API_BASE = 'http://localhost:8000'

const analyzeCSV = async (file: File): Promise<AnalysisResult> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/api/v1/reviews/analyze-csv`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    try {
      const error = JSON.parse(text)
      throw new Error(error.detail || `Lỗi ${response.status}`)
    } catch {
      throw new Error(`Lỗi ${response.status}: ${text.slice(0, 150)}`)
    }
  }

  return response.json()
}

// ==================== HELPERS ====================
const getSentimentLabel = (counts: SentimentCounts): string => {
  const pos = counts.POSITIVE || 0
  const neg = counts.NEGATIVE || 0
  const neu = counts.NEUTRAL || 0
  const max = Math.max(pos, neg, neu)
  if (max === pos) return 'Tích cực'
  if (max === neg) return 'Tiêu cực'
  return 'Trung lập'
}

const getSentimentColor = (label: string): string => {
  if (label === 'Tích cực') return 'bg-green-100 text-green-700'
  if (label === 'Tiêu cực') return 'bg-red-100 text-red-700'
  return 'bg-yellow-100 text-yellow-700'
}

const calculateIssueData = (details: ReviewDetail[]) => {
  if (!details || details.length === 0) return []
  const negReviews = details
    .filter((d) => d.sentiment === 'NEGATIVE')
    .map((d) => d.review.toLowerCase())

  const keywords: Record<string, string[]> = {
    'Chất lượng': ['chất lượng', 'kém', 'lỗi', 'hỏng', 'bung'],
    'Giao hàng': ['giao hàng', 'ship', 'vận chuyển'],
    'Đóng gói': ['đóng gói', 'bao bì', 'hộp', 'móp'],
    'Pin': ['pin', 'sạc', 'tụt pin', 'hao pin'],
    'Hiệu năng': ['chậm', 'lag', 'giật', 'đơ'],
    'Camera': ['camera', 'chụp ảnh', 'mờ'],
  }

  return Object.entries(keywords)
    .map(([name, words]) => ({
      name,
      value: negReviews.filter((r) => words.some((w) => r.includes(w))).length,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
}

const calculateStrengthData = (details: ReviewDetail[]) => {
  if (!details || details.length === 0) return []
  const posReviews = details
    .filter((d) => d.sentiment === 'POSITIVE')
    .map((d) => d.review.toLowerCase())

  const keywords: Record<string, string[]> = {
    'Chất lượng tốt': ['chất lượng', 'tốt', 'đẹp', 'bền'],
    'Giao hàng nhanh': ['giao hàng nhanh', 'ship nhanh', 'nhanh'],
    'Pin trâu': ['pin trâu', 'pin lâu', 'pin ổn'],
    'Hiệu năng mượt': ['mượt', 'nhanh', 'ổn định'],
    'Camera đẹp': ['camera', 'chụp ảnh', 'đẹp'],
    'Giá hợp lý': ['giá', 'hợp lý', 'rẻ'],
  }

  return Object.entries(keywords)
    .map(([name, words]) => ({
      name,
      value: posReviews.filter((r) => words.some((w) => r.includes(w))).length,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
}

// ==================== KPI CARD ====================
const KPICard = ({
  icon,
  value,
  label,
  color,
  percent,
}: {
  icon: React.ReactNode
  value: number
  label: string
  color: 'gray' | 'green' | 'red' | 'yellow'
  percent?: number
}) => {
  const colors = {
    gray: { bg: 'bg-gray-50', text: 'text-gray-900', icon: 'text-gray-600' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-700' },
    red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600' },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      icon: 'text-yellow-600',
    },
  }
  const c = colors[color]

  return (
    <div
      className={`${c.bg} rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow`}
    >
      <div className={`${c.icon} mb-2`}>{icon}</div>
      <div className={`text-3xl font-bold ${c.text}`}>{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
      {percent !== undefined && (
        <div className="text-xs text-gray-500 mt-1">{percent}%</div>
      )}
    </div>
  )
}

// ==================== HISTORY ITEM ====================
const HistoryItemRow = ({
  item,
  isActive,
  onClick,
  onDelete,
}: {
  item: HistoryItem
  isActive: boolean
  onClick: () => void
  onDelete: () => void
}) => {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowConfirm(true)
  }

  return (
    <>
      <div
        onClick={onClick}
        className={`group relative p-4 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
          isActive
            ? 'bg-green-50 border-l-4 border-green-600'
            : 'hover:bg-gray-50 border-l-4 border-transparent'
        }`}
      >
        <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0 pr-6">
          <p className="font-medium text-gray-900 truncate text-sm">
            {item.fileName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {item.date} · {item.reviewCount} review
          </p>
          <span
            className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(
              item.sentiment
            )}`}
          >
            {item.sentiment}
          </span>
        </div>
        <button
          onClick={handleDeleteClick}
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
          title="Xóa khỏi lịch sử"
        >
          <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-600" />
        </button>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 mb-2 text-lg">
              Xóa khỏi lịch sử?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc muốn xóa "<strong>{item.fileName}</strong>" khỏi lịch
              sử phân tích?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowConfirm(false)
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium text-sm"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ==================== MAIN DASHBOARD ====================
export default function Dashboard() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'history' | 'trend' | 'settings'>(
    'history'
  )
  const [showExportModal, setShowExportModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSentiment, setFilterSentiment] = useState('ALL')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await analyzeCSV(selectedFile)
      setResult(data)

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        fileName: selectedFile.name,
        date: new Date().toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        reviewCount: data.total_reviews,
        sentiment: getSentimentLabel(data.sentiment_counts),
        fullData: data,
      }
      setHistory((prev) => [newItem, ...prev])
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHistory = (id: string) => {
    const deleted = history.find((h) => h.id === id)
    setHistory((prev) => prev.filter((item) => item.id !== id))
    if (deleted && result === deleted.fullData) setResult(null)
  }

  // ===== XUẤT PDF =====
  const handleExportPDF = () => {
    setShowExportModal(false)
    setTimeout(() => {
      window.print()
    }, 300)
  }

  // ===== TÍNH TOÁN =====
  const counts = result?.sentiment_counts || {
    POSITIVE: 0,
    NEGATIVE: 0,
    NEUTRAL: 0,
  }
  const total = result?.total_reviews || 0
  const positive = counts.POSITIVE || 0
  const negative = counts.NEGATIVE || 0
  const neutral = counts.NEUTRAL || 0
  const posPct = total > 0 ? Math.round((positive / total) * 100) : 0
  const negPct = total > 0 ? Math.round((negative / total) * 100) : 0
  const neuPct = total > 0 ? Math.round((neutral / total) * 100) : 0

  const issueData = result ? calculateIssueData(result.details) : []
  const strengthData = result ? calculateStrengthData(result.details) : []

  const chartData = [
    { name: 'Tích cực', value: positive, color: '#059669' },
    { name: 'Tiêu cực', value: negative, color: '#DC2626' },
    { name: 'Trung lập', value: neutral, color: '#D97706' },
  ].filter((d) => d.value > 0)

  const filteredDetails =
    result?.details.filter((item) => {
      const matchSearch = item.review
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchSent =
        filterSentiment === 'ALL' || item.sentiment === filterSentiment
      return matchSearch && matchSent
    }) || []

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition no-print"
              title="Mở lịch sử"
            >
              <History className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">
                Insight AI
              </h1>
              <p className="text-xs text-gray-500">
                Biến phản hồi thành hành động
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            disabled={!result}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed no-print"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 no-print"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-full sm:w-[380px] bg-white z-50 shadow-2xl flex flex-col no-print">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-green-700" />
                  {activeTab === 'history' && 'Lịch sử phân tích'}
                  {activeTab === 'trend' && 'Xu hướng tổng hợp'}
                  {activeTab === 'settings' && 'Cài đặt & Kết nối'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {activeTab === 'history' && 'Các báo cáo gần đây'}
                  {activeTab === 'trend' && 'Phân tích các lần gần nhất'}
                  {activeTab === 'settings' && 'Tùy chỉnh hệ thống'}
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <button
                onClick={() => {
                  setSidebarOpen(false)
                  fileInputRef.current?.click()
                }}
                className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-medium transition"
              >
                <Upload className="w-4 h-4" />
                Phân tích file mới
              </button>
            </div>

            <div className="px-4 py-3 flex gap-2 border-b border-gray-100">
              {[
                { key: 'history', label: 'Lịch sử', icon: History },
                { key: 'trend', label: 'Xu hướng', icon: TrendingUp },
                { key: 'settings', label: 'Cài đặt', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'history' && (
                <div className="space-y-2">
                  {history.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        Chưa có lịch sử phân tích
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Tải lên file đầu tiên để bắt đầu
                      </p>
                    </div>
                  ) : (
                    history.map((item) => (
                      <HistoryItemRow
                        key={item.id}
                        item={item}
                        isActive={result === item.fullData}
                        onClick={() => {
                          setResult(item.fullData)
                          setSidebarOpen(false)
                        }}
                        onDelete={() => handleDeleteHistory(item.id)}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'trend' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500">Tổng review</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {history.reduce((s, h) => s + h.reviewCount, 0)}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-xs text-green-700">Số lần phân tích</p>
                      <p className="text-2xl font-bold text-green-700 mt-1">
                        {history.length}
                      </p>
                    </div>
                  </div>
                  {history.length > 0 ? (
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 mb-3">
                        Xu hướng cảm xúc
                      </h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={history
                              .slice()
                              .reverse()
                              .map((h) => ({
                                name: h.date.split(' ')[0],
                                positive:
                                  h.fullData.sentiment_counts.POSITIVE,
                                negative:
                                  h.fullData.sentiment_counts.NEGATIVE,
                                neutral: h.fullData.sentiment_counts.NEUTRAL,
                              }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="positive"
                              stroke="#059669"
                              strokeWidth={2}
                              name="Tích cực"
                            />
                            <Line
                              type="monotone"
                              dataKey="negative"
                              stroke="#DC2626"
                              strokeWidth={2}
                              name="Tiêu cực"
                            />
                            <Line
                              type="monotone"
                              dataKey="neutral"
                              stroke="#D97706"
                              strokeWidth={2}
                              name="Trung lập"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      Cần ít nhất 1 lần phân tích để xem xu hướng
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngưỡng cảnh báo tiêu cực
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kết nối nguồn dữ liệu
                    </label>
                    <div className="space-y-2">
                      {['Shopee', 'TikTok Shop', 'Facebook'].map((p) => (
                        <div
                          key={p}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <span className="text-sm text-gray-700">{p}</span>
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                            Sắp ra mắt
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Users className="w-4 h-4" /> Thành viên nhóm
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="email@example.com"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">
                        Mời
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {!result && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Phân tích phản hồi khách hàng
              </h2>
              <p className="text-gray-600">
                Tải file CSV hoặc Excel để Insight AI tìm ra những điểm nổi bật
                trong trải nghiệm khách hàng.
              </p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-green-600 hover:bg-green-50/30 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-green-700" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                Kéo thả file vào đây
              </p>
              <p className="text-sm text-gray-500">
                hoặc nhấn để chọn file từ máy tính
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Hỗ trợ: .csv, .xlsx, .xls (cần cột "review")
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
                  >
                    Chọn lại
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium text-sm transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang phân tích...
                      </>
                    ) : (
                      'Phân tích ngay'
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-6" id="report-content">
            <div className="flex items-center justify-between no-print">
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" /> Báo cáo phân tích
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Toàn cảnh phản hồi khách hàng
                </h2>
              </div>
              <button
                onClick={() => {
                  setResult(null)
                  setSelectedFile(null)
                }}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 no-print"
              >
                <X className="w-4 h-4" /> Phân tích file khác
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-700" />
                Tóm tắt nhanh
              </h3>

              {result.summary && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                  <p className="text-sm font-medium text-green-900 flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" /> Nhận định từ AI
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              )}

              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-700 font-bold mt-0.5">•</span>
                  <span>
                    <strong>{posPct}%</strong> khách hàng hài lòng ({positive}/
                    {total} phản hồi tích cực).
                  </span>
                </li>
                {negative > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>
                      Vấn đề lớn nhất:{' '}
                      <strong>
                        {issueData[0]?.name.toUpperCase() || 'CHƯA XÁC ĐỊNH'}
                      </strong>{' '}
                      - {issueData[0]?.value || 0} phản hồi tiêu cực.
                    </span>
                  </li>
                )}
                {positive > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-700 font-bold mt-0.5">•</span>
                    <span>
                      Điểm mạnh:{' '}
                      <strong>
                        {strengthData[0]?.name.toUpperCase() ||
                          'CHƯA XÁC ĐỊNH'}
                      </strong>{' '}
                      - {strengthData[0]?.value || 0} lời khen (
                      {positive > 0
                        ? Math.round(
                            ((strengthData[0]?.value || 0) / positive) * 100
                          )
                        : 0}
                      % tích cực).
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 font-bold mt-0.5">•</span>
                  <span>
                    Tỉ lệ tiêu cực: <strong>{negPct}%</strong>
                    {negPct > 20 ? (
                      <span className="text-red-600">
                        {' '}
                        - vượt ngưỡng cảnh báo (20%)
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {' '}
                        - dưới ngưỡng cảnh báo (20%)
                      </span>
                    )}
                    .
                  </span>
                </li>
              </ul>
            </div>

            {negPct > 20 && (
              <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">Cảnh báo</h3>
                    <p className="text-red-800 text-sm">
                      Tỉ lệ tiêu cực <strong>{negPct}%</strong> vượt ngưỡng an
                      toàn (20%). Cần cải thiện gấp các vấn đề về{' '}
                      <strong>
                        {issueData
                          .slice(0, 2)
                          .map((i) => i.name)
                          .join(', ')}
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard
                icon={<FileText className="w-5 h-5" />}
                value={total}
                label="Tổng phản hồi"
                color="gray"
              />
              <KPICard
                icon={<ThumbsUp className="w-5 h-5" />}
                value={positive}
                label="Tích cực"
                color="green"
                percent={posPct}
              />
              <KPICard
                icon={<ThumbsDown className="w-5 h-5" />}
                value={negative}
                label="Tiêu cực"
                color="red"
                percent={negPct}
              />
              <KPICard
                icon={<Minus className="w-5 h-5" />}
                value={neutral}
                label="Trung lập"
                color="yellow"
                percent={neuPct}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" /> Việc cần
                  làm ngay
                </h3>
                <div className="space-y-3">
                  {issueData.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-600"
                    >
                      <span className="text-2xl font-bold text-red-300 flex-shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          Cải thiện {item.name.toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.value} phản hồi tiêu cực
                          {negative > 0
                            ? ` (chiếm ${Math.round(
                                (item.value / negative) * 100
                              )}% tiêu cực)`
                            : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  {issueData.length === 0 && (
                    <p className="text-gray-500 text-sm italic">
                      Chưa phát hiện vấn đề nghiêm trọng
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-700" /> Điểm mạnh
                  cần phát huy
                </h3>
                <div className="space-y-3">
                  {strengthData.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-700"
                    >
                      <span className="text-2xl font-bold text-green-300 flex-shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          Phát huy {item.name.toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.value} lời khen
                          {positive > 0
                            ? ` (chiếm ${Math.round(
                                (item.value / positive) * 100
                              )}% tích cực)`
                            : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  {strengthData.length === 0 && (
                    <p className="text-gray-500 text-sm italic">
                      Chưa phát hiện điểm mạnh nổi bật
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Phân loại cảm xúc
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ percent }) =>
                          percent && percent > 0.05
                            ? `${(percent * 100).toFixed(0)}%`
                            : ''
                        }
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        formatter={(value) => {
                          const item = chartData.find((d) => d.name === value)
                          return `${value}: ${item?.value || 0}`
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Chủ đề cần chú ý
                </h3>
                <div className="h-72">
                  {issueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={issueData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={90}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="value"
                          radius={[0, 8, 8, 0]}
                          barSize={28}
                          fill="#059669"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-12">
                      Không có chủ đề tiêu cực nào đáng chú ý
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <h3 className="font-bold text-gray-900">Chi tiết đánh giá</h3>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto no-print">
                  <input
                    type="text"
                    placeholder="Tìm đánh giá..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex-1 sm:flex-initial focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                  <select
                    value={filterSentiment}
                    onChange={(e) => setFilterSentiment(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="POSITIVE">Tích cực</option>
                    <option value="NEGATIVE">Tiêu cực</option>
                    <option value="NEUTRAL">Trung lập</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        #
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        Nội dung review
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">
                        Cảm xúc
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">
                        Độ tin cậy
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDetails.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.review}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              item.sentiment === 'POSITIVE'
                                ? 'bg-green-100 text-green-800'
                                : item.sentiment === 'NEGATIVE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {item.sentiment === 'POSITIVE'
                              ? 'Tích cực'
                              : item.sentiment === 'NEGATIVE'
                              ? 'Tiêu cực'
                              : 'Trung lập'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500">
                          {(item.score * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredDetails.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Không tìm thấy review nào phù hợp
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showExportModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 no-print"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Xuất báo cáo</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50/30 transition text-left"
              >
                <FileText className="w-6 h-6 text-green-700" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Xuất PDF</p>
                  <p className="text-xs text-gray-500">
                    Báo cáo đầy đủ, sẵn sàng in
                  </p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  alert('Tính năng đang phát triển')
                  setShowExportModal(false)
                }}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50/30 transition text-left"
              >
                <Table className="w-6 h-6 text-gray-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Xuất Excel</p>
                  <p className="text-xs text-gray-500">
                    Dữ liệu chi tiết dạng bảng
                  </p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Đã sao chép link!')
                  setShowExportModal(false)
                }}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50/30 transition text-left"
              >
                <Share2 className="w-6 h-6 text-gray-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Chia sẻ link</p>
                  <p className="text-xs text-gray-500">
                    Tạo link chia sẻ cho team
                  </p>
                </div>
                <Share2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {result && <Chatbot analysisData={result} />}
    </div>
  )
}







