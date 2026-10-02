import React from 'react';

const KPICards = ({ data }) => {
  const { total_reviews, sentiment_counts } = data;
  const positive = sentiment_counts?.POSITIVE || 0;
  const negative = sentiment_counts?.NEGATIVE || 0;
  const neutral = sentiment_counts?.NEUTRAL || 0;

  const cards = [
    { label: 'Tổng số', value: total_reviews, icon: '📊', color: 'text-gray-700' },
    { label: 'Tích cực', value: positive, icon: '👍', color: 'text-positive' },
    { label: 'Tiêu cực', value: negative, icon: '👎', color: 'text-negative' },
    { label: 'Trung lập', value: neutral, icon: '😐', color: 'text-neutral' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow-card p-5 text-center border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-1">{card.icon}</div>
          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          <div className="text-sm text-gray-500">{card.label}</div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;