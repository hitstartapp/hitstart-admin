'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { UserGrowthItem } from '../actions';

export function UserGrowthChart({ data }: { data: UserGrowthItem[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-slate-400">No data available</div>;
  }

  const totalNewUsers = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white p-6 rounded-[20px] border border-slate-100/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] h-[380px] flex flex-col relative">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">User Growth</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-semibold text-slate-800">{totalNewUsers}</span>
            <span className="text-xs text-slate-400 mb-1">New signups • Last 30 days</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="dateStr" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={10} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dx={-10} allowDecimals={false} />
            <Tooltip
              formatter={(value) => [Number(value), 'New Users']}
              contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '13px' }}
              labelStyle={{ color: '#475569', fontWeight: 600, marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGrowth)" name="New Users" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
