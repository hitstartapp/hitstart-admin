'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Edit2, Trash2, RefreshCw, ArrowLeft, Save, Check, Loader2, GripVertical, Utensils, List, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  fetchPlanMealsWithItems,
  saveMealSection,
  deleteMealSection,
  reorderMealSections,
  fetchMealItemsForMeal,
  saveMealItemWithOptions,
  deleteMealItem
} from '../actions';

interface MealConfigPanelProps {
  planId: string | null;
  planName: string;
  foods: { label: string; value: any }[];
}

export default function MealConfigPanel({ planId, planName, foods }: MealConfigPanelProps) {
  const router = useRouter();

  const [panelMeals, setPanelMeals] = useState<any[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [panelMode, setPanelMode] = useState<'list' | 'new' | 'edit'>('list');
  const [panelSelectedId, setPanelSelectedId] = useState<string | undefined>();
  const [isSavingMeal, setIsSavingMeal] = useState(false);

  const [mealFormState, setMealFormState] = useState({ id: '', name: '', display_type: 'header', meal_order: 1 });

  const [configuringMealId, setConfiguringMealId] = useState<string | null>(null);
  const [isConfiguringMealItems, setIsConfiguringMealItems] = useState(false);

  const [panelMealItems, setPanelMealItems] = useState<any[]>([]);
  const [isLoadingMealItems, setIsLoadingMealItems] = useState(false);
  const [mealItemPanelMode, setMealItemPanelMode] = useState<'list' | 'new' | 'edit'>('list');
  const [mealItemPanelSelectedId, setMealItemPanelSelectedId] = useState<string | undefined>();
  const [isSavingMealItem, setIsSavingMealItem] = useState(false);
  const [mealItemFormState, setMealItemFormState] = useState({ id: '', name: '', note: '', foodIds: [] as any[] });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isOpen = !!planId;

  const handleClose = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('action');
    params.delete('planId');
    router.push(`?${params.toString()}`);
  };

  const fetchMealsForPlan = async () => {
    if (!planId) return;
    setIsLoadingMeals(true);
    try {
      const data = await fetchPlanMealsWithItems(planId);
      setPanelMeals(data || []);
      setPanelSelectedId(undefined);
    } catch (err) {
      console.error('Failed to load meals:', err);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  useEffect(() => {
    if (isOpen && planId) {
      fetchMealsForPlan();
    } else {
      setPanelMeals([]);
      setPanelMode('list');
      setPanelSelectedId(undefined);
      setIsConfiguringMealItems(false);
    }
  }, [isOpen, planId]);

  const handleSaveConfiguredMeal = async (closeAfterSave: boolean) => {
    if (!mealFormState.name) return alert('Name is required');
    setIsSavingMeal(true);
    try {
      const res = await saveMealSection({
        id: panelMode === 'edit' ? mealFormState.id : undefined,
        meal_plan: planId!,
        name: mealFormState.name,
        display_type: mealFormState.display_type,
        meal_order: mealFormState.meal_order
      });
      if (!res.success) throw new Error(res.error || 'Failed to save meal section');

      await fetchMealsForPlan();
      if (closeAfterSave) setPanelMode('list');
    } catch (err) {
      console.error('Failed to save meal:', err);
      alert('Failed to save meal');
    } finally {
      setIsSavingMeal(false);
    }
  };

  const fetchMealItems = async () => {
    if (!configuringMealId) return;
    setIsLoadingMealItems(true);
    try {
      const data = await fetchMealItemsForMeal(configuringMealId);
      setPanelMealItems(data || []);
      setMealItemPanelSelectedId(undefined);
    } catch (err) {
      console.error('Failed to fetch meal items:', err);
    } finally {
      setIsLoadingMealItems(false);
    }
  };

  useEffect(() => {
    if (isConfiguringMealItems && configuringMealId) {
      fetchMealItems();
    } else {
      setPanelMealItems([]);
      setMealItemPanelMode('list');
    }
  }, [isConfiguringMealItems, configuringMealId]);

  const handleSaveConfiguredMealItem = async (closeAfterSave: boolean) => {
    if (!mealItemFormState.name) return alert('Meal Name is required');
    setIsSavingMealItem(true);
    try {
      const res = await saveMealItemWithOptions({
        id: mealItemPanelMode === 'edit' ? mealItemFormState.id : undefined,
        meal: configuringMealId!,
        name: mealItemFormState.name,
        note: mealItemFormState.note || null,
        foodIds: mealItemFormState.foodIds
      });
      if (!res.success) throw new Error(res.error || 'Failed to save meal item');

      await fetchMealItems();
      if (closeAfterSave) setMealItemPanelMode('list');
    } catch (err) {
      console.error('Failed to save meal item:', err);
      alert('Failed to save meal item');
    } finally {
      setIsSavingMealItem(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...panelMeals];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    // Update visual orders
    const updatedWithOrder = newItems.map((item, i) => ({ ...item, meal_order: i + 1 }));
    setPanelMeals(updatedWithOrder);
    setDraggedIndex(index);
  };

  const handleDragLeave = (index: number) => { };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null) {
      try {
        const payload = panelMeals.map(m => ({ id: m.id, meal_order: m.meal_order }));
        await reorderMealSections(payload);
      } catch (err) {
        console.error('Error saving new order:', err);
      }
      setDraggedIndex(null);
    }
  };

  return (
    <>
      <div
        className={`absolute inset-y-0 right-0 z-40 bg-[#F8FAFC] border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out transform w-full md:w-3/4 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer -ml-2"
              title="Close"
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">
              {planName || 'Untitled Plan'}
            </h2>
          </div>

          {/* Meals Mini CommandBar */}
          <div className="h-11 bg-white border-b border-slate-200 flex items-center px-6 gap-1 select-none flex-shrink-0 z-20">
            {panelMode === 'list' ? (
              <>
                <button
                  onClick={() => {
                    setMealFormState({
                      id: '',
                      name: '',
                      display_type: 'header',
                      meal_order: panelMeals.length > 0 ? Math.max(...panelMeals.map(m => m.meal_order || 0)) + 1 : 1
                    });
                    setPanelMode('new');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <Plus size={15} className="text-emerald-600" strokeWidth={2.5} />
                  <span>New Meal</span>
                </button>

                <button
                  disabled={!panelSelectedId}
                  onClick={() => {
                    const mToEdit = panelMeals.find(m => m.id === panelSelectedId);
                    if (mToEdit) {
                      setMealFormState({
                        id: mToEdit.id,
                        name: mToEdit.name || '',
                        display_type: mToEdit.display_type || 'header',
                        meal_order: mToEdit.meal_order ?? 1
                      });
                      setPanelMode('edit');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <Edit2 size={14} className="text-indigo-600" strokeWidth={2} />
                  <span>Edit</span>
                </button>

                <button
                  disabled={!panelSelectedId}
                  onClick={async () => {
                    if (!panelSelectedId) return;
                    if (!confirm('Are you sure you want to delete this meal?')) return;
                    try {
                      const delRes = await deleteMealSection(panelSelectedId);
                      if (!delRes.success) throw new Error(delRes.error || 'Failed to delete meal');
                      setPanelSelectedId(undefined);

                      const remaining = panelMeals.filter(m => m.id !== panelSelectedId);
                      const updated = remaining.map((m, i) => ({ id: m.id, meal_order: i + 1 }));
                      if (updated.length > 0) {
                        await reorderMealSections(updated);
                      }
                      fetchMealsForPlan();
                    } catch (err) {
                      console.error('Failed to delete meal:', err);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} className="text-red-500" strokeWidth={2} />
                  <span>Delete</span>
                </button>

                <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>

                <button
                  onClick={fetchMealsForPlan}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} className="text-slate-500" strokeWidth={2} />
                  <span>Refresh</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setPanelMode('list')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft size={15} className="text-slate-600" strokeWidth={2} />
                  <span>Back</span>
                </button>

                <button
                  disabled={isSavingMeal}
                  onClick={() => handleSaveConfiguredMeal(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingMeal ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <Save size={14} className="text-blue-600" strokeWidth={2} />}
                  <span>Save</span>
                </button>

                <button
                  disabled={isSavingMeal}
                  onClick={() => handleSaveConfiguredMeal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingMeal ? <Loader2 size={14} className="animate-spin text-emerald-600" /> : <Check size={14} className="text-emerald-600" strokeWidth={2.5} />}
                  <span>Save & Close</span>
                </button>
              </>
            )}
          </div>

          {/* Meals Content */}
          {panelMode !== 'list' ? (
            <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col items-center justify-start min-h-0 w-full">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 w-full max-w-xl">
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Meal Name</label>
                    <input
                      type="text"
                      value={mealFormState.name}
                      onChange={(e) => setMealFormState(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800"
                      placeholder="e.g. Breakfast, Pre-Workout Snack..."
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Display Type</label>
                    <div className="relative">
                      <select
                        value={mealFormState.display_type}
                        onChange={(e) => setMealFormState(prev => ({ ...prev, display_type: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer pr-10 font-medium text-slate-800 text-sm"
                      >
                        <option value="header">Header (Main Meal)</option>
                        <option value="body">Body (Sub-Meal / Item)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Order</label>
                    <input
                      type="number"
                      min={1}
                      value={mealFormState.meal_order}
                      onChange={(e) => setMealFormState(prev => ({ ...prev, meal_order: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-hidden min-h-0 flex flex-col">
              {isLoadingMeals ? (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 size={28} className="animate-spin text-indigo-500" />
                  <span className="text-sm font-medium">Loading meals...</span>
                </div>
              ) : panelMeals.length > 0 ? (
                <div className="flex flex-col divide-y divide-slate-100 flex-1 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xs">
                  {panelMeals.map((m, index) => {
                    const isPanelSelected = panelSelectedId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPanelSelectedId(isPanelSelected ? undefined : m.id)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragLeave={() => handleDragLeave(index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`p-6 hover:bg-slate-50/50 transition-all flex gap-3 items-start cursor-pointer border-l-4 relative ${isPanelSelected ? 'bg-indigo-50/40 border-indigo-600 shadow-sm' : 'border-transparent'} ${draggedIndex === index ? 'opacity-30 border-dashed border-slate-300' : ''} ${draggedIndex !== null ? '[&>*]:pointer-events-none' : ''}`}
                      >
                        <div className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
                          <GripVertical size={16} />
                        </div>

                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100/50 shadow-sm font-bold text-indigo-600 text-sm">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-bold text-[15px] text-slate-800 tracking-tight">{m.name}</h3>
                            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">{m.display_type}</span>
                            {m.display_type === 'body' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfiguringMealId(m.id);
                                  setIsConfiguringMealItems(true);
                                  setMealItemPanelMode('list');
                                }}
                                className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[12px] font-semibold transition-colors shadow-sm border border-indigo-100"
                              >
                                <Plus size={14} strokeWidth={2.5} />
                                <span>Add Meals</span>
                              </button>
                            )}
                          </div>
                          {m.MealItemFood && m.MealItemFood.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {m.MealItemFood.map((mf: any, i: number) => {
                                const foodName = foods.find(f => f.value === mf.food)?.label || 'Unknown Food';
                                return (
                                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    {foodName}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                    <Utensils size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No meals configured</h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    This meal plan has no meals yet. Click the "New Meal" button above to add one.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub-drawer for Meal Items */}
      <div
        className={`absolute inset-y-0 right-0 z-50 bg-[#F8FAFC] border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out transform w-full md:w-3/4 ${isConfiguringMealItems ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full w-full">
          {/* Meal Items Header */}
          <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setIsConfiguringMealItems(false)}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer -ml-2"
              title="Close Meals"
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">
              Meals for {panelMeals.find(m => m.id === configuringMealId)?.name || 'Option'}
            </h2>
          </div>

          {/* Meal Items Mini CommandBar */}
          <div className="h-11 bg-white border-b border-slate-200 flex items-center px-6 gap-1 select-none flex-shrink-0 z-20">
            {mealItemPanelMode === 'list' ? (
              <>
                <button
                  onClick={() => {
                    setMealItemFormState({ id: '', name: '', note: '', foodIds: [] });
                    setMealItemPanelMode('new');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <Plus size={15} className="text-emerald-600" strokeWidth={2.5} />
                  <span>New Meal</span>
                </button>

                <button
                  disabled={!mealItemPanelSelectedId}
                  onClick={() => {
                    const mToEdit = panelMealItems.find(m => m.id === mealItemPanelSelectedId);
                    if (mToEdit) {
                      setMealItemFormState({
                        id: mToEdit.id,
                        name: mToEdit.name || '',
                        note: mToEdit.note || '',
                        foodIds: mToEdit.MealItemFood
                          ? mToEdit.MealItemFood.map((f: any) => f.food)
                          : (mToEdit.MealItemFoodMap ? mToEdit.MealItemFoodMap.map((f: any) => f.food) : [])
                      });
                      setMealItemPanelMode('edit');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <Edit2 size={14} className="text-indigo-600" strokeWidth={2} />
                  <span>Edit</span>
                </button>

                <button
                  disabled={!mealItemPanelSelectedId}
                  onClick={async () => {
                    if (!mealItemPanelSelectedId) return;
                    if (!confirm('Are you sure you want to delete this meal?')) return;
                    try {
                      const delRes = await deleteMealItem(mealItemPanelSelectedId);
                      if (!delRes.success) throw new Error(delRes.error || 'Failed to delete meal');
                      setMealItemPanelSelectedId(undefined);
                      fetchMealItems();
                    } catch (err) {
                      console.error('Failed to delete meal:', err);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} className="text-red-500" strokeWidth={2} />
                  <span>Delete</span>
                </button>

                <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>

                <button
                  onClick={fetchMealItems}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} className="text-slate-500" strokeWidth={2} />
                  <span>Refresh</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setMealItemPanelMode('list')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft size={15} className="text-slate-600" strokeWidth={2} />
                  <span>Back</span>
                </button>

                <button
                  disabled={isSavingMealItem}
                  onClick={() => handleSaveConfiguredMealItem(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingMealItem ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <Save size={14} className="text-blue-600" strokeWidth={2} />}
                  <span>Save</span>
                </button>

                <button
                  disabled={isSavingMealItem}
                  onClick={() => handleSaveConfiguredMealItem(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingMealItem ? <Loader2 size={14} className="animate-spin text-emerald-600" /> : <Check size={14} className="text-emerald-600" strokeWidth={2.5} />}
                  <span>Save & Close</span>
                </button>
              </>
            )}
          </div>

          {/* Meal Items Content */}
          {mealItemPanelMode !== 'list' ? (
            <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col items-center justify-start min-h-0 w-full">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 w-full max-w-xl">
                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Meal Name</label>
                    <input
                      type="text"
                      value={mealItemFormState.name}
                      onChange={(e) => setMealItemFormState(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800"
                      placeholder="e.g. Oats, Egg Omelet, Roasted Nuts..."
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (Optional)</label>
                    <textarea
                      value={mealItemFormState.note}
                      onChange={(e) => setMealItemFormState(prev => ({ ...prev, note: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800"
                      placeholder="e.g. Mix well before eating..."
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Foods (Ingredients)</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl max-h-60 overflow-y-auto p-2">
                      {foods.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {foods.map(food => (
                            <label key={food.value} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors group">
                              <div className={`flex items-center justify-center w-5 h-5 rounded border ${mealItemFormState.foodIds.includes(food.value) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white group-hover:border-indigo-400'}`}>
                                {mealItemFormState.foodIds.includes(food.value) && <Check size={12} strokeWidth={3} />}
                              </div>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={mealItemFormState.foodIds.includes(food.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setMealItemFormState(prev => ({ ...prev, foodIds: [...prev.foodIds, food.value] }));
                                  } else {
                                    setMealItemFormState(prev => ({ ...prev, foodIds: prev.foodIds.filter(id => id !== food.value) }));
                                  }
                                }}
                              />
                              <span className="text-sm font-medium text-slate-700">{food.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-500">
                          No foods available. Please create some foods first in the Food table.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-hidden min-h-0 flex flex-col">
              {isLoadingMealItems ? (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 size={28} className="animate-spin text-indigo-500" />
                  <span className="text-sm font-medium">Loading meals...</span>
                </div>
              ) : panelMealItems.length > 0 ? (
                <div className="flex flex-col divide-y divide-slate-100 flex-1 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xs">
                  {panelMealItems.map((m, index) => {
                    const isSelected = mealItemPanelSelectedId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setMealItemPanelSelectedId(isSelected ? undefined : m.id)}
                        className={`p-6 hover:bg-slate-50/50 transition-all flex gap-3 items-center cursor-pointer border-l-4 relative ${isSelected ? 'bg-indigo-50/40 border-indigo-600 shadow-sm' : 'border-transparent'}`}
                      >
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-bold text-[15px] text-slate-800 tracking-tight">{m.name}</h3>
                          </div>
                          {m.note && <p className="text-sm text-slate-500 line-clamp-2">{m.note}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                    <List size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No meals configured</h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    This option has no meals yet. Click the "New Meal" button above to add one.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
