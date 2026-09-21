'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Edit2, Trash2, RefreshCw, ArrowLeft, Save, Check, Loader2, GripVertical, Dumbbell, ChevronDown } from 'lucide-react';
import { fetchWorkoutsForPlan as fetchWorkoutsAction, fetchAllExerciseVariationsList, saveWorkoutItem, deleteWorkoutItem, reorderWorkoutItems } from '../actions';

interface WorkoutConfigPanelProps {
  planId: string | null;
  planName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkoutConfigPanel({ planId, planName, isOpen, onClose }: WorkoutConfigPanelProps) {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [exerciseVariationMap, setExerciseVariationMap] = useState<Record<string, string>>({});
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [panelSelectedId, setPanelSelectedId] = useState<string | undefined>(undefined);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [panelMode, setPanelMode] = useState<'list' | 'new' | 'edit'>('list');
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [exerciseVariationsList, setExerciseVariationsList] = useState<{ id: string; name: string }[]>([]);
  const [workoutFormState, setWorkoutFormState] = useState<{
    id?: string;
    exercise: string;
    workout_type: string;
    number_of_set: number;
    number_of_reps: number;
    duration: string;
    note: string;
  }>({
    exercise: '',
    workout_type: 'count_reps',
    number_of_set: 3,
    number_of_reps: 10,
    duration: '',
    note: ''
  });



  const fetchWorkoutsForPlan = async () => {
    if (!planId) return;
    setIsLoadingWorkouts(true);
    try {
      const [workoutsList, allVarsData] = await Promise.all([
        fetchWorkoutsAction(planId),
        fetchAllExerciseVariationsList()
      ]);

      setWorkouts(workoutsList);
      setExerciseVariationsList(allVarsData);

      const varMap = Object.fromEntries(allVarsData.map((v: any) => [v.id, v.name]));
      setExerciseVariationMap(varMap);
    } catch (err) {
      console.error('Error fetching workouts for plan:', err);
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  useEffect(() => {
    if (isOpen && planId) {
      setPanelMode('list');
      setPanelSelectedId(undefined);
      fetchWorkoutsForPlan();
    } else {
      setWorkouts([]);
      setExerciseVariationMap({});
    }
  }, [isOpen, planId]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex !== null) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (index: number) => {
    setDragOverIndex(prev => prev === index ? null : prev);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...workouts];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    const updated = reordered.map((w, i) => ({
      ...w,
      order_of_exercise: i + 1,
    }));

    setWorkouts(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      const payload = updated.map(w => ({
        id: w.id,
        order_of_exercise: w.order_of_exercise
      }));
      await reorderWorkoutItems(payload);
    } catch (err) {
      console.error('Error saving reordered workouts:', err);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveWorkout = async (shouldClose: boolean) => {
    if (!workoutFormState.exercise) {
      alert('Please select an Exercise Variation.');
      return;
    }

    setIsSavingWorkout(true);
    try {
      const payload: any = {
        workout_plan: planId,
        exercise: workoutFormState.exercise,
        workout_type: workoutFormState.workout_type,
        note: workoutFormState.note || null,
      };

      if (workoutFormState.workout_type === 'timer') {
        payload.number_of_set = null;
        payload.number_of_reps = null;
        payload.duration = workoutFormState.duration || '0s';
      } else if (workoutFormState.workout_type === 'timer_reps') {
        payload.number_of_set = workoutFormState.number_of_set;
        payload.number_of_reps = null;
        payload.duration = workoutFormState.duration || '0s';
      } else {
        payload.number_of_set = workoutFormState.number_of_set;
        payload.number_of_reps = workoutFormState.number_of_reps;
        payload.duration = null;
      }

      if (panelMode === 'new') {
        payload.order_of_exercise = workouts.length + 1;
      } else {
        payload.id = workoutFormState.id;
      }

      const saveRes = await saveWorkoutItem(payload);
      if (!saveRes.success) throw new Error(saveRes.error || 'Failed to save workout');

      await fetchWorkoutsForPlan();

      if (shouldClose) {
        setPanelMode('list');
      } else if (panelMode === 'new' && saveRes.data?.id) {
        setWorkoutFormState(prev => ({ ...prev, id: saveRes.data.id }));
        setPanelSelectedId(saveRes.data.id);
        setPanelMode('edit');
      }
    } catch (err) {
      console.error('Failed to save workout:', err);
      alert('Error saving workout: ' + (err as any).message);
    } finally {
      setIsSavingWorkout(false);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 bg-[#F8FAFC] border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out transform w-[700px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex flex-col h-full w-full">
        <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer -ml-2"
            title="Close"
          >
            <ChevronRight size={20} />
          </button>
          <h2 className="text-lg font-semibold text-slate-800">
            {planName || 'Untitled Plan'}
          </h2>
        </div>

        <div className="h-11 bg-white border-b border-slate-200 flex items-center px-6 gap-1 select-none flex-shrink-0 z-20">
          {panelMode === 'list' ? (
            <>
              <button
                onClick={() => {
                  setWorkoutFormState({
                    exercise: '',
                    workout_type: 'count_reps',
                    number_of_set: 3,
                    number_of_reps: 10,
                    duration: '',
                    note: ''
                  });
                  setPanelMode('new');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
              >
                <Plus size={15} className="text-emerald-600" strokeWidth={2.5} />
                <span>New</span>
              </button>

              <button
                disabled={!panelSelectedId}
                onClick={() => {
                  const wToEdit = workouts.find(w => w.id === panelSelectedId);
                  if (wToEdit) {
                    setWorkoutFormState({
                      id: wToEdit.id,
                      exercise: wToEdit.exercise || '',
                      workout_type: wToEdit.workout_type || 'count_reps',
                      number_of_set: wToEdit.number_of_set ?? 3,
                      number_of_reps: wToEdit.number_of_reps ?? 10,
                      duration: wToEdit.duration || '',
                      note: wToEdit.note || ''
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
                  if (!confirm('Are you sure you want to delete this workout?')) return;
                  try {
                    const delRes = await deleteWorkoutItem(panelSelectedId);
                    if (!delRes.success) throw new Error(delRes.error || 'Failed to delete workout');
                    setPanelSelectedId(undefined);
                    const remaining = workouts.filter(w => w.id !== panelSelectedId);
                    const updated = remaining.map((w, i) => ({
                      id: w.id,
                      order_of_exercise: i + 1
                    }));
                    if (updated.length > 0) {
                      await reorderWorkoutItems(updated);
                    }
                    fetchWorkoutsForPlan();
                  } catch (err) {
                    console.error('Failed to delete workout:', err);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              >
                <Trash2 size={14} className="text-red-500" strokeWidth={2} />
                <span>Delete</span>
              </button>

              <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>

              <button
                onClick={fetchWorkoutsForPlan}
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
                disabled={isSavingWorkout}
                onClick={() => handleSaveWorkout(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingWorkout ? (
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                ) : (
                  <Save size={14} className="text-blue-600" strokeWidth={2} />
                )}
                <span>Save</span>
              </button>

              <button
                disabled={isSavingWorkout}
                onClick={() => handleSaveWorkout(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingWorkout ? (
                  <Loader2 size={14} className="animate-spin text-emerald-600" />
                ) : (
                  <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
                )}
                <span>Save & Close</span>
              </button>
            </>
          )}
        </div>

        {panelMode !== 'list' ? (
          <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col items-center justify-start min-h-0 w-full">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Exercise Variation</label>
                  <div className="relative">
                    <select
                      value={workoutFormState.exercise}
                      onChange={(e) => setWorkoutFormState(prev => ({ ...prev, exercise: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer pr-10 font-medium text-slate-800 text-sm"
                    >
                      <option value="">-- Select Exercise Variation --</option>
                      {exerciseVariationsList.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Workout Type</label>
                  <div className="relative">
                    <select
                      value={workoutFormState.workout_type}
                      onChange={(e) => setWorkoutFormState(prev => ({ ...prev, workout_type: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer pr-10 font-medium text-slate-800 text-sm"
                    >
                      <option value="count_reps">Count & Reps (Normal)</option>
                      <option value="count_secs">Count & Secs</option>
                      <option value="timer">Timer (Only Duration)</option>
                      <option value="timer_reps">Timer & Reps (Sets + Timer)</option>
                      <option value="max_reps">Max Reps</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {workoutFormState.workout_type !== 'timer' && (
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Sets</label>
                    <input
                      type="number"
                      min={1}
                      value={workoutFormState.number_of_set}
                      onChange={(e) => setWorkoutFormState(prev => ({ ...prev, number_of_set: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                )}

                {workoutFormState.workout_type !== 'timer' && workoutFormState.workout_type !== 'timer_reps' && (
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Reps</label>
                    <input
                      type="number"
                      min={0}
                      value={workoutFormState.number_of_reps}
                      onChange={(e) => setWorkoutFormState(prev => ({ ...prev, number_of_reps: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                )}

                {(workoutFormState.workout_type === 'timer' || workoutFormState.workout_type === 'timer_reps') && (
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (e.g. 30s or 30000)</label>
                    <input
                      type="text"
                      value={workoutFormState.duration}
                      placeholder="e.g. 30s"
                      onChange={(e) => setWorkoutFormState(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                )}

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes / Description</label>
                  <textarea
                    value={workoutFormState.note}
                    rows={4}
                    onChange={(e) => setWorkoutFormState(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="e.g. Keep core tight. Rest 60s between sets."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white text-slate-700 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-hidden min-h-0 flex flex-col">
            {isLoadingWorkouts ? (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 size={28} className="animate-spin text-indigo-500" />
                <span className="text-sm font-medium">Loading workouts...</span>
              </div>
            ) : workouts.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-100 flex-1 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xs">
                {workouts.map((w, index) => {
                  const isPanelSelected = panelSelectedId === w.id;
                  const workoutTitle = exerciseVariationMap[w.exercise] || w.title || 'Untitled Workout';
                  const hasNote = w.note && String(w.note).trim() !== 'NA' && String(w.note).trim() !== '';

                  return (
                    <div
                      key={w.id}
                      onClick={() => setPanelSelectedId(isPanelSelected ? undefined : w.id)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragLeave={() => handleDragLeave(index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`p-6 hover:bg-slate-50/50 transition-all flex gap-3 items-start cursor-pointer border-l-4 relative ${isPanelSelected ? 'bg-indigo-50/40 border-indigo-600 shadow-sm' : 'border-transparent'} ${draggedIndex === index ? 'opacity-30 border-dashed border-slate-300' : ''} ${draggedIndex !== null ? '[&>*]:pointer-events-none' : ''}`}
                    >
                      {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600 z-10 pointer-events-none rounded animate-pulse" />
                      )}
                      {w.order_of_exercise !== undefined && w.order_of_exercise !== null && (
                        <div className="flex-shrink-0 h-8 flex items-center gap-1 select-none">
                          <GripVertical size={16} className="text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold" title="Order of Exercise">
                            {w.order_of_exercise}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="h-8 flex items-center mb-1">
                          <h3 className="font-bold text-[16px] text-slate-800 truncate">
                            {workoutTitle}
                          </h3>
                          {w.workout_type && (
                            <div className="ml-6">
                              <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {w.workout_type}
                              </span>
                            </div>
                          )}
                        </div>

                        {w.workout_type === 'timer' ? (
                          <div className="flex flex-col gap-2 my-4 select-none">
                            <div className="flex items-center gap-4">
                              <span className="w-10 text-xs font-bold text-slate-500 uppercase tracking-wider">Timer</span>
                              <span className="inline-flex items-center justify-center min-w-[50px] px-3 h-8 rounded-full bg-slate-100 text-slate-700 text-[13px] font-semibold">
                                {w.duration || '0s'}
                              </span>
                            </div>
                          </div>
                        ) : w.workout_type === 'timer_reps' ? (
                          <div className="flex flex-col gap-2 my-4 select-none">
                            <div className="flex items-center gap-4">
                              <span className="w-10 text-xs font-bold text-slate-500 uppercase tracking-wider">Sets</span>
                              <div className="flex items-center gap-2">
                                {Array.from({ length: w.number_of_set || 0 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center justify-center min-w-[50px] px-3 h-8 rounded-full bg-slate-100 text-slate-700 text-[13px] font-semibold"
                                  >
                                    {i + 1}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="w-10 text-xs font-bold text-slate-500 uppercase tracking-wider">Timer</span>
                              <div className="flex">
                                <span
                                  className="inline-flex items-center justify-center h-8 rounded-full bg-slate-100 text-slate-700 text-[13px] font-semibold px-4 truncate"
                                  style={{
                                    width: `${(w.number_of_set || 1) * 50 + ((w.number_of_set || 1) - 1) * 8}px`
                                  }}
                                >
                                  {w.duration || '0s'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 my-4 select-none">
                            <div className="flex items-center gap-4">
                              <span className="w-10 text-xs font-bold text-slate-500 uppercase tracking-wider">Sets</span>
                              <div className="flex items-center gap-2">
                                {Array.from({ length: w.number_of_set || 0 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center justify-center min-w-[50px] px-3 h-8 rounded-full bg-slate-100 text-slate-700 text-[13px] font-semibold"
                                  >
                                    {i + 1}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="w-10 text-xs font-bold text-slate-500 uppercase tracking-wider">Reps</span>
                              <div className="flex items-center gap-2">
                                {Array.from({ length: w.number_of_set || 0 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center justify-center min-w-[50px] px-3 h-8 rounded-full bg-slate-100 text-slate-700 text-[13px] font-semibold"
                                  >
                                    {w.number_of_reps ?? 0}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <p className="text-slate-500 text-[14px] leading-relaxed">
                          {hasNote ? w.note : 'No description or note available for this workout.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center px-6">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <Dumbbell size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No workouts found</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  There are no workouts configured for this workout plan yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
