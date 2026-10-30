import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export interface DonutDatum {
  name?: string;
  category?: string;
  district?: string;
  label?: string;
  _id?: string;
  value?: number;
  count?: number;
  percentage?: number;
  color?: string;
}

export interface DistributionDonutChartProps {
  data: DonutDatum[];
  height?: number | string;
  colors?: string[];
  centerLabel?: string;
  showLegend?: boolean;
  maxSlices?: number;
}

const DEFAULT_CRIME_COLORS = [
  '#6366f1', // Indigo (Theft / Major)
  '#3b82f6', // Blue (Burglary)
  '#f59e0b', // Amber (Robbery / Property)
  '#ec4899', // Pink (Molestation / Harassment)
  '#ef4444', // Red (Violent / Murder)
  '#10b981', // Emerald (Riots / Public Order)
  '#8b5cf6', // Violet (Cheatings / Fraud)
  '#06b6d4', // Cyan (Cyber / Tech)
  '#f97316', // Orange
  '#64748b', // Slate (Other Categories)
];

export const DistributionDonutChart: React.FC<DistributionDonutChartProps> = ({
  data = [],
  height = 300,
  colors = DEFAULT_CRIME_COLORS,
  centerLabel = 'Total Incidents',
  showLegend = true,
  maxSlices = 7,
}) => {
  // Normalize items from any input shape ({ category, count } or { name, value })
  const { normalizedData, totalValue } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { normalizedData: [], totalValue: 0 };
    }

    const rawList = data
      .map((item) => {
        const name = (item.name || item.category || item.district || item.label || item._id || 'Unclassified').trim();
        const value = Math.max(0, Number(item.value ?? item.count ?? 0));
        return { name, value, explicitPct: item.percentage, color: item.color };
      })
      .filter((d) => d.value > 0);

    const total = rawList.reduce((sum, d) => sum + d.value, 0) || 1;

    // Sort descending by volume
    rawList.sort((a, b) => b.value - a.value);

    // Group small tail categories into "Others" if exceeding maxSlices
    let finalItems: { name: string; value: number; percentage: number; color?: string }[] = [];
    if (rawList.length > maxSlices) {
      const topItems = rawList.slice(0, maxSlices);
      const remainingItems = rawList.slice(maxSlices);
      const remainingTotal = remainingItems.reduce((sum, d) => sum + d.value, 0);

      topItems.forEach((d) => {
        const pct = d.explicitPct ?? Number(((d.value / total) * 100).toFixed(1));
        finalItems.push({ name: d.name, value: d.value, percentage: pct, color: d.color });
      });

      if (remainingTotal > 0) {
        finalItems.push({
          name: 'Other Types',
          value: remainingTotal,
          percentage: Number(((remainingTotal / total) * 100).toFixed(1)),
          color: '#64748b',
        });
      }
    } else {
      finalItems = rawList.map((d) => ({
        name: d.name,
        value: d.value,
        percentage: d.explicitPct ?? Number(((d.value / total) * 100).toFixed(1)),
        color: d.color,
      }));
    }

    return { normalizedData: finalItems, totalValue: total };
  }, [data, maxSlices]);

  if (normalizedData.length === 0) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center p-6 text-slate-500 rounded-xl bg-slate-900/40 border border-dashed border-slate-800"
        style={{ height }}
      >
        <span className="text-xs font-semibold">No incident category data available</span>
        <span className="text-[10px] text-slate-400 mt-1">Adjust filters or time period</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-between" style={{ height }}>
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const entry = payload[0].payload;
                  return (
                    <div className="p-3 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md text-xs text-white">
                      <div className="flex items-center gap-2 font-bold text-slate-100">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: entry.fill || colors[0] }}
                        />
                        <span>{entry.name}</span>
                      </div>
                      <div className="mt-2 space-y-1 text-slate-300">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Recorded Incidents:</span>
                          <span className="font-semibold text-white">
                            {Number(entry.value).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Share of Total:</span>
                          <span className="font-bold text-indigo-400">{entry.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={3}
              dataKey="value"
            >
              {normalizedData.map((item, index) => (
                <Cell
                  key={`donut-slice-${index}`}
                  fill={item.color || colors[index % colors.length]}
                  stroke="#0f172a"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Statistic Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-base font-black text-white tracking-tight">
            {totalValue.toLocaleString()}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Dynamic Slices Legend Grid */}
      {showLegend && (
        <div className="w-full pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-[11px] max-h-[90px] overflow-y-auto custom-scrollbar">
          {normalizedData.map((item, index) => {
            const color = item.color || colors[index % colors.length];
            return (
              <div
                key={`legend-${item.name}-${index}`}
                className="flex items-center justify-between gap-1.5 py-0.5 px-1 rounded hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-300 truncate font-medium text-[10.5px]">
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 shrink-0 font-mono">
                  {item.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
