import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = {
  POSITIVE: '#34A853',
  NEGATIVE: '#EA4335',
  NEUTRAL: '#FBBC04',
};

const SENTIMENT_LABELS = {
  POSITIVE: 'Tích cực',
  NEGATIVE: 'Tiêu cực',
  NEUTRAL: 'Trung lập',
};

// Custom tooltip để hiển thị đẹp hơn
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-700">{data.name}</p>
        <p className="text-sm text-gray-500">
          Số lượng: <span className="font-bold" style={{ color: data.color }}>{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const SentimentChart = ({ data }) => {
  const { sentiment_counts } = data;

  const chartData = Object.entries(sentiment_counts).map(([key, value]) => ({
    name: SENTIMENT_LABELS[key] || key,
    value: value,
    color: COLORS[key] || '#888888',
  }));

  // Kiểm tra nếu không có dữ liệu
  if (chartData.every((d) => d.value === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 text-center text-gray-500">
        Chưa có dữ liệu để hiển thị biểu đồ
      </div>
    );
  }

  // Chỉ lấy các phần có giá trị > 0 cho pie chart
  const pieData = chartData.filter((d) => d.value > 0);
  const total = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Phân bố cảm xúc
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                labelLine={false}
                outerRadius={85}
                innerRadius={45}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                label={({ percent }) =>
                  percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={40}
                iconType="circle"
                formatter={(value, entry) => {
                  const item = pieData.find((d) => d.name === value);
                  return (
                    <span style={{ color: '#555', fontSize: '13px' }}>
                      {value}: <strong>{item?.value || 0}</strong>
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 13 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;