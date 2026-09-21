'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import CommandBar from '@/components/CommandBar';
import ConfigurationSidePanel from './components/ConfigurationSidePanel';
import ConfigurationSidebar from './components/ConfigurationSidebar';
import ConfigurationTable from './components/ConfigurationTable';

import { TableConfig, TABLES } from './models';
import { fetchTableDataFromDb, deleteRecordFromDb } from './actions';

function ConfigurationContent() {
  const [selectedTable, setSelectedTable] = useState<TableConfig>(TABLES[0]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selection State
  const [selectedRowId, setSelectedRowId] = useState<any | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get('action') as 'new' | 'edit' | null;
  const recordId = searchParams.get('id');



  useEffect(() => {
    fetchTableData(selectedTable);
    setSelectedRowId(null);
  }, [selectedTable]);

  async function fetchTableData(table: TableConfig) {
    setLoading(true);
    try {
      const data = await fetchTableDataFromDb(table.dbName);
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
    router.push(`/configuration?action=new`);
  };

  const handleEdit = () => {
    if (selectedRowId) {
      router.push(`/configuration?action=edit&id=${selectedRowId}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedRowId) return;
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteRecordFromDb(selectedTable.dbName, selectedRowId);
      fetchTableData(selectedTable);
      setSelectedRowId(null);
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete record.');
    }
  };

  return (
    <>
      <ConfigurationSidebar 
        selectedTable={selectedTable} 
        onSelectTable={setSelectedTable} 
      />

      {/* Dashboard Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Command Bar */}
        <CommandBar 
          hasSelectionOverride={hasSelection}
          activeIdOverride={selectedRowId || ''}
          onRefresh={() => fetchTableData(selectedTable)}
          onNew={handleNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Workspace body */}
        <div className="flex-1 flex flex-col py-6 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-shrink-0 px-6">
            <h1 className="text-[20px] font-semibold text-slate-800">
              Active {selectedTable.name}s
            </h1>
          </div>

          {/* Table List container */}
          <ConfigurationTable 
            selectedTable={selectedTable}
            items={items}
            loading={loading}
            selectedRowId={selectedRowId}
            setSelectedRowId={setSelectedRowId}
          />
        </div>
      </main>

      {/* SIDE PANEL */}
      {action && (
        <ConfigurationSidePanel 
          action={action} 
          recordId={recordId} 
          table={selectedTable} 
          onSuccess={() => fetchTableData(selectedTable)} 
        />
      )}
    </>
  );
}

export default function ConfigurationPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading configuration...</div>}>
      <ConfigurationContent />
    </Suspense>
  );
}
