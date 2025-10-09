
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '../types';

interface CategoryChartProps {
  data: ChartData[];
  title?: string;
}

// Modern color palette with better contrast and accessibility
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1'  // Indigo
];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border border-white/20 rounded-xl shadow-xl">
        <div className="flex items-center space-x-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <p className="font-semibold text-slate-800">{data.name}</p>
        </div>
        <p className="text-lg font-bold text-slate-900">
          ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-slate-600">
          {((data.value / data.payload.total) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC<any> = ({ payload }) => (
  <div className="flex flex-wrap gap-4 justify-center mt-4">
    {payload?.map((entry: any, index: number) => (
      <div key={index} className="flex items-center space-x-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-sm font-medium text-slate-700">{entry.value}</span>
      </div>
    ))}
  </div>
);

const CategoryChart: React.FC<CategoryChartProps> = ({ data, title }) => {
  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-emerald-500/5 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {title || "Expense Breakdown"}
          </h2>
          <div className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">${total.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }} className="mb-4">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data.map((item, index) => ({ ...item, total }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                innerRadius={40} // Donut chart effect
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        {data.length > 0 && (
          <CustomLegend payload={data.map((item, index) => ({
            value: item.name,
            color: COLORS[index % COLORS.length]
          }))} />
        )}

        {data.length === 0 && (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No data to display</p>
              <p className="text-sm">Add some transactions to see the breakdown</p>
            </div>
          </div>
        )}
      </div>

      {/* Subtle border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-emerald-500/20 p-[1px] -z-10">
        <div className="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl" />
      </div>
    </div>
  );
};

export default CategoryChart;
