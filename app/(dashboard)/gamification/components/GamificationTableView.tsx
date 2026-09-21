'use client';

import React, { useState, useEffect } from 'react';
import { Database, Loader2, Filter } from 'lucide-react';
import { TableConfig } from '../models';

interface GamificationTableViewProps {
  selectedTable: TableConfig;
  items: any[];
  loading: boolean;
  selectedRowId: any | null;
  setSelectedRowId: (id: any | null) => void;
  title?: string;
}

export default function GamificationTableView({
  selectedTable,
  items,
  loading,
  selectedRowId,
  setSelectedRowId,
  title
}: GamificationTableViewProps) {
  const [selectedFitnessLevel, setSelectedFitnessLevel] = useState<string>('All');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFitness = params.get('fitnessLevel');
    const savedFitness = urlFitness || localStorage.getItem('hitstart-filter-fitness-level') || 'All';
    setSelectedFitnessLevel(savedFitness);

    const savedExpanded = localStorage.getItem('hitstart-gamification-filters-expanded') === 'true';
    setIsFiltersExpanded(savedExpanded);
  }, []);

  const handleFitnessLevelChange = (level: string) => {
    setSelectedFitnessLevel(level);
    localStorage.setItem('hitstart-filter-fitness-level', level);

    const params = new URLSearchParams(window.location.search);
    if (level && level !== 'All') {
      params.set('fitnessLevel', level);
    } else {
      params.delete('fitnessLevel');
    }
    const newUrl = `/gamification?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleToggleFilters = () => {
    setIsFiltersExpanded(prev => {
      const next = !prev;
      localStorage.setItem('hitstart-gamification-filters-expanded', String(next));
      return next;
    });
  };
  const getColClass = (tableName: string, field: string) => {
    switch (tableName) {
      case 'Badge':
        if (field === 'id') return 'w-[80px] flex-shrink-0';
        if (field === 'name') return 'w-[220px] flex-shrink-0';
        if (field === 'level') return 'w-[120px] flex-shrink-0';
        if (field === 'fitness_level') return 'w-[150px] flex-shrink-0';
        if (field === 'image_storage') return 'flex-1 min-w-[280px]';
        break;
      case 'LevelMapping':
        if (field === 'level') return 'w-[100px] flex-shrink-0';
        if (field === 'fitness_level') return 'w-[150px] flex-shrink-0';
        if (field === 'map') return 'w-[200px] flex-shrink-0';
        if (field === 'map_string') return 'w-[150px] flex-shrink-0';
        if (field === 'description') return 'flex-1 min-w-[200px]';
        break;
      case 'LevelStructure':
        if (field === 'id') return 'w-[80px] flex-shrink-0';
        if (field === 'level') return 'w-[100px] flex-shrink-0';
        if (field === 'week') return 'w-[100px] flex-shrink-0';
        if (field === 'day') return 'w-[100px] flex-shrink-0';
        if (field === 'next_stage') return 'w-[120px] flex-shrink-0';
        if (field === 'fitness_level') return 'w-[150px] flex-shrink-0';
        if (field === 'coins_per_day') return 'w-[120px] flex-shrink-0';
        if (field === 'xp_per_day') return 'w-[120px] flex-shrink-0';
        if (field === 'weekly_bonus_coins') return 'w-[150px] flex-shrink-0';
        if (field === 'weekly_bonus_xp') return 'w-[150px] flex-shrink-0';
        if (field === 'level_bonus_coins') return 'w-[150px] flex-shrink-0';
        if (field === 'badge') return 'w-[150px] flex-shrink-0';
        break;
      case 'Rank':
        if (field === 'id') return 'w-[80px] flex-shrink-0';
        if (field === 'name') return 'w-[250px] flex-shrink-0';
        if (field === 'xp_range_from') return 'w-[180px] flex-shrink-0';
        if (field === 'xp_range_to') return 'w-[180px] flex-shrink-0';
        break;
    }
    return 'w-[150px] flex-shrink-0';
  };

  const getPrimaryKeyVal = (item: any) => {
    const primaryKeyField = selectedTable.fields.find(f => f.isPrimaryKey)?.name || 'id';
    return item[primaryKeyField];
  };

  const filteredItems = React.useMemo(() => {
    let result = [...items];
    if (selectedTable.dbName === 'LevelStructure' && selectedFitnessLevel !== 'All') {
      result = result.filter(item => {
        const itemVal = item['fitness_level'];
        if (!itemVal) return false;
        return itemVal.toLowerCase() === selectedFitnessLevel.toLowerCase();
      });
    }
    return result;
  }, [items, selectedTable.dbName, selectedFitnessLevel]);

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
    <div className="flex-1 flex flex-col min-h-0 w-full bg-transparent">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-6 flex-shrink-0 px-6">
          <h1 className="text-[20px] font-semibold text-slate-800">{title}</h1>
          {selectedTable.dbName === 'LevelStructure' && (
            <button
              onClick={handleToggleFilters}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer border ${isFiltersExpanded
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
            >
              <Filter size={14} className={isFiltersExpanded ? 'text-blue-600' : 'text-slate-400'} />
              <span>Edit Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Main Card (Table) */}
      <div className="bg-white flex-1 flex flex-col min-h-0 overflow-hidden w-full">
        {selectedTable.dbName === 'LevelStructure' && isFiltersExpanded && (
          <div className="px-6 py-6 bg-slate-50/50 flex flex-wrap gap-6 items-center select-none border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-500 mr-1">Fitness Level:</span>
              <div className="flex gap-1.5">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(fLevel => (
                  <button
                    key={fLevel}
                    onClick={() => handleFitnessLevelChange(fLevel)}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                      selectedFitnessLevel === fLevel
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {fLevel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max h-full flex flex-col">
          <div className="sticky top-0 z-20 flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-full w-max h-9">
            <div className="w-12 h-9 flex-shrink-0 border-r border-slate-200"></div>
            <div className="flex flex-1 py-1.5 items-center">
              {selectedTable.fields.filter(f => !f.hidden).map(field => (
                <div
                  key={field.name}
                  className={`flex items-center gap-1 px-4 border-r border-slate-200 last:border-r-0 h-7 ${getColClass(selectedTable.dbName, field.name)} ${['level', 'week', 'day', 'next_stage'].includes(field.name) && selectedTable.dbName === 'LevelStructure' ? 'justify-center' : ''}`}
                >
                  {field.label.replace(/\(Auto\)/g, '')}
                </div>
              ))}
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100 min-w-full w-max">
              {filteredItems.map((item, index) => {
                const itemKey = getPrimaryKeyVal(item);
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
                        const isFitnessLevel = field.name === 'fitness_level';
                        const isCircleField = ['level', 'week', 'day', 'next_stage'].includes(field.name) && selectedTable.dbName === 'LevelStructure';

                        let fitnessPillClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                        if (isFitnessLevel) {
                          const lowerVal = displayValue.toLowerCase();
                          if (lowerVal === 'beginner') fitnessPillClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                          else if (lowerVal === 'intermediate') fitnessPillClass = "bg-amber-50 text-amber-700 border-amber-100";
                          else if (lowerVal === 'advanced') fitnessPillClass = "bg-rose-50 text-rose-700 border-rose-100";
                        }

                        return (
                          <div
                            key={field.name}
                            className={`px-4 border-r border-slate-200/50 last:border-r-0 text-[14px] flex items-center h-14 ${getColClass(selectedTable.dbName, field.name)} ${!isColName && !isFitnessLevel && !isCircleField ? 'text-slate-500' : ''} ${isCircleField ? 'justify-center' : ''}`}
                          >
                            <span className={`flex-1 min-w-0 flex items-center ${isCircleField ? 'justify-center' : ''}`}>
                              {isColName ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100 truncate">
                                  {displayValue}
                                </span>
                              ) : isFitnessLevel && displayValue !== '-' ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border truncate ${fitnessPillClass}`}>
                                  {displayValue}
                                </span>
                              ) : isCircleField && displayValue !== '-' ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                                  {displayValue}
                                </span>
                              ) : (
                                <span className="truncate">{displayValue}</span>
                              )}
                            </span>
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
    </div>
  );
}
