'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TableConfig } from '../models';
import { saveRecordToDb, fetchSingleRecordFromDb } from '../actions';

interface GamificationSidePanelProps {
  action: 'new' | 'edit';
  recordId: string | null;
  table: TableConfig;
  badges: { label: string; value: any }[];
  onSuccess: () => void;
}

export default function GamificationSidePanel({ action, recordId, table, badges, onSuccess }: GamificationSidePanelProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const isOpen = !!action;

  const handleClose = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('action');
    params.delete('id');
    router.push(`?${params.toString()}`);
  };

  const getDynamicOptions = (optionsKey: string | { label: string; value: any }[]) => {
    if (typeof optionsKey === 'string') {
      if (optionsKey === 'badges') return badges;
      return [];
    }
    return optionsKey;
  };

  useEffect(() => {
    if (isOpen) {
      if (action === 'new') {
        const initialData: Record<string, any> = {};
        table.fields.forEach(f => {
          if (f.name === 'id') {
            initialData[f.name] = '';
          } else if (f.type === 'number') {
            initialData[f.name] = 0;
          } else if (f.type === 'json') {
            initialData[f.name] = '{}';
          } else {
            initialData[f.name] = '';
          }
        });
        setFormData(initialData);
      } else if (action === 'edit' && recordId) {
        setInitialLoading(true);
        const fetchRecord = async () => {
          const data = await fetchSingleRecordFromDb(table.dbName, recordId);
          if (data) {
            const parsedData: Record<string, any> = {};
            table.fields.forEach(f => {
              const val = data[f.name];
              if (f.type === 'json') {
                parsedData[f.name] = val ? JSON.stringify(val, null, 2) : '{}';
              } else {
                parsedData[f.name] = val !== undefined && val !== null ? val : '';
              }
            });
            setFormData(parsedData);
          }
          setInitialLoading(false);
        };
        fetchRecord();
      }
    } else {
      setFormData({});
    }
  }, [action, recordId, table]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const submissionData: Record<string, any> = {};
    for (const field of table.fields) {
      if (field.isPrimaryKey && field.name === 'id' && action === 'new') {
        continue;
      }

      const value = formData[field.name];

      if (field.required && (value === undefined || value === null || value === '')) {
        alert(`Field "${field.label}" is required.`);
        return;
      }

      if (field.type === 'number') {
        submissionData[field.name] = value !== '' ? Number(value) : null;
      } else if (field.type === 'json') {
        try {
          submissionData[field.name] = JSON.parse(value);
        } catch (jsonErr) {
          alert(`Field "${field.label}" contains invalid JSON.`);
          return;
        }
      } else {
        submissionData[field.name] = value === '' ? null : value;
      }
    }

    setLoading(true);
    const primaryKeyField = table.fields.find(f => f.isPrimaryKey)?.name || 'id';

    try {
      if (action === 'edit' && recordId) {
        await saveRecordToDb(table.dbName, submissionData, recordId);
      } else {
        await saveRecordToDb(table.dbName, submissionData);
      }
      
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error saving record:', err);
      alert('Failed to save record. Check connection or schema constraints.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={handleClose} 
      />
      
      <div
        className={`fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-slate-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">
            {action === 'new' ? `Add ${table.name}` : `Edit ${table.name}`}
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="h-11 bg-white border-b border-slate-200 flex items-center px-6 gap-1 select-none flex-shrink-0 z-20">
          <button
            disabled={loading || initialLoading}
            onClick={() => handleSave()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin text-emerald-600" />
            ) : (
              <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
            )}
            <span>Save & Close</span>
          </button>

          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
          >
            <X size={15} className="text-slate-500" strokeWidth={2.5} />
            <span>Cancel</span>
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col items-center justify-start min-h-0 w-full">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center mt-20 gap-3 text-slate-400">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Loading record...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 w-full max-w-xl space-y-4">
              {table.fields.filter(f => !f.hidden).map(field => {
                const isReadOnly = action === 'edit' && field.readOnlyOnEdit;
                return (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <div className="relative">
                        <select
                          disabled={isReadOnly}
                          value={formData[field.name] || ''}
                          onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer pr-10 font-medium text-slate-800 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                          required={field.required}
                        >
                          <option value="">-- Choose Option --</option>
                          {getDynamicOptions(field.options || []).map((opt: any) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        disabled={isReadOnly}
                        value={formData[field.name] || ''}
                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800 min-h-[80px]"
                        required={field.required}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    ) : field.type === 'json' ? (
                      <textarea
                        disabled={isReadOnly}
                        value={formData[field.name] || ''}
                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-mono min-h-[120px]"
                        required={field.required}
                        placeholder='{"key": "value"}'
                      />
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        disabled={isReadOnly}
                        value={formData[field.name] || ''}
                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                        required={field.required}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                );
              })}
            </form>
          )}
        </div>
      </div>
    </>
  );
}
