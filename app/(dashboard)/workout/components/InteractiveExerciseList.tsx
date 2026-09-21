'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveExercise, deleteExercise } from '../actions';
import { Dumbbell, Pencil, Loader2 } from 'lucide-react';

interface ExerciseItem {
  id: string;
  name: string;
  category: string | null;
}

interface InteractiveExerciseListProps {
  initialItems: ExerciseItem[];
  selectedExerciseId?: string;
  itemIcon: React.ReactNode;
}

const CATEGORIES = [
  'Cardio',
  'Legs',
  'Triceps',
  'Chest',
  'Back',
  'Glutes',
  'Shoulder',
  'Full Body',
  'Core',
  'Biceps',
];

export default function InteractiveExerciseList({
  initialItems,
  selectedExerciseId,
  itemIcon,
}: InteractiveExerciseListProps) {
  const router = useRouter();
  const [items, setItems] = useState<ExerciseItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  React.useEffect(() => {
    if (!selectedExerciseId && items.length > 0) {
      router.replace(`/workout?view=exercises&exerciseId=${items[0].id}`, { scroll: false });
    }
  }, [selectedExerciseId, items, router]);

  React.useEffect(() => {
    const handleAdd = () => {
      // Don't add multiple blank items
      if (items.some(item => item.id.startsWith('temp-'))) return;

      const newId = `temp-${Date.now()}`;
      const newExercise: ExerciseItem = {
        id: newId,
        name: '',
        category: '',
      };
      setItems((prev) => [newExercise, ...prev]);
      setEditingId(newId);
      setEditName('');
      setEditCategory('');
    };

    window.addEventListener('add-exercise', handleAdd);
    return () => {
      window.removeEventListener('add-exercise', handleAdd);
    };
  }, [items]);

  React.useEffect(() => {
    const handleEdit = () => {
      if (!selectedExerciseId) return;
      const item = items.find(item => item.id === selectedExerciseId);
      if (item) {
        setEditingId(item.id);
        setEditName(item.name || '');
        setEditCategory(item.category || '');
      }
    };

    const handleDelete = async () => {
      if (!selectedExerciseId) return;
      try {
        setIsSaving(true);
        const res = await deleteExercise(selectedExerciseId);
        if (!res.success) throw new Error(res.error || 'Failed to delete exercise');
        
        setItems((prev) => prev.filter(item => item.id !== selectedExerciseId));
        router.push('/workout?view=exercises');
        router.refresh();
      } catch (err) {
        console.error('Error deleting exercise:', err);
        alert('Failed to delete exercise');
      } finally {
        setIsSaving(false);
      }
    };

    window.addEventListener('edit-exercise', handleEdit);
    window.addEventListener('delete-exercise', handleDelete);
    return () => {
      window.removeEventListener('edit-exercise', handleEdit);
      window.removeEventListener('delete-exercise', handleDelete);
    };
  }, [selectedExerciseId, items, router]);

  React.useEffect(() => {
    if (editingId) {
      window.dispatchEvent(new CustomEvent('inline-editing-start'));
    } else {
      window.dispatchEvent(new CustomEvent('inline-editing-stop'));
    }
  }, [editingId]);

  React.useEffect(() => {
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
  }, [editingId, editName, editCategory]);

  const handleDoubleClick = (item: ExerciseItem) => {
    setEditingId(item.id);
    setEditName(item.name || '');
    setEditCategory(item.category || '');
  };

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      const res = await saveExercise({
        id,
        name: editName.trim(),
        category: editCategory || null,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to save exercise');
      }

      const savedData = res.data;

      if (!savedData) {
        throw new Error('No data returned from database.');
      }

      // Update local state instantly with new database values
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, id: savedData.id, name: savedData.name, category: savedData.category } : item
        )
      );
      setEditingId(null);

      // Navigate to the newly created exercise, or update route state
      router.push(`/workout?view=exercises&exerciseId=${savedData.id}`);
      router.refresh();
    } catch (err) {
      console.error('Error saving exercise:', err);
      alert('Failed to save exercise. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (id: string) => {
    if (id.startsWith('temp-')) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSave(id);
    } else if (e.key === 'Escape') {
      handleCancel(id);
    }
  };

function ExerciseEditItem({ item, editName, editCategory, setEditName, setEditCategory, handleKeyDown, isSaving }: any) {
  return (
    <div
      className="flex items-center bg-indigo-50/30 border-b border-slate-100 flex-shrink-0 gap-0"
    >
      {/* Exercise input */}
      <div className="flex-1 px-4 border-r border-slate-200/50 py-2.5 h-14 flex items-center gap-3 min-w-0">
        <div
          className={`w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
            isSaving ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-50 text-amber-500'
          }`}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Pencil size={12} className="animate-pulse" />
          )}
        </div>

        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, item.id)}
          className="flex-1 min-w-0 px-2 py-0.5 text-[13px] bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          autoFocus
          placeholder="Exercise name"
          disabled={isSaving}
        />
      </div>

      {/* Category select */}
      <div className="w-28 px-4 py-2.5 h-14 flex items-center justify-end">
        <select
          value={editCategory}
          onChange={(e) => setEditCategory(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, item.id)}
          className="w-full text-center px-2 py-1 rounded-full text-[12px] font-bold bg-white text-indigo-700 border border-indigo-200 shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
          disabled={isSaving}
        >
          <option value="">-</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ExerciseViewItem({ item, isActive, itemIcon }: any) {
  return (
    <div
      className={`flex items-center border-b border-slate-100 hover:bg-slate-50/40 transition-colors flex-shrink-0 ${isActive ? 'bg-blue-50/30' : 'bg-white'
        }`}
    >
      <Link
        href={`/workout?view=exercises&exerciseId=${item.id}`}
        className="flex-1 px-4 border-r border-slate-200/50 py-2.5 h-14 flex items-center gap-3 cursor-pointer min-w-0"
      >
        <div
          className={`w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 text-xs ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
        >
          {itemIcon}
        </div>
        <span className="font-semibold text-[13px] text-[#0f6cbd] hover:underline truncate">
          {item.name || 'Untitled'}
        </span>
      </Link>

      {/* Category Link */}
      <Link
        href={`/workout?view=exercises&exerciseId=${item.id}`}
        className="w-28 px-4 py-2.5 h-14 flex items-center justify-end cursor-pointer"
      >
        <span
          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-bold transition-colors border shadow-xs whitespace-nowrap ${isActive
              ? 'bg-white text-indigo-700 border-indigo-200'
              : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
        >
          {item.category || '-'}
        </span>
      </Link>
    </div>
  );
}

  return (
    <div className="flex flex-col divide-y divide-slate-100 flex-1 overflow-y-auto no-scrollbar">
      {items.length > 0 ? (
        items.map((item: ExerciseItem, index: number) => {
          const isActive = item.id === selectedExerciseId;
          const isEditing = editingId === item.id;

          if (isEditing) {
            return (
              <ExerciseEditItem
                key={item.id}
                item={item}
                editName={editName}
                editCategory={editCategory}
                setEditName={setEditName}
                setEditCategory={setEditCategory}
                handleKeyDown={handleKeyDown}
                isSaving={isSaving}
              />
            );
          }

          return (
            <ExerciseViewItem
              key={item.id || index}
              item={item}
              isActive={isActive}
              itemIcon={itemIcon}
            />
          );
        })
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Dumbbell size={24} className="text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">No exercises found.</p>
        </div>
      )}
    </div>
  );
}

