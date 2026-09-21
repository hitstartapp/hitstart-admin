'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CommandBar from '@/components/CommandBar';

import GamificationSidebar from './components/GamificationSidebar';
import GamificationTableView from './components/GamificationTableView';
import GamificationSidePanel from './components/GamificationSidePanel';

import { TableConfig, TABLES } from './models';
import { fetchTableDataFromDb, deleteRecordFromDb, fetchBadgeOptions } from './actions';

function GamificationContent() {
  const [selectedTable, setSelectedTable] = useState<TableConfig>(TABLES[0]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState<{ label: string; value: any }[]>([]);
  
  const [selectedRowId, setSelectedRowId] = useState<any | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get('action') as 'new' | 'edit' | null;
  const recordId = searchParams.get('id');

  useEffect(() => {
    async function loadRelations() {
      try {
        const badgeOptions = await fetchBadgeOptions();
        setBadges(badgeOptions);
      } catch (err) {
        console.error('Error fetching relational details:', err);
      }
    }
    loadRelations();
  }, []);

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
    router.push(`/gamification?action=new`);
  };

  const handleEdit = () => {
    if (selectedRowId) {
      router.push(`/gamification?action=edit&id=${selectedRowId}`);
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
      <GamificationSidebar 
        selectedTable={selectedTable} 
        onSelectTable={setSelectedTable} 
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <CommandBar 
          hasSelectionOverride={hasSelection}
          activeIdOverride={selectedRowId || ''}
          onRefresh={() => fetchTableData(selectedTable)}
          onNew={handleNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <div className="flex-1 flex flex-col py-6 min-h-0">
          <GamificationTableView 
            selectedTable={selectedTable}
            items={items}
            loading={loading}
            selectedRowId={selectedRowId}
            setSelectedRowId={setSelectedRowId}
            title={`Active ${selectedTable.name}s`}
          />
        </div>
      </main>

      {action && (
        <GamificationSidePanel 
          action={action} 
          recordId={recordId} 
          table={selectedTable} 
          badges={badges}
          onSuccess={() => fetchTableData(selectedTable)} 
        />
      )}
    </>
  );
}

export default function GamificationPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading gamification...</div>}>
      <GamificationContent />
    </Suspense>
  );
}
