'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, DollarSign, Users } from 'lucide-react';

const OPTIONS = [
  { 
    id: 'revenue', 
    label: 'Revenue Tracking', 
    path: '/reporting/revenue', 
    icon: DollarSign, 
    desc: 'Track revenue from meal and workout plan purchases.' 
  },
  { 
    id: 'users', 
    label: 'User Overview', 
    path: '/reporting/users', 
    icon: Users, 
    desc: 'User acquisition, engagement, and demographics overview.' 
  }
];

export function ReportingHeader({ current }: { current: 'revenue' | 'users' }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentOption = OPTIONS.find(o => o.id === current) || OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="px-6 py-8 pb-6 relative z-10">
      <div className="relative inline-block" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-2xl font-semibold text-slate-800 tracking-tight mb-1 hover:text-blue-600 transition-colors focus:outline-none"
        >
          {currentOption.label}
          <ChevronDown size={20} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-20">
            {OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = opt.id === current;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setIsOpen(false);
                    if (!isSelected) {
                      router.push(opt.path);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-blue-50/50 text-blue-700' : 'text-slate-700'}`}
                >
                  <Icon size={18} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="font-medium text-sm">{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-slate-500 text-sm">{currentOption.desc}</p>
    </div>
  );
}
