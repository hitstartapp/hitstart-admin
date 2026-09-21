'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DistributionItem } from '../actions';

const GENDER_COLORS = ['#6366f1', '#f472b6', '#a78bfa', '#94a3b8'];
const DIET_COLORS = ['#34d399', '#fbbf24', '#f87171', '#94a3b8'];

function DistributionDonut({
  title,
  data,
  colors,
}: {
  title: string;
  data: DistributionItem[];
  colors: string[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-[20px] border border-slate-100/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] h-[380px] flex flex-col relative">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <span className="text-2xl font-semibold text-slate-800">{total.toLocaleString()} <span className="text-sm font-normal text-slate-400">users</span></span>
      </div>
      <div className="flex-1 min-h-0 relative">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [Number(value).toLocaleString(), 'Users']}
                contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '13px' }}
                itemStyle={{ fontWeight: 600 }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
                formatter={(value: string) => <span className="text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function UserDemographicsCharts({
  genderData,
  dietaryData,
}: {
  genderData: DistributionItem[];
  dietaryData: DistributionItem[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-6 mb-6">
      <DistributionDonut title="Gender Distribution" data={genderData} colors={GENDER_COLORS} />
      <DistributionDonut title="Dietary Preference" data={dietaryData} colors={DIET_COLORS} />
    </div>
  );
}
