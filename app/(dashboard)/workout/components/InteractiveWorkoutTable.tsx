'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Mars, Venus, Calendar, Dumbbell, Filter, MessageSquareMore, X, Check, Loader2, ArrowRight, MoveRight, PanelsRightBottomIcon, CircleChevronRightIcon, ChevronRight, GripVertical, Plus, Trash2, Edit2, RefreshCw, ArrowLeft, Save, Pencil, IndianRupee } from 'lucide-react';
import { saveWorkoutPlan } from '../actions';
import { useRouter } from 'next/navigation';
import WorkoutConfigPanel from './WorkoutConfigPanel';
import { useWorkoutFilters } from './useWorkoutFilters';

interface InteractiveWorkoutTableProps {
  initialItems: any[];
  tableName: string;
  title: string;
  initialSelectedId?: string;
  view: string;
  fields: string[];
  exerciseMap: Record<string, string>;
  planMap: Record<string, string>;
  packages?: string[];
}

export default function InteractiveWorkoutTable({
  initialItems,
  view,
  fields,
  exerciseMap,
  planMap,
  initialSelectedId,
  title,
  packages = [],
}: InteractiveWorkoutTableProps) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialSelectedId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRowState, setEditRowState] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [activePopupNote, setActivePopupNote] = useState<{ title: string; content: string } | null>(null);

  const isWorkouts = view === 'workouts';

  const {
    genders,
    fitnessLevels,
    filteredItems,
    selectedGender,
    selectedFitnessLevel,
    isFiltersExpanded,
    sortConfig,
    handleGenderChange,
    handleFitnessLevelChange,
    handleToggleFilters,
    handleSort
  } = useWorkoutFilters({ items, view, isWorkouts, exerciseMap });

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Sync state if initialSelectedId changes from prop
  useEffect(() => {
    setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  const handleFieldChange = (field: string, val: any) => {
    setEditRowState((prev: any) => {
      const next = { ...prev, [field]: val };
      if (field === 'payment_required' && !val) {
        next.price = 0;
        next.package_id = null;
      }
      return next;
    });
  };

  const handleCancel = (id: string) => {
    if (id.startsWith('temp-')) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedId(undefined);
    }
    setEditingId(null);
    setEditRowState({});
  };

  const handleSave = async (id: string) => {
    if (!editRowState.name || !editRowState.name.trim()) {
      alert('Workout Plan Name is required');
      return;
    }
    setIsSaving(true);
    const isNew = id.startsWith('temp-');
    try {
      const payload = {
        id,
        name: editRowState.name.trim(),
        level: editRowState.level !== undefined ? parseInt(String(editRowState.level), 10) : null,
        week: editRowState.week !== undefined ? parseInt(String(editRowState.week), 10) : null,
        day: editRowState.day !== undefined ? parseInt(String(editRowState.day), 10) : null,
        payment_required: !!editRowState.payment_required,
        price: editRowState.payment_required && editRowState.price !== undefined ? parseFloat(String(editRowState.price)) : 0,
        package_id: editRowState.payment_required ? (editRowState.package_id || null) : null,
        gender: editRowState.gender || null,
        fitness_level: editRowState.fitness_level || null,
        workout_type: editRowState.workout_type || null,
        note: editRowState.note || null,
      };

      const res = await saveWorkoutPlan(payload);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to save workout plan');
      }

      const savedData = res.data;
      setItems((prev) =>
        prev.map((item) => (item.id === id ? savedData : item))
      );
      setEditingId(null);
      setEditRowState({});
      setSelectedId(savedData.id);

      const params = new URLSearchParams(window.location.search);
      params.set('planId', savedData.id);
      router.push(`/workout?${params.toString()}`);
      router.refresh();
    } catch (err) {
      console.error('Error saving workout plan:', err);
      alert('Failed to save workout plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  // Dispatch inline editing state to CommandBar
  useEffect(() => {
    if (editingId) {
      window.dispatchEvent(new CustomEvent('inline-editing-start'));
    } else {
      window.dispatchEvent(new CustomEvent('inline-editing-stop'));
    }
  }, [editingId]);

  // Listen to CommandBar inline save/cancel events
  useEffect(() => {
    const handleSaveInline = () => {
      if (editingId) handleSave(editingId);
    };
    const handleCancelInline = () => {
      if (editingId) handleCancel(editingId);
    };

    window.addEventListener('save-inline-edit', handleSaveInline);
    window.addEventListener('cancel-inline-edit', handleCancelInline);

    return () => {
      window.removeEventListener('save-inline-edit', handleSaveInline);
      window.removeEventListener('cancel-inline-edit', handleCancelInline);
    };
  }, [editingId, editRowState]);

  // Listen to CommandBar custom events for inline plan management
  useEffect(() => {
    const handleAddPlan = () => {
      if (view !== 'plans') return;
      if (items.some(item => String(item.id).startsWith('temp-'))) return;

      const newId = `temp-${Date.now()}`;
      const newPlan = {
        id: newId,
        level: 1,
        week: 1,
        day: 1,
        name: '',
        payment_required: false,
        price: 0,
        package_id: null,
        gender: null,
        fitness_level: null,
        workout_type: 'Gym',
        note: null,
      };

      setItems(prev => [newPlan, ...prev]);
      setEditingId(newId);
      setEditRowState(newPlan);
      setSelectedId(newId);
    };

    const handleEditPlan = () => {
      if (view !== 'plans' || !selectedId) return;
      const plan = items.find(item => item.id === selectedId);
      if (plan) {
        setEditingId(plan.id);
        setEditRowState({ ...plan });
      }
    };

    const handleConfigureWorkouts = () => {
      if (view === 'plans' && selectedId) {
        setIsConfiguring(true);
      }
    };

    window.addEventListener('add-plan', handleAddPlan);
    window.addEventListener('edit-plan', handleEditPlan);
    window.addEventListener('configure-workouts', handleConfigureWorkouts);
    return () => {
      window.removeEventListener('add-plan', handleAddPlan);
      window.removeEventListener('edit-plan', handleEditPlan);
      window.removeEventListener('configure-workouts', handleConfigureWorkouts);
    };
  }, [view, items, selectedId]);

  // Close panel if selection is cleared
  useEffect(() => {
    if (!selectedId) {
      setIsConfiguring(false);
    }
  }, [selectedId]);



  // Filters logic extracted to useWorkoutFilters hook

  const handleRowClick = (itemId: string, e: React.MouseEvent) => {
    const newSelectedId = selectedId === itemId ? undefined : itemId;
    setSelectedId(newSelectedId);

    // Update URL silently without triggering a Next.js Server Component fetch
    let newUrl = '/workout';
    const params = new URLSearchParams(window.location.search);

    if (isWorkouts) {
      if (newSelectedId) {
        params.set('workoutId', newSelectedId);
      } else {
        params.delete('workoutId');
      }
    } else {
      if (newSelectedId) {
        params.set('planId', newSelectedId);
      } else {
        params.delete('planId');
      }
    }

    newUrl = `/workout?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  };

  const getColClass = (field: string) => {
    switch (field) {
      case 'title':
      case 'name':
        return 'flex-1 min-w-[320px]';
      case 'exercise':
      case 'workout_plan':
        return 'w-[240px] flex-shrink-0';
      case 'workout_type':
        return 'w-[140px] flex-shrink-0';
      case 'number_of_set':
      case 'number_of_reps':
      case 'sets':
      case 'reps':
        return 'w-[110px] flex-shrink-0';
      case 'duration':
        return 'w-[110px] flex-shrink-0';
      case 'order_of_exercise':
        return 'w-[135px] flex-shrink-0';
      case 'level':
      case 'week':
      case 'day':
        return 'w-[90px] flex-shrink-0';
      case 'fitness_level':
        return 'w-[130px] flex-shrink-0';
      case 'gender':
        return 'w-[95px] flex-shrink-0';
      case 'payment_required':
        return 'w-[155px] flex-shrink-0';
      case 'price':
        return 'w-[105px] flex-shrink-0';
      case 'package_id':
        return 'w-[320px] flex-shrink-0';
      case 'note':
        return 'w-[80px] flex-shrink-0';
      case 'created_at':
        return 'w-[185px] flex-shrink-0';
      default:
        return 'w-[150px] flex-shrink-0';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0 px-6">
        <h1 className="text-[20px] font-semibold text-slate-800">{title}</h1>
        {view === 'plans' && (
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

      {/* Main Card (Table) */}
      <div className="bg-white flex-1 flex flex-col min-h-0 overflow-hidden w-full">
        {/* Collapsible Filters Panel */}
        {view === 'plans' && isFiltersExpanded && (
          <div className="px-6 py-6 bg-slate-50/50 flex flex-wrap gap-6 items-center select-none border-b border-slate-200 flex-shrink-0">
            {/* Gender Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-500 mr-1">Gender:</span>
              <div className="flex gap-1.5">
                {genders.map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGenderChange(g)}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer ${selectedGender === g
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>

            {/* Fitness Level Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-500 mr-1">Fitness Level:</span>
              <div className="flex gap-1.5">
                {fitnessLevels.map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFitnessLevelChange(f)}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer ${selectedFitnessLevel === f
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <div className="min-w-max h-full flex flex-col">
            {/* List Header */}
            <div className="sticky top-0 z-20 flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-full w-max h-9">
              <div className="w-12 h-9 flex-shrink-0 border-r border-slate-200"></div>
              <div className="flex flex-1 py-1.5 items-center">
                {fields.map((field, idx) => {
                  const isCenterAligned = [
                    'gender',
                    'level',
                    'week',
                    'day',
                    'payment_required',
                    'fitness_level',
                    'workout_type',
                    'number_of_set',
                    'number_of_reps',
                    'duration',
                    'order_of_exercise',
                    'price',
                    'note'
                  ].includes(field);

                  const isSortable = ['title', 'level', 'week', 'day'].includes(field);

                  return (
                    <div
                      key={field}
                      onClick={() => isSortable && handleSort(field)}
                      className={`flex items-center gap-1 cursor-pointer px-4 border-r border-slate-200 last:border-r-0 h-7 ${getColClass(field)} ${isCenterAligned ? 'justify-center' : ''} select-none`}
                    >
                      {field.replace(/_/g, ' ')}
                      {isSortable && (
                        <div className="flex flex-col -space-y-1 ml-1 flex-shrink-0">
                          <ChevronUp
                            size={11}
                            strokeWidth={3.5}
                            className={sortConfig[field] === 'asc' ? 'text-blue-600 font-extrabold' : 'text-slate-300'}
                          />
                          <ChevronDown
                            size={11}
                            strokeWidth={3.5}
                            className={sortConfig[field] === 'desc' ? 'text-blue-600 font-extrabold' : 'text-slate-300'}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List Items */}
            <div className="flex flex-col divide-y divide-slate-100 min-w-full w-max">
              {filteredItems.length > 0 ? (
                filteredItems.map((item: any, index: number) => {
                  const bgColors = ['bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-slate-100 text-slate-600'];
                  const colorClass = bgColors[index % bgColors.length];
                  const isSelected = selectedId === item.id;

                  return (
                    <div
                      key={item.id || index}
                      onClick={(e) => handleRowClick(item.id, e)}
                      className={`flex items-center group border-b border-slate-100 hover:bg-slate-50/40 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/30' : 'bg-white'}`}
                    >
                      {/* Checkbox Column */}
                      <div className="w-12 h-14 flex-shrink-0 flex items-center justify-center border-r border-slate-200/50">
                        {editingId === item.id ? (
                          isSaving ? (
                            <Loader2 size={12} className="animate-spin text-amber-500" />
                          ) : (
                            <Pencil size={12} className="text-amber-500 animate-pulse" />
                          )
                        ) : (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }} // handled by row onClick
                            className="h-3.5 w-3.5 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        )}
                      </div>

                      {/* Columns Cells wrapper */}
                      <div className="flex flex-1 py-2.5 items-center min-w-0">
                        {fields.map((field, idx) => {
                          let cellContent;
                          const rawVal = item[field];
                          let displayValue = '-';
                          if (rawVal !== null && rawVal !== undefined) {
                            displayValue = typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal);
                          }

                          if (editingId === item.id) {
                            if (field === 'level' || field === 'week' || field === 'day') {
                              cellContent = (
                                <input
                                  type="number"
                                  value={editRowState[field] !== undefined && editRowState[field] !== null ? editRowState[field] : ''}
                                  onChange={(e) => handleFieldChange(field, e.target.value ? parseInt(e.target.value, 10) : 0)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-14 h-9 px-2 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center shadow-sm transition-all"
                                  min={1}
                                  max={field === 'day' ? 7 : undefined}
                                />
                              );
                            } else if (field === 'name') {
                              cellContent = (
                                <input
                                  type="text"
                                  value={editRowState[field] || ''}
                                  onChange={(e) => handleFieldChange(field, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full h-9 px-3 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-sm transition-all"
                                  placeholder="Plan Name"
                                  required
                                />
                              );
                            } else if (field === 'payment_required') {
                              const isTrue = !!editRowState[field];
                              cellContent = (
                                <div className="flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFieldChange(field, !isTrue);
                                    }}
                                    className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors cursor-pointer focus:outline-none shadow-inner ${isTrue ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                  >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${isTrue ? 'translate-x-4' : 'translate-x-0'}`} />
                                  </button>
                                </div>
                              );
                            } else if (field === 'price') {
                              cellContent = (
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  disabled={!editRowState.payment_required}
                                  value={editRowState.payment_required ? (editRowState[field] !== undefined ? editRowState[field] : 0) : 0}
                                  onChange={(e) => handleFieldChange(field, e.target.value ? parseFloat(e.target.value) : 0)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`w-20 h-9 px-2 text-[13px] rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center shadow-sm transition-all ${editRowState.payment_required ? 'bg-white' : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                                    }`}
                                />
                              );
                            } else if (field === 'package_id') {
                              cellContent = (
                                <select
                                  value={editRowState[field] || ''}
                                  disabled={!editRowState.payment_required}
                                  onChange={(e) => handleFieldChange(field, e.target.value || null)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`w-full h-9 px-3 pr-8 text-[13px] rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all appearance-none ${editRowState.payment_required ? 'bg-white cursor-pointer' : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                  <option value="">None</option>
                                  {(packages || []).map((pkg) => (
                                    <option key={pkg} value={pkg}>
                                      {pkg}
                                    </option>
                                  ))}
                                </select>
                              );
                            } else if (field === 'gender') {
                              cellContent = (
                                <select
                                  value={editRowState[field] || ''}
                                  onChange={(e) => handleFieldChange(field, e.target.value || null)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full h-9 px-3 pr-8 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all appearance-none cursor-pointer"
                                >
                                  <option value="">All</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              );
                            } else if (field === 'fitness_level') {
                              cellContent = (
                                <select
                                  value={editRowState[field] || ''}
                                  onChange={(e) => handleFieldChange(field, e.target.value || null)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full h-9 px-3 pr-8 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all appearance-none cursor-pointer"
                                >
                                  <option value="">All</option>
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                </select>
                              );
                            } else if (field === 'workout_type') {
                              cellContent = (
                                <select
                                  value={editRowState[field] || ''}
                                  onChange={(e) => handleFieldChange(field, e.target.value || null)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full h-9 px-3 pr-8 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all appearance-none cursor-pointer"
                                >
                                  <option value="">None</option>
                                  <option value="Gym">Gym</option>
                                  <option value="Home">Home</option>
                                </select>
                              );
                            } else if (field === 'note') {
                              cellContent = (
                                <input
                                  type="text"
                                  value={editRowState[field] || ''}
                                  onChange={(e) => handleFieldChange(field, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full h-9 px-3 text-[13px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                                  placeholder="Note"
                                />
                              );
                            } else {
                              cellContent = <span className="text-slate-300">-</span>;
                            }
                          } else {
                            if (field === 'name' || field === 'title') {
                              cellContent = (
                                <div className="flex items-center gap-3">
                                  <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 text-xs ${colorClass}`}>
                                    <Dumbbell size={20} strokeWidth={2} />
                                  </div>
                                  <span className="font-semibold text-[13px] text-[#0f6cbd] group-hover:underline truncate">
                                    {isWorkouts
                                      ? (item.title || exerciseMap[item.exercise] || 'Untitled Workout')
                                      : (item.name || 'Untitled Plan')}
                                  </span>
                                </div>
                              );
                            } else {
                              if (field === 'gender') {
                                cellContent = (
                                  <div className="flex items-center justify-center">
                                    {(() => {
                                      const g = displayValue.toLowerCase();
                                      if (g === 'male' || g === 'm') return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-500 border border-blue-100" title="Male"><Mars size={16} /></div>;
                                      if (g === 'female' || g === 'f') return <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-50 text-pink-500 border border-pink-100" title="Female"><Venus size={16} /></div>;
                                      return displayValue;
                                    })()}
                                  </div>
                                );
                              } else if (field === 'payment_required') {
                                const isTrue = displayValue.toLowerCase() === 'true';
                                cellContent = (
                                  <div className="flex items-center justify-center">
                                    <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${isTrue ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isTrue ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                  </div>
                                );
                              } else if (field === 'created_at') {
                                cellContent = (
                                  <div className="flex items-center gap-2">
                                    {displayValue !== '-' ? (
                                      <>
                                        <Calendar size={14} className="text-slate-400" />
                                        <span>
                                          {(() => {
                                            const d = new Date(displayValue);
                                            if (isNaN(d.getTime())) return displayValue;
                                            return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                          })()}
                                        </span>
                                      </>
                                    ) : '-'}
                                  </div>
                                );
                              } else if (field === 'price') {
                                cellContent = (
                                  <span className="font-semibold text-slate-700">
                                    {displayValue === '0' || displayValue === '-' ? 'Free' : `₹${displayValue}`}
                                  </span>
                                );
                              } else if (field === 'exercise') {
                                cellContent = (
                                  <span className="text-slate-600 font-medium truncate max-w-[220px]">
                                    {exerciseMap[rawVal] || rawVal}
                                  </span>
                                );
                              } else if (field === 'workout_plan') {
                                cellContent = (
                                  <span className="text-slate-600 truncate max-w-[220px]">
                                    {planMap[rawVal] || rawVal}
                                  </span>
                                );
                              } else if (field === 'fitness_level') {
                                const getBadgeColor = (lvl: string) => {
                                  const l = lvl.toLowerCase();
                                  if (l.includes('beginner')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
                                  if (l.includes('intermediate')) return 'bg-amber-50 text-amber-700 border-amber-100';
                                  if (l.includes('advance') || l.includes('expert')) return 'bg-rose-50 text-rose-700 border-rose-100';
                                  return 'bg-slate-50 text-slate-700 border-slate-100';
                                };
                                cellContent = (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getBadgeColor(displayValue)}`}>
                                    {displayValue}
                                  </span>
                                );
                              } else if (field === 'level' || field === 'week' || field === 'day' || field === 'order_of_exercise') {
                                cellContent = (
                                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                                    {displayValue}
                                  </span>
                                );
                              } else if (field === 'workout_type') {
                                cellContent = (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {displayValue}
                                  </span>
                                );
                              } else if (field === 'package_id') {
                                cellContent = displayValue !== '-' ? (
                                  <span className="inline-flex items-center font-mono px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60 truncate max-w-[300px]" title={displayValue}>
                                    {displayValue}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                );
                              } else if (field === 'note') {
                                const hasNote = !!(item.note && String(item.note).trim());
                                cellContent = (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActivePopupNote({
                                        title: isWorkouts ? (item.title || 'Workout Note') : (item.name || 'Workout Plan Note'),
                                        content: hasNote ? String(item.note) : 'No note content available.'
                                      });
                                    }}
                                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${hasNote
                                      ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                                      : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                                      }`}
                                    title={hasNote ? 'View Note' : 'No Note'}
                                  >
                                    <MessageSquareMore size={16} />
                                  </button>
                                );
                              } else {
                                cellContent = <span className="truncate max-w-[220px]">{displayValue}</span>;
                              }
                            }
                          }

                          const isCenterAligned = [
                            'gender',
                            'level',
                            'week',
                            'day',
                            'payment_required',
                            'fitness_level',
                            'workout_type',
                            'number_of_set',
                            'number_of_reps',
                            'duration',
                            'order_of_exercise',
                            'price',
                            'note'
                          ].includes(field);

                          return (
                            <div
                              key={field}
                              className={`px-4 border-r border-slate-200/50 last:border-r-0 text-slate-500 text-[14px] flex items-center h-14 ${getColClass(field)} ${isCenterAligned ? 'justify-center' : 'truncate'}`}
                            >
                              {cellContent}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                    <Dumbbell size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No matches found</h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    There are no {title.toLowerCase()} records matching your active filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {activePopupNote && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 mx-4 transform transition-all scale-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 flex-shrink-0">
              <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-1.5">
                <MessageSquareMore size={16} className="text-blue-500" />
                {activePopupNote.title}
              </h3>
              <button
                onClick={() => setActivePopupNote(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 text-[13.5px] text-slate-600 leading-relaxed overflow-y-auto max-h-[250px] whitespace-pre-wrap">
              {activePopupNote.content || 'No note content available.'}
            </div>
            <div className="mt-6 flex justify-end flex-shrink-0">
              <button
                onClick={() => setActivePopupNote(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[13px] font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Configure Workouts Sliding Panel */}
      <WorkoutConfigPanel
        planId={isConfiguring ? (selectedId || null) : null}
        planName={items.find(p => p.id === selectedId)?.name || ''}
        isOpen={isConfiguring}
        onClose={() => setIsConfiguring(false)}
      />
    </div>
  );
}
