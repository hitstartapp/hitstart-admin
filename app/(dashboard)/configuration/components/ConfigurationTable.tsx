import React from 'react';
import { Loader2, Database } from 'lucide-react';
import { TableConfig, getColClass } from '../models';

interface ConfigurationTableProps {
  selectedTable: TableConfig;
  items: any[];
  loading: boolean;
  selectedRowId: any | null;
  setSelectedRowId: (id: any | null) => void;
}

export default function ConfigurationTable({
  selectedTable,
  items,
  loading,
  selectedRowId,
  setSelectedRowId,
}: ConfigurationTableProps) {
  return (
    <div className="bg-white flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="min-w-max h-full flex flex-col">
          {/* List Header */}
          <div className="sticky top-0 z-20 flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-full w-max h-9">
            <div className="w-12 h-9 flex-shrink-0 border-r border-slate-200"></div>
            <div className="flex flex-1 py-1.5 items-center">
              {selectedTable.fields.map(field => (
                <div
                  key={field.name}
                  className={`flex items-center gap-1 px-4 border-r border-slate-200 last:border-r-0 h-7 ${getColClass(selectedTable.dbName, field.name)}`}
                >
                  {field.label.replace(/\(Auto\)/g, '')}
                </div>
              ))}
            </div>
          </div>

          {/* List Items */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <p className="text-sm font-medium">Loading table data...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 min-w-full w-max">
              {/* DYNAMIC ITEMS LIST */}
              {items.length > 0 ? (
                items.map((item, index) => {
                  const itemKey = item.id;
                  const isActive = String(selectedRowId) === String(itemKey);

                  return (
                    <div
                      key={itemKey || index}
                      className={`flex items-center group border-b border-slate-100 hover:bg-slate-50/40 transition-colors ${isActive ? 'bg-blue-50/30' : 'bg-white'}`}
                    >
                      {/* Checkbox Column */}
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

                      {/* Column Cells wrapper */}
                      <div
                        onClick={() => setSelectedRowId(isActive ? null : itemKey)}
                        className="flex flex-1 py-2.5 items-center min-w-0 cursor-pointer"
                      >
                        {selectedTable.fields.map(field => {
                          const val = item[field.name];
                          let displayValue = val !== null && val !== undefined ? String(val) : '-';
                          const isColName = field.name === 'configuration';

                          return (
                            <div
                              key={field.name}
                              className={`px-4 border-r border-slate-200/50 last:border-r-0 text-[14px] flex items-center h-14 ${getColClass(selectedTable.dbName, field.name)}`}
                            >
                              <span className={`${isColName ? 'font-semibold text-[#0f6cbd] group-hover:underline truncate' : 'text-slate-500 truncate'}`}>
                                {displayValue}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center flex-1">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Database size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No records found</h3>
                  <p className="text-slate-500 text-sm max-w-sm mb-4">
                    Add your first record inline.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
