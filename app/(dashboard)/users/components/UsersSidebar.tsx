'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Users, UserX } from 'lucide-react';

export default function UsersSidebar() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'users';

  return (
    <aside className="w-[68px] lg:w-[260px] border-r border-slate-200 bg-white flex flex-col flex-shrink-0 pt-6 transition-all">
      <h2 className="hidden lg:block text-[14px] font-semibold uppercase tracking-wider text-slate-400 px-6 mb-4">
        User
      </h2>
      <nav className="flex flex-col text-[14px] px-2 lg:px-3 space-y-1 items-center lg:items-stretch">
        <Link
          href="/users?tab=users"
          title="Active Users"
          className={`w-11 lg:w-auto h-11 lg:h-auto text-left px-0 lg:px-3 py-2 rounded-xl font-medium flex items-center justify-center lg:justify-start gap-2.5 transition-colors ${tab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
          <Users size={18} className="flex-shrink-0" />
          <span className="hidden lg:inline truncate">Active Users</span>
        </Link>
        <Link
          href="/users?tab=deletion-requests"
          title="Account Deletion Requests"
          className={`w-11 lg:w-auto h-11 lg:h-auto text-left px-0 lg:px-3 py-2 rounded-xl font-medium flex items-center justify-center lg:justify-start gap-2.5 transition-colors ${tab === 'deletion-requests' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
          <UserX size={18} className="flex-shrink-0" />
          <span className="hidden lg:inline truncate">Account Deletion Requests</span>
        </Link>
      </nav>
    </aside>
  );
}
