'use client'

import React, { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

// ==================== TYPES ====================
interface AnalysisResult {
  sentiment_counts: {
    POSITIVE: number
    NEGATIVE: number
    NEUTRAL: number
  }
  top_keywords: string[]
  total_reviews: number
}

interface ChatMessage {
  role: 'user' | 'bot'
  content: string
}

// ==================== API ====================
const API_BASE = 'http://localhost:8000'

const askChatbot = async (
  question: string,
  context: any
): Promise<string> => {
  const response = await fetch(`${API_BASE}/api/v1/reviews/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context }),
  })

  if (!response.ok) {
    throw new Error('Chatbot không phản hồi')
  }

  const data = await response.json()
  return data.answer
}

// ==================== COMPONENT ====================
export default function Chatbot({
  analysisData,
}: {
  analysisData: AnalysisResult
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      content:
        'Xin chào! Tôi có thể giúp gì cho bạn về dữ liệu phân tích này?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const quickQuestions = [
    'Tại sao tỉ lệ tiêu cực cao?',
    'Điểm mạnh lớn nhất là gì?',
    'Nên cải thiện điều gì trước?',
  ]

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const answer = await askChatbot(question, {
        sentiment_counts: analysisData.sentiment_counts,
        top_keywords: analysisData.top_keywords,
        total_reviews: analysisData.total_reviews,
      })
      setMessages((prev) => [...prev, { role: 'bot', content: answer }])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-lg flex items-center justify-center transition z-40"
        title="Trợ lý AI"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-40 border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center">
              <span className="text-white text-sm font-bold">i</span>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">Trợ lý AI</p>
              <p className="text-xs text-gray-500">Hỏi về dữ liệu của bạn</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-2xl text-sm text-gray-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Hỏi về dữ liệu..."
              disabled={loading}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center justify-center disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
