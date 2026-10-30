import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export interface CategoryBarItem {
  category?: string;
  name?: string;
  _id?: string;
  count?: number;
  value?: number;
  percentage?: number;
}

export interface CategoryBarChartProps {
  data: CategoryBarItem[];
  height?: number;
}

const COLORS = [
  '#6366f1',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#10b981',
  '#06b6d4',
  '#14b8a6',
];

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data = [], height = 280 }) => {
  const normalizedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .map((item) => ({
        category: (item.category || item.name || item._id || 'Unclassified').trim(),
        count: Math.max(0, Number(item.count ?? item.value ?? 0)),
        percentage: item.percentage,
      }))
      .filter((d) => d.count > 0);
  }, [data]);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={normalizedData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="category"
            stroke="#6b7280"
            fontSize={10}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const entry = payload[0].payload;
                return (
                  <div className="p-2.5 bg-slate-900/95 border border-slate-700 rounded-xl shadow-xl backdrop-blur-md text-xs text-white">
                    <p className="font-bold text-slate-100">{entry.category}</p>
                    <p className="mt-1 text-slate-300">
                      Incidents: <span className="font-bold text-indigo-400">{Number(entry.count).toLocaleString()}</span>
                    </p>
                    {entry.percentage !== undefined && (
                      <p className="text-[11px] text-slate-400">Share: {entry.percentage}%</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
            {normalizedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
