import React, { Suspense } from 'react';


import Link from 'next/link';
import { fetchSingleUser } from './actions';
import CommandBar from '@/components/CommandBar';
import UserSidePanel from './components/UserSidePanel';
import { UsersTable, TableSkeleton } from './components/UsersTable';
import { DeletionRequestsTable, DeletionRequestsTableSkeleton } from './components/DeletionRequestsTable';
import UsersSidebar from './components/UsersSidebar';



export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const userId = resolvedSearchParams.userId as string | undefined;
  const action = resolvedSearchParams.action as string | undefined;
  const tab = (resolvedSearchParams.tab as string) || 'users';

  let userToEdit = null;
  if (action === 'edit' && userId) {
    userToEdit = await fetchSingleUser(userId);
  }

  return (
    <>
      {/* Secondary Sidebar (Users) */}
      <UsersSidebar />

      {/* Dashboard Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <CommandBar />
        <div className="flex-1 flex flex-col py-6 min-h-0">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-shrink-0 px-6">
            <h1 className="text-[20px] font-semibold text-slate-800">
              {tab === 'deletion-requests' ? 'Account Deletion Requests' : 'Active Users'}
            </h1>
          </div>

          <Suspense fallback={tab === 'deletion-requests' ? <DeletionRequestsTableSkeleton /> : <TableSkeleton />}>
            {tab === 'deletion-requests' ? (
              <DeletionRequestsTable selectedRequestId={resolvedSearchParams.requestId as string | undefined} />
            ) : (
              <UsersTable selectedUserId={userId} />
            )}
          </Suspense>
        </div>
        
        {tab === 'users' && (action === 'new' || action === 'edit') && (
          <UserSidePanel isNew={action === 'new'} user={userToEdit} />
        )}
      </main>
    </>
  );
}
