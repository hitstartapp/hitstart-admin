'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { RevenueTrendItem } from '../actions';

export function PurchasesTrendChart({ data }: { data: RevenueTrendItem[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-slate-400">No data available</div>;
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.Workout + item.Meal, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  return (
    <div className="bg-white p-6 rounded-[20px] border border-slate-100/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] h-[400px] flex flex-col relative">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Revenue Trend</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-semibold text-slate-800">₹{totalRevenue.toLocaleString()}</span>
            <span className="text-xs text-slate-400 mb-1">Last 30 days</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWorkoutRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMealRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="dateStr" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, String(name)]}
              contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '13px' }}
              labelStyle={{ color: '#475569', fontWeight: 600, marginBottom: '4px' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
            <Area type="monotone" dataKey="Workout" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWorkoutRev)" />
            <Area type="monotone" dataKey="Meal" stroke="#f472b6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMealRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
