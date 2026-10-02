export type Sentiment = 'Tích cực' | 'Tiêu cực' | 'Trung tính'

export type Review = {
  id: number
  content: string
  sentiment: Sentiment
  confidence: number
  topic: string
  date: string
}

const rows: Array<[string, Sentiment, number, string]> = [
  ['Sản phẩm đóng gói rất cẩn thận, chất lượng đúng như mô tả.', 'Tích cực', 96, 'Đóng gói'],
  ['Nhân viên tư vấn nhiệt tình, sẽ tiếp tục ủng hộ shop.', 'Tích cực', 91, 'CSKH'],
  ['Mẫu mã đẹp, dùng rất tốt và đáng tiền.', 'Tích cực', 89, 'Chất lượng'],
  ['Chất lượng sản phẩm vượt mong đợi, rất hài lòng.', 'Tích cực', 97, 'Chất lượng'],
  ['Đóng gói chắc chắn, sản phẩm nguyên vẹn khi nhận.', 'Tích cực', 94, 'Đóng gói'],
  ['Shop phản hồi nhanh và hỗ trợ đổi size rất thuận tiện.', 'Tích cực', 86, 'CSKH'],
  ['Màu sắc đẹp hơn hình, chất liệu mềm mại.', 'Tích cực', 93, 'Màu sắc'],
  ['Giá hợp lý so với chất lượng sản phẩm.', 'Tích cực', 88, 'Chất lượng'],
  ['Đơn hàng giao quá chậm, phải chờ gần một tuần.', 'Tiêu cực', 95, 'Giao hàng'],
  ['Sản phẩm bị móp khi nhận, đóng gói cần cải thiện.', 'Tiêu cực', 82, 'Đóng gói'],
  ['Phản hồi tin nhắn hơi lâu, mong shop hỗ trợ nhanh hơn.', 'Tiêu cực', 79, 'CSKH'],
  ['Màu thực tế hơi khác so với hình ảnh.', 'Tiêu cực', 84, 'Màu sắc'],
  ['Giao hàng chậm hơn dự kiến khá nhiều.', 'Tiêu cực', 81, 'Giao hàng'],
  ['Sản phẩm dùng được, không có gì đặc biệt.', 'Trung tính', 77, 'Chất lượng'],
  ['Đúng mẫu đã đặt, thời gian giao hàng bình thường.', 'Trung tính', 74, 'Giao hàng'],
  ['Chất lượng ổn trong tầm giá.', 'Trung tính', 72, 'Chất lượng'],
]

export const sampleReviews: Review[] = rows.map(([content, sentiment, confidence, topic], index) => ({ id: index + 1, content, sentiment, confidence, topic, date: `15/09/2026 ${String(7 + Math.floor(index / 4)).padStart(2, '0')}:${String(18 + index).padStart(2, '0')}` }))
export const sentimentData = [{ name: 'Tích cực', value: 8, fill: '#059669' }, { name: 'Tiêu cực', value: 5, fill: '#E15757' }, { name: 'Trung tính', value: 3, fill: '#D97706' }]
export const issueData = [{ name: 'Giao hàng', value: 20 }, { name: 'Đóng gói', value: 20 }, { name: 'CSKH', value: 20 }, { name: 'Màu sắc', value: 20 }]
export const trendData = [
  { day: 'T2', positive: 48, negative: 31, neutral: 21, reviews: 12 }, { day: 'T3', positive: 52, negative: 29, neutral: 19, reviews: 14 }, { day: 'T4', positive: 49, negative: 32, neutral: 19, reviews: 11 }, { day: 'T5', positive: 55, negative: 27, neutral: 18, reviews: 16 }, { day: 'T6', positive: 50, negative: 31, neutral: 19, reviews: 13 }, { day: 'T7', positive: 53, negative: 29, neutral: 18, reviews: 15 }, { day: 'CN', positive: 50, negative: 31, neutral: 19, reviews: 16 },
]
export const history = [
  { id: 'sample-reviews', file: 'sample_reviews.xlsx', date: '15/09/2026 07:18', sentiment: 'Tích cực', reviews: 16 },
  { id: 'feedback-thang-8', file: 'feedback_thang_8.csv', date: '01/09/2026 16:42', sentiment: 'Tích cực', reviews: 42 },
  { id: 'reviews-campaign', file: 'reviews_campaign.csv', date: '22/08/2026 09:30', sentiment: 'Trung tính', reviews: 28 },
  { id: 'customer-voice', file: 'customer_voice.xlsx', date: '14/08/2026 11:05', sentiment: 'Tiêu cực', reviews: 35 },
  { id: 'q2-feedback', file: 'q2_feedback.csv', date: '30/06/2026 18:12', sentiment: 'Tích cực', reviews: 86 },
]
export const formatPercent = (value: number) => `${value}%`
