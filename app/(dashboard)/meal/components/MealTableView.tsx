'use client';

import React from 'react';
import { Database, Loader2, MessageSquare, Leaf, Egg, Drumstick, User } from 'lucide-react';
import { TableConfig } from '../models';

interface MealTableViewProps {
  selectedTable: TableConfig;
  items: any[];
  loading: boolean;
  selectedRowId: any | null;
  setSelectedRowId: (id: any | null) => void;
  onOpenNote?: (note: string) => void;
}

export default function MealTableView({
  selectedTable,
  items,
  loading,
  selectedRowId,
  setSelectedRowId,
  onOpenNote
}: MealTableViewProps) {

  const getColClass = (tableName: string, field: string) => {
    switch (tableName) {
      case 'MealPlan':
        if (field === 'id') return 'w-[120px] flex-shrink-0';
        if (field === 'name') return 'w-[250px] flex-shrink-0';
        if (field === 'dietary_preference') return 'w-[120px] flex-shrink-0';
        if (field === 'fitness_goal') return 'w-[130px] flex-shrink-0';
        if (field === 'gender') return 'w-[90px] flex-shrink-0';
        if (field === 'weight_range_from') return 'w-[110px] flex-shrink-0';
        if (field === 'weight_range_to') return 'w-[110px] flex-shrink-0';
        if (field === 'is_paid') return 'w-[90px] flex-shrink-0';
        if (field === 'price') return 'w-[100px] flex-shrink-0';
        if (field === 'package_id') return 'w-[120px] flex-shrink-0';
        if (field === 'note') return 'w-[80px] flex-shrink-0';
        break;
      case 'Food':
        if (field === 'name') return 'w-[250px] flex-shrink-0';
        break;
    }
    return 'w-[150px] flex-shrink-0';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading table data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="min-w-max h-full flex flex-col">
          <div className="sticky top-0 z-20 flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-full w-max h-9">
            <div className="w-12 h-9 flex-shrink-0 border-r border-slate-200"></div>
            <div className="flex flex-1 py-1.5 items-center">
              {selectedTable.fields.filter(f => !f.hidden).map(field => (
                <div
                  key={field.name}
                  className={`flex items-center gap-1 px-4 border-r border-slate-200 last:border-r-0 h-7 ${getColClass(selectedTable.dbName, field.name)}`}
                >
                  {field.label.replace(/\(Auto\)/g, '')}
                </div>
              ))}
            </div>
          </div>

          {items.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100 min-w-full w-max">
              {items.map((item, index) => {
                const itemKey = item.id;
                const isActive = String(selectedRowId) === String(itemKey);

                return (
                  <div
                    key={itemKey || index}
                    className={`flex items-center group border-b border-slate-100 hover:bg-slate-50/40 transition-colors ${isActive ? 'bg-blue-50/30' : 'bg-white'}`}
                  >
                    <div
                      onClick={() => setSelectedRowId(isActive ? null : itemKey)}
                      className="w-12 h-14 flex-shrink-0 flex items-center justify-center border-r border-slate-200/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        readOnly
                        className="h-3.5 w-3.5 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    <div
                      onClick={() => setSelectedRowId(isActive ? null : itemKey)}
                      className="flex flex-1 py-2.5 items-center min-w-0 cursor-pointer"
                    >
                      {selectedTable.fields.filter(f => !f.hidden).map(field => {
                        const val = item[field.name];
                        let displayValue = '-';
                        if (val !== null && val !== undefined) {
                          displayValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
                        }

                        const isColName = field.name === 'name';
                        let cellContent: React.ReactNode = displayValue;

                        if (field.name === 'is_paid') {
                          const isTrue = displayValue.toLowerCase() === 'true';
                          cellContent = (
                            <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${isTrue ? 'bg-blue-600' : 'bg-slate-200'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isTrue ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                          );
                        } else if (field.name === 'note') {
                          cellContent = displayValue !== '-' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenNote && onOpenNote(displayValue);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-500 transition-colors"
                              title="View Note"
                            >
                              <MessageSquare size={16} />
                            </button>
                          ) : (
                            <span className="text-slate-300">-</span>
                          );
                        } else if (field.name === 'dietary_preference') {
                          if (displayValue === 'Vegetarian') {
                            cellContent = <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100"><Leaf size={14} /><span className="text-[11px] font-medium">Veg</span></div>;
                          } else if (displayValue === 'Eggetarian') {
                            cellContent = <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100"><Egg size={14} /><span className="text-[11px] font-medium">Egg</span></div>;
                          } else if (displayValue === 'Non-Vegetarian') {
                            cellContent = <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100"><Drumstick size={14} /><span className="text-[11px] font-medium">Non-Veg</span></div>;
                          } else {
                            cellContent = <span className="truncate">{displayValue}</span>;
                          }
                        } else if (field.name === 'fitness_goal') {
                          let color = 'bg-slate-100 text-slate-600 border-slate-200';
                          if (displayValue === 'Weight Loss') color = 'bg-amber-50 text-amber-600 border-amber-200';
                          else if (displayValue === 'Muscle Gain') color = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                          else if (displayValue === 'Maintenance') color = 'bg-blue-50 text-blue-600 border-blue-200';
                          cellContent = displayValue !== '-' ? <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${color} whitespace-nowrap truncate max-w-full block`}>{displayValue}</span> : <span className="text-slate-300">-</span>;
                        } else if (field.name === 'gender') {
                          if (displayValue === 'Male') {
                            cellContent = <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100" title="Male"><User size={14} /></div>;
                          } else if (displayValue === 'Female') {
                            cellContent = <div className="w-7 h-7 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100" title="Female"><User size={14} /></div>;
                          } else if (displayValue === 'Any') {
                            cellContent = <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 text-[10px] font-bold" title="Any">A</div>;
                          } else {
                            cellContent = <span className="truncate">{displayValue}</span>;
                          }
                        } else if (field.name === 'package_id') {
                          cellContent = displayValue !== '-' ? <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 font-mono truncate max-w-full block">{displayValue}</span> : <span className="text-slate-300">-</span>;
                        } else if (isColName) {
                          cellContent = <span className="font-semibold text-[13px] text-[#0f6cbd] group-hover:underline truncate">{displayValue}</span>;
                        } else {
                          cellContent = <span className="truncate">{displayValue}</span>;
                        }

                        return (
                          <div
                            key={field.name}
                            className={`px-4 border-r border-slate-200/50 last:border-r-0 text-[14px] flex items-center h-14 ${getColClass(selectedTable.dbName, field.name)} ${!isColName ? 'text-slate-500' : ''}`}
                          >
                            {cellContent}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center flex-1">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Database size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No records found</h3>
              <p className="text-slate-500 text-sm max-w-sm mb-4">
                Add your first record to this table.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
