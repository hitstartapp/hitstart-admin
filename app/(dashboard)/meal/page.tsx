'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sliders, X } from 'lucide-react';
import CommandBar from '@/components/CommandBar';
import MealSidePanel from './components/MealSidePanel';
import MealConfigPanel from './components/MealConfigPanel';
import MealSidebar from './components/MealSidebar';
import MealTableView from './components/MealTableView';

import { TableConfig, TABLES } from './models';
import { fetchTableData, fetchFoodOptions, deleteRecord } from './actions';

function MealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedTable, setSelectedTable] = useState<TableConfig>(TABLES[0]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<any | null>(null);
  
  const [foods, setFoods] = useState<{ label: string; value: any }[]>([]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const action = searchParams.get('action') as 'new' | 'edit' | 'configure' | null;
  const recordId = searchParams.get('id');
  const planId = searchParams.get('planId');

  useEffect(() => {
    async function loadRelations() {
      const foodData = await fetchFoodOptions();
      setFoods(foodData);
    }
    loadRelations();
  }, []);

  useEffect(() => {
    loadTableData(selectedTable);
    setSelectedRowId(null);
  }, [selectedTable]);

  async function loadTableData(table: TableConfig) {
    setLoading(true);
    try {
      const data = await fetchTableData(table.dbName);
      setItems(data);
    } catch (err) {
      console.error(`Error loading table ${table.name}:`, err);
      alert(`Failed to load data for ${table.name}`);
    } finally {
      setLoading(false);
    }
  }

  const hasSelection = selectedRowId !== null;

  const handleNew = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('action', 'new');
    params.delete('id');
    router.push(`?${params.toString()}`);
  };

  const handleEdit = () => {
    if (!hasSelection) return;
    const params = new URLSearchParams(window.location.search);
    params.set('action', 'edit');
    params.set('id', selectedRowId);
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!hasSelection) return;
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const primaryKeyField = selectedTable.fields.find(f => f.isPrimaryKey)?.name || 'id';
      await deleteRecord(selectedTable.dbName, primaryKeyField, selectedRowId);
      loadTableData(selectedTable);
      setSelectedRowId(null);
    } catch (err) {
      alert('Failed to delete record.');
    }
  };

  return (
    <>
      <MealSidebar 
        tables={TABLES} 
        selectedTable={selectedTable} 
        onSelectTable={setSelectedTable} 
      />

      {/* Dashboard Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] relative overflow-hidden">
        <CommandBar 
          hasSelectionOverride={hasSelection}
          activeIdOverride={selectedRowId || ''}
          onRefresh={() => loadTableData(selectedTable)}
          onNew={handleNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          customActions={
            selectedTable.id === 'mealplan' && hasSelection ? [
              {
                label: 'Configure Meals',
                icon: <Sliders size={14} strokeWidth={2} />,
                onClick: () => {
                  const params = new URLSearchParams(window.location.search);
                  params.set('action', 'configure');
                  params.set('planId', selectedRowId);
                  router.push(`?${params.toString()}`);
                },
                primary: true
              }
            ] : []
          }
        />

        <div className="flex-grow flex flex-col py-6 min-h-0">
          <div className="flex items-center justify-between mb-6 flex-shrink-0 px-6">
            <h1 className="text-[20px] font-semibold text-slate-800">
              Active {selectedTable.name}s
            </h1>
          </div>

          <MealTableView 
            selectedTable={selectedTable} 
            items={items} 
            loading={loading} 
            selectedRowId={selectedRowId} 
            setSelectedRowId={setSelectedRowId} 
            onOpenNote={(note) => setSelectedNote(note)}
          />
        </div>

        {/* Side Panels */}
        <MealSidePanel 
          action={action === 'new' || action === 'edit' ? action : null} 
          recordId={recordId} 
          table={selectedTable} 
          packages={[]} 
          onSuccess={() => loadTableData(selectedTable)} 
        />

        <MealConfigPanel 
          planId={action === 'configure' ? planId : null} 
          planName={items.find(p => String(p.id) === String(planId))?.name || ''} 
          foods={foods} 
        />
      </main>

      {/* Note Popup Modal */}
      {selectedNote !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50 flex-shrink-0">
              <h3 className="font-semibold text-slate-800">Note</h3>
              <button onClick={() => setSelectedNote(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 text-sm text-slate-600 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {selectedNote}
            </div>
            <div className="h-12 border-t border-slate-100 flex items-center justify-end px-4 bg-slate-50 flex-shrink-0">
              <button onClick={() => setSelectedNote(null)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MealPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading meals...</div>}>
      <MealContent />
    </Suspense>
  );
}
