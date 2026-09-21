import React from 'react';
import { getAccountDeletionRequests } from '../actions';
import Link from 'next/link';

export async function DeletionRequestsTable({ selectedRequestId }: { selectedRequestId?: string }) {
  const requests = await getAccountDeletionRequests();

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <div className="flex-1 overflow-auto bg-white rounded-t-xl border border-slate-200 shadow-sm mx-6 flex flex-col">
      <div className="overflow-x-auto">
        <div className="flex flex-col min-w-full w-max">
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-full w-max h-9">
            <div className="w-12 h-9 flex-shrink-0 border-r border-slate-200" />
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[200px] flex-shrink-0">User</div>
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[200px] flex-shrink-0">Requested At</div>
            <div className="flex items-center gap-1 px-4 h-7 flex-1 min-w-[200px]">Status</div>
          </div>
          
          {/* Body */}
          <div className="flex flex-col divide-y divide-slate-100 flex-1 min-w-full w-max">
            {requests && requests.length > 0 ? (
              requests.map((request: any) => {
                const isActive = selectedRequestId === request.id;
                return (
                  <div key={request.id} className={`flex items-center group border-b border-slate-100 hover:bg-slate-50/40 transition-colors ${isActive ? 'bg-blue-50/30' : 'bg-white'}`}>
                    <div className="w-12 h-14 flex-shrink-0 flex items-center justify-center border-r border-slate-200/50">
                      <Link href={isActive ? '/users?tab=deletion-requests' : `/users?tab=deletion-requests&requestId=${request.id}&reqUserId=${request.user_id}`}>
                        <input
                          type="checkbox"
                          checked={isActive}
                          readOnly
                          className="h-3.5 w-3.5 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </Link>
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center h-14 w-[200px] flex-shrink-0 truncate">
                      <Link className="block font-medium text-slate-800" href={isActive ? '/users?tab=deletion-requests' : `/users?tab=deletion-requests&requestId=${request.id}&reqUserId=${request.user_id}`}>
                        {request.User?.user_name || request.user_id}
                      </Link>
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center h-14 w-[200px] flex-shrink-0">
                      <Link className="block text-slate-600" href={isActive ? '/users?tab=deletion-requests' : `/users?tab=deletion-requests&requestId=${request.id}&reqUserId=${request.user_id}`}>
                        {request.requested_at ? formatDate(request.requested_at) : '-'}
                      </Link>
                    </div>
                    <div className="px-4 text-[14px] flex items-center h-14 flex-1 min-w-[200px]">
                      <Link className="block" href={isActive ? '/users?tab=deletion-requests' : `/users?tab=deletion-requests&requestId=${request.id}&reqUserId=${request.user_id}`}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          request.status === 'processed' ? 'bg-green-100 text-green-800' : 
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {request.status}
                        </span>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-500">
                No account deletion requests found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeletionRequestsTableSkeleton() {
  return (
    <div className="flex-1 overflow-auto bg-white rounded-t-xl border border-slate-200 shadow-sm mx-6 flex flex-col">
      <div className="overflow-x-auto">
        <div className="flex flex-col min-w-full w-max">
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-full w-max h-9">
            <div className="w-12 h-9 flex-shrink-0 border-r border-slate-200" />
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[200px] flex-shrink-0">User</div>
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[200px] flex-shrink-0">Requested At</div>
            <div className="flex items-center gap-1 px-4 h-7 flex-1 min-w-[200px]">Status</div>
          </div>
          
          {/* Body */}
          <div className="flex flex-col divide-y divide-slate-100 flex-1 min-w-full w-max">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center animate-pulse bg-white border-b border-slate-100">
                <div className="w-12 h-14 flex-shrink-0 flex items-center justify-center border-r border-slate-200/50">
                  <div className="h-3.5 w-3.5 bg-slate-200 rounded-full"></div>
                </div>
                <div className="px-4 border-r border-slate-200/50 flex items-center h-14 w-[200px] flex-shrink-0">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
                <div className="px-4 border-r border-slate-200/50 flex items-center h-14 w-[200px] flex-shrink-0">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="px-4 flex items-center h-14 flex-1 min-w-[200px]">
                  <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
