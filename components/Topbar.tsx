'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Megaphone, MessageSquare, Bell, User, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function Topbar() {
  const router = useRouter();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    fetchUser();

    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      if (response.ok) {
        router.refresh();
        router.push('/login');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-[68px] border-b border-slate-200 flex items-center justify-between px-6 bg-white flex-shrink-0 z-30">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-indigo-600 shadow-sm">
          <img src="/app_icon.png" alt="Hitstart Logo" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-[15px] tracking-tight">Hitstart</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-5">
        {/* Search */}
        {/* <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 w-72 rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
          />
        </div> */}

        {/* Icons */}
        <div className="flex items-center gap-4 ml-1 relative" ref={dropdownRef}>
          {/* <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <Megaphone size={22} strokeWidth={1.5} />
          </button>
          <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <MessageSquare size={22} strokeWidth={1.5} />
          </button>
          <button className="text-slate-400 hover:text-slate-600 relative cursor-pointer">
            <Bell size={22} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-white leading-tight">2</span>
          </button>*/}

          {/* User Button with Dropdown */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors focus:outline-none"
            aria-label="User menu"
          >
            <User size={18} strokeWidth={1.5} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-medium text-slate-800 truncate mt-0.5">
                  {currentUser?.email || 'Admin User'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
