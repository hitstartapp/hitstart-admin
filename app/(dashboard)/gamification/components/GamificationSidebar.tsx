import React from 'react';
import { TableConfig, TABLES } from '../models';
import { Map, Trophy, Crown, Medal, Gamepad2 } from 'lucide-react';

interface GamificationSidebarProps {
  selectedTable: TableConfig;
  onSelectTable: (table: TableConfig) => void;
}

const getTableIcon = (tableId: string) => {
  switch (tableId) {
    case 'levelmapping':
      return Map;
    case 'levelstructure':
      return Trophy;
    case 'rank':
      return Crown;
    case 'badge':
      return Medal;
    default:
      return Gamepad2;
  }
};

export default function GamificationSidebar({
  selectedTable,
  onSelectTable
}: GamificationSidebarProps) {
  return (
    <aside className="w-[68px] lg:w-[260px] border-r border-slate-200 bg-white flex flex-col flex-shrink-0 pt-6 transition-all">
      <h2 className="hidden lg:block text-[14px] font-semibold uppercase tracking-wider text-slate-400 px-6 mb-4">
        Progress
      </h2>
      <nav className="flex flex-col text-[14px] px-2 lg:px-3 space-y-1 items-center lg:items-stretch">
        {TABLES.map(table => {
          const isActive = selectedTable.id === table.id;
          const Icon = getTableIcon(table.id);
          return (
            <button
              key={table.id}
              title={table.name}
              onClick={() => onSelectTable(table)}
              className={`w-11 lg:w-auto h-11 lg:h-auto text-left px-0 lg:px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-center lg:justify-start gap-2.5 ${isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="hidden lg:inline truncate">{table.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
