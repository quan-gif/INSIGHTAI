const API_BASE = 'http://localhost:8000'

export const analyzeCSV = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/api/v1/reviews/analyze-csv`, {
    method: 'POST',
    body: formData,
    headers: {
      // ✅ HEADER QUAN TRỌNG NHẤT - bỏ qua trang cảnh báo ngrok
      'ngrok-skip-browser-warning': 'true',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Có lỗi xảy ra' }))
    throw new Error(error.detail || `Lỗi ${response.status}`)
  }

  return response.json()
}




