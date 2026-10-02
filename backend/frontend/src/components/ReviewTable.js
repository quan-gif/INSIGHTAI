import React, { useState } from 'react';

const SENTIMENT_COLORS = {
  POSITIVE: 'text-positive bg-green-50 border-green-200',
  NEGATIVE: 'text-negative bg-red-50 border-red-200',
  NEUTRAL: 'text-neutral bg-yellow-50 border-yellow-200',
};

const SENTIMENT_LABELS = {
  POSITIVE: 'Tích cực',
  NEGATIVE: 'Tiêu cực',
  NEUTRAL: 'Trung lập',
};

const ReviewTable = ({ details }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('ALL');

  if (!details || details.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Không có review để hiển thị
      </div>
    );
  }

  const filtered = details.filter((item) => {
    const matchSearch = item.review
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchSentiment =
      filterSentiment === 'ALL' || item.sentiment === filterSentiment;
    return matchSearch && matchSentiment;
  });

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <h3 className="text-lg font-semibold text-gray-700">
          Chi tiết review ({filtered.length}/{details.length})
        </h3>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent flex-1 sm:flex-initial"
          />
          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ALL">Tất cả</option>
            <option value="POSITIVE">Tích cực</option>
            <option value="NEGATIVE">Tiêu cực</option>
            <option value="NEUTRAL">Trung lập</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th className="px-4 py-3 text-left font-semibold">Review</th>
              <th className="px-4 py-3 text-center font-semibold">Cảm xúc</th>
              <th className="px-4 py-3 text-center font-semibold">Độ tin cậy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                <td className="px-4 py-3 max-w-xs truncate" title={item.review}>
                  {item.review}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${SENTIMENT_COLORS[item.sentiment] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {SENTIMENT_LABELS[item.sentiment] || item.sentiment}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {(item.score * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          Không tìm thấy review nào phù hợp
        </div>
      )}
    </div>
  );
};

export default ReviewTable;