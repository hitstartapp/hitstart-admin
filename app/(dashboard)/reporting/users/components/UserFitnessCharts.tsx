'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import type { DistributionItem } from '../actions';

const GOAL_COLORS: Record<string, string> = {
  'WeightLoss': '#f472b6',
  'MuscleGain': '#6366f1',
  'GeneralFitness': '#34d399',
  'NA': '#94a3b8',
  'Not Set': '#94a3b8',
};

const LEVEL_COLORS = ['#38bdf8', '#6366f1', '#f97316', '#94a3b8'];

export function UserFitnessCharts({
  fitnessGoalData,
  fitnessLevelData,
}: {
  fitnessGoalData: DistributionItem[];
  fitnessLevelData: DistributionItem[];
}) {
  const goalTotal = fitnessGoalData.reduce((sum, item) => sum + item.value, 0);
  const levelTotal = fitnessLevelData.reduce((sum, item) => sum + item.value, 0);

  const formatGoalName = (name: string) => {
    switch (name) {
      case 'WeightLoss': return 'Weight Loss';
      case 'MuscleGain': return 'Muscle Gain';
      case 'GeneralFitness': return 'General Fitness';
      case 'NA': return 'Not Specified';
      default: return name;
    }
  };

  const formattedGoalData = fitnessGoalData.map(item => ({
    ...item,
    displayName: formatGoalName(item.name),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-6 mb-6">
      {/* Fitness Goal - Bar Chart */}
      <div className="bg-white p-6 rounded-[20px] border border-slate-100/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] h-[380px] flex flex-col relative">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Fitness Goals</h3>
          <span className="text-2xl font-semibold text-slate-800">{goalTotal.toLocaleString()} <span className="text-sm font-normal text-slate-400">users</span></span>
        </div>
        {formattedGoalData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">No data available</div>
        ) : (
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedGoalData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="displayName" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(), 'Users']}
                  contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '13px' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {formattedGoalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GOAL_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Fitness Level - Donut */}
      <div className="bg-white p-6 rounded-[20px] border border-slate-100/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] h-[380px] flex flex-col relative">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Fitness Level Distribution</h3>
          <span className="text-2xl font-semibold text-slate-800">{levelTotal.toLocaleString()} <span className="text-sm font-normal text-slate-400">users</span></span>
        </div>
        {fitnessLevelData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">No data available</div>
        ) : (
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fitnessLevelData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {fitnessLevelData.map((_, index) => (
                    <Pie key={`cell-${index}`} data={[]} dataKey="value" cx="50%" cy="50%" outerRadius={0} fill="transparent" />
                  ))}
                  {fitnessLevelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={LEVEL_COLORS[index % LEVEL_COLORS.length]} />
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
          </div>
        )}
      </div>
    </div>
  );
}
