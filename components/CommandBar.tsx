'use client';

import React, { Suspense, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Pencil, Trash2, Check, X, XCircle, RefreshCw, ArrowLeft, Save, Sliders } from 'lucide-react';
import { approveAccountDeletionRequest, rejectAccountDeletionRequest, deleteUser } from '@/app/(dashboard)/users/actions';
import { deleteWorkoutPlan, deleteVariationById } from '@/app/(dashboard)/workout/actions';

export function CommandBarContent({
  scope = 'default',
  hasSelectionOverride,
  activeIdOverride,
  onNew,
  onEdit,
  onDelete,
  onRefresh,
  customActions
}: {
  scope?: 'default' | 'variation',
  hasSelectionOverride?: boolean,
  activeIdOverride?: string,
  onNew?: () => void,
  onEdit?: () => void,
  onDelete?: () => void,
  onRefresh?: () => void,
  customActions?: { label: string, icon: React.ReactNode, onClick: () => void, disabled?: boolean, primary?: boolean }[]
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get('userId');
  const exerciseId = searchParams.get('exerciseId');
  const variationId = searchParams.get('variationId');
  const planId = searchParams.get('planId');
  const view = searchParams.get('view') || 'plans';
  const action = searchParams.get('action');

  const tab = searchParams.get('tab') || 'users';
  const requestId = searchParams.get('requestId');
  const reqUserId = searchParams.get('reqUserId');

  const isUsersPage = pathname === '/' || pathname.startsWith('/users');
  const isDeletionRequests = isUsersPage && tab === 'deletion-requests';
  const isWorkoutPage = pathname === '/workout';
  const isUserFormPage = pathname.startsWith('/users/') && pathname.split('/').length > 2;
  const isVariationFormPage = pathname.startsWith('/workout/variations/') && pathname.split('/').length > 3;
  const isWorkoutPlanFormPage = pathname.startsWith('/workout/plans/') && pathname.split('/').length > 3;
  const isFormPage = isUserFormPage || isVariationFormPage || isWorkoutPlanFormPage;

  // Determine active selection
  let hasSelection = hasSelectionOverride !== undefined ? hasSelectionOverride : false;
  let activeId = activeIdOverride !== undefined ? activeIdOverride : '';

  if (scope === 'variation') {
    hasSelection = !!variationId;
    activeId = variationId || '';
  } else {
    if (isUsersPage) {
      if (pathname === '/users') {
        hasSelection = !!userId;
        activeId = userId || '';
      } else {
        // If we are on detail page like /users/[id], the id itself is the active selection
        const parts = pathname.split('/');
        const id = parts[parts.length - 1];
        if (id && id !== 'new' && id !== 'users') {
          hasSelection = true;
          activeId = id;
        }
      }
    } else if (isWorkoutPage) {
      if (view === 'exercises') {
        hasSelection = !!exerciseId;
        activeId = exerciseId || '';
      } else if (view === 'plans') {
        hasSelection = !!planId;
        activeId = planId || '';
      }
    }
  }

  const handleNew = () => {
    if (onNew) {
      onNew();
      return;
    }

    if (scope === 'variation') {
      const params = new URLSearchParams(window.location.search);
      params.set('action', 'new');
      params.delete('variationId');
      router.push(`/workout?${params.toString()}`);
    } else if (isUsersPage) {
      router.push(`/users?action=new`);
    } else if (isWorkoutPage) {
      if (view === 'exercises') {
        window.dispatchEvent(new CustomEvent('add-exercise'));
      } else if (view === 'plans') {
        window.dispatchEvent(new CustomEvent('add-plan'));
      }
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      return;
    }
    if (!hasSelection) return;
    if (scope === 'variation') {
      const params = new URLSearchParams(window.location.search);
      params.set('action', 'edit');
      params.set('variationId', activeId);
      router.push(`/workout?${params.toString()}`);
    } else if (isUsersPage) {
      router.push(`/users?action=edit&userId=${activeId}`);
    } else if (isWorkoutPage) {
      if (view === 'exercises') {
        window.dispatchEvent(new CustomEvent('edit-exercise'));
      } else if (view === 'plans') {
        window.dispatchEvent(new CustomEvent('edit-plan'));
      }
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete();
      return;
    }
    if (!hasSelection) return;
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      if (scope === 'variation') {
        const res = await deleteVariationById(activeId);
        if (!res.success) throw new Error(res.error || 'Failed to delete variation');

        // Clear variationId query param
        const params = new URLSearchParams(window.location.search);
        params.delete('variationId');
        router.push(`/workout?${params.toString()}`);
        router.refresh();
      } else if (isUsersPage) {
        const res = await deleteUser(activeId);
        if (!res.success) throw new Error(res.error || 'Failed to delete user');

        if (pathname.startsWith('/users')) {
          router.push('/');
        } else {
          // Clear query params
          const params = new URLSearchParams(window.location.search);
          params.delete('userId');
          router.push(`/?${params.toString()}`);
        }
        router.refresh();
      } else if (isWorkoutPage) {
        if (view === 'exercises') {
          window.dispatchEvent(new CustomEvent('delete-exercise'));
        } else if (view === 'plans') {
          const res = await deleteWorkoutPlan(activeId);
          if (!res.success) throw new Error(res.error || 'Failed to delete plan');

          const params = new URLSearchParams(window.location.search);
          params.delete('planId');
          router.push(`/workout?${params.toString()}`);
          router.refresh();
        }
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete the record.');
    }
  };

  const [isInlineEditing, setIsInlineEditing] = useState(false);

  React.useEffect(() => {
    const handleStart = () => {
      if (scope === 'default') setIsInlineEditing(true);
    };
    const handleStop = () => {
      if (scope === 'default') setIsInlineEditing(false);
    };

    window.addEventListener('inline-editing-start', handleStart);
    window.addEventListener('inline-editing-stop', handleStop);

    return () => {
      window.removeEventListener('inline-editing-start', handleStart);
      window.removeEventListener('inline-editing-stop', handleStop);
    };
  }, []);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  };

  const isInlineVariationForm = scope === 'variation' && (action === 'new' || action === 'edit');

  if (isFormPage || isInlineVariationForm) {
    const isNew = isFormPage ? pathname.endsWith('/new') : (action === 'new');
    const handleBack = () => {
      if (isFormPage) {
        const backUrl = isVariationFormPage
          ? `/workout?view=exercises&exerciseId=${exerciseId}`
          : (isWorkoutPlanFormPage ? '/workout?view=plans' : '/');
        router.push(backUrl);
      } else {
        const params = new URLSearchParams(window.location.search);
        params.delete('mode');
        params.delete('action');
        router.push(`/workout?${params.toString()}`);
      }
    };
    return (
      <div className="h-11 bg-white border-b border-slate-200 flex items-center px-6 gap-1 select-none flex-shrink-0 z-20">
        {/* Back Button */}
        {scope !== 'variation' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} className="text-slate-600" strokeWidth={2} />
            <span>Back</span>
          </button>
        )}

        {/* Save & Close Button */}
        <button
          onClick={() => document.getElementById('hidden-save-close-btn')?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
        >
          <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
          <span>Save & Close</span>
        </button>

        {scope === 'variation' ? (
          /* Cancel Button */
          <button
            onClick={handleBack}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
          >
            <X size={15} className="text-slate-500" strokeWidth={2.5} />
            <span>Cancel</span>
          </button>
        ) : (
          /* Save Button */
          <button
            onClick={() => document.getElementById('hidden-save-btn')?.click()}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
          >
            <Save size={14} className="text-blue-600" strokeWidth={2} />
            <span>Save</span>
          </button>
        )}

        {!isNew && (
          <>
            <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
            {/* Delete Button */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this record?')) {
                  document.getElementById('hidden-delete-btn')?.click();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
            >
              <Trash2 size={14} className="text-red-500" strokeWidth={2} />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="h-11 bg-white border-b border-slate-200 flex items-center px-6 gap-1 select-none flex-shrink-0 z-20">
      {isInlineEditing ? (
        <>
          {/* Save Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('save-inline-edit'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
          >
            <Check size={15} className="text-emerald-600" strokeWidth={2.5} />
            <span>Save</span>
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('cancel-inline-edit'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
          >
            <X size={15} className="text-red-500" strokeWidth={2.5} />
            <span>Cancel</span>
          </button>
        </>
      ) : (
        <>
          {!isDeletionRequests && (
            <>
              {/* New Button */}
              <button
                onClick={handleNew}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
              >
                <Plus size={15} className="text-emerald-600" strokeWidth={2.5} />
                <span>New</span>
              </button>

              <button
                onClick={handleEdit}
                disabled={!hasSelection}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors cursor-pointer ${hasSelection
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 pointer-events-none'
                  }`}
              >
                <Pencil size={14} className={hasSelection ? 'text-blue-600' : 'text-slate-300'} strokeWidth={2} />
                <span>Edit</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                disabled={!hasSelection}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors cursor-pointer ${hasSelection
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 pointer-events-none'
                  }`}
              >
                <Trash2 size={14} className={hasSelection ? 'text-red-500' : 'text-slate-300'} strokeWidth={2} />
                <span>Delete</span>
              </button>
            </>
          )}

          {isDeletionRequests && (
            <>
              <button
                onClick={() => {
                  if (requestId && reqUserId) {
                    if (confirm('Do you really want to delete the user from the system?')) {
                      approveAccountDeletionRequest(requestId, reqUserId);
                    }
                  }
                }}
                disabled={!requestId}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors cursor-pointer ${requestId
                    ? 'text-emerald-700 hover:bg-emerald-100'
                    : 'text-slate-300 pointer-events-none'
                  }`}
              >
                <Check size={14} className={requestId ? 'text-emerald-600' : 'text-slate-300'} strokeWidth={2} />
                <span>Approve</span>
              </button>

              <button
                onClick={() => {
                  if (requestId) {
                    if (confirm('Do you want to reject the deletion request?')) {
                      rejectAccountDeletionRequest(requestId);
                    }
                  }
                }}
                disabled={!requestId}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors cursor-pointer ${requestId
                    ? 'text-red-700 hover:bg-red-100'
                    : 'text-slate-300 pointer-events-none'
                  }`}
              >
                <X size={14} className={requestId ? 'text-red-500' : 'text-slate-300'} strokeWidth={2} />
                <span>Reject</span>
              </button>
            </>
          )}

          <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className="text-slate-500" strokeWidth={2} />
            <span>Refresh</span>
          </button>

          {customActions && customActions.length > 0 && (
            <>
              <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
              {customActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${action.disabled
                      ? 'text-slate-400 cursor-not-allowed opacity-60'
                      : action.primary
                        ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer'
                        : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                    }`}
                >
                  <span className={action.disabled ? 'text-slate-300' : (action.primary ? 'text-indigo-600' : 'text-slate-600')}>
                    {action.icon}
                  </span>
                  <span>{action.label}</span>
                </button>
              ))}
            </>
          )}

          {isWorkoutPage && view === 'plans' && (!customActions) && (
            <>
              <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
              <button
                onClick={() => {
                  if (hasSelection) window.dispatchEvent(new CustomEvent('configure-workouts'));
                }}
                disabled={!hasSelection}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${hasSelection
                    ? 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed opacity-60'
                  }`}
              >
                <Sliders size={14} className={hasSelection ? 'text-indigo-600' : 'text-slate-300'} strokeWidth={2} />
                <span>Configure Workouts</span>
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function CommandBar({
  scope = 'default',
  hasSelectionOverride,
  activeIdOverride,
  onNew,
  onEdit,
  onDelete,
  onRefresh,
  customActions
}: {
  scope?: 'default' | 'variation',
  hasSelectionOverride?: boolean,
  activeIdOverride?: string,
  onNew?: () => void,
  onEdit?: () => void,
  onDelete?: () => void,
  onRefresh?: () => void,
  customActions?: { label: string, icon: React.ReactNode, onClick: () => void, disabled?: boolean, primary?: boolean }[]
}) {
  return (
    <Suspense fallback={<div className="h-11 bg-white border-b border-slate-200" />}>
      <CommandBarContent
        scope={scope}
        hasSelectionOverride={hasSelectionOverride}
        activeIdOverride={activeIdOverride}
        onNew={onNew}
        onEdit={onEdit}
        onDelete={onDelete}
        onRefresh={onRefresh}
        customActions={customActions}
      />
    </Suspense>
  );
}
