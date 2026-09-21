import React from 'react';
import { TableConfig, TABLES } from '../models';

interface ConfigurationSidebarProps {
  selectedTable: TableConfig;
  onSelectTable: (table: TableConfig) => void;
}

export default function ConfigurationSidebar({ selectedTable, onSelectTable }: ConfigurationSidebarProps) {
  return (
    <aside className="w-[68px] lg:w-[260px] border-r border-slate-200 bg-white flex flex-col flex-shrink-0 pt-6 transition-all">
      <h2 className="hidden lg:block text-[14px] font-semibold uppercase tracking-wider text-slate-400 px-6 mb-4">
        Settings
      </h2>
      <nav className="flex flex-col text-[14px] px-2 lg:px-3 space-y-1 items-center lg:items-stretch">
        {TABLES.map(table => {
          const isActive = selectedTable.id === table.id;
          const Icon = table.icon;
          return (
            <button
              key={table.id}
              title={table.name}
              onClick={() => onSelectTable(table)}
              className={`w-11 lg:w-auto h-11 lg:h-auto text-left px-0 lg:px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-center lg:justify-start gap-2.5 cursor-pointer ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
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
