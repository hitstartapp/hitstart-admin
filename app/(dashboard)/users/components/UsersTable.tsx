import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Leaf,
  Utensils,
  Venus,
  Mars,
  EggFried,
  Beef,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { tableFields, getColClass } from '../models';
import { fetchUsersList } from '../actions';

export async function UsersTable({ selectedUserId }: { selectedUserId?: string }) {
  const usersList = await fetchUsersList();

  return (
    <div className="bg-white flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 overflow-auto no-scrollbar">
        <div className="min-w-max h-full flex flex-col">
          {/* List Header */}
          <div className="sticky top-0 z-20 flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-full w-max h-9">
            <div className="w-12 h-9 flex-shrink-0 border-r border-slate-200"></div>
            <div className="flex flex-1 py-1.5 items-center">
              {tableFields.map((field, idx) => {
                const isCenterAligned = ['gender', 'dietary_preference', 'has_health_concerns'].includes(field);
                return (
                  <div
                    key={field}
                    className={`flex items-center gap-1 cursor-pointer px-4 border-r border-slate-200 last:border-r-0 h-7 ${getColClass(field)} ${isCenterAligned ? 'justify-center' : ''}`}
                  >
                    {field.replace(/_/g, ' ')}
                    {idx === 0 && (
                      <div className="flex flex-col -space-y-1 ml-1">
                        <ChevronUp size={12} strokeWidth={3} className="text-slate-300" />
                        <ChevronDown size={12} strokeWidth={3} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* List Items */}
          <div className="flex flex-col divide-y divide-slate-100 min-w-full w-max">
            {usersList.length > 0 ? (
              usersList.map((user: any, index: number) => {
                const bgColors = ['bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-slate-100 text-slate-600'];
                const colorClass = bgColors[index % bgColors.length];
                const isActive = selectedUserId === user.user_id;

                return (
                  <div
                    key={user.id || index}
                    className={`flex items-center group border-b border-slate-100 hover:bg-slate-50/40 transition-colors ${isActive ? 'bg-blue-50/30' : 'bg-white'
                      }`}
                  >
                    {/* Checkbox Column */}
                    <Link
                      href={isActive ? '/users' : `/users?userId=${user.user_id}`}
                      className="w-12 h-14 flex-shrink-0 flex items-center justify-center border-r border-slate-200/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isActive}
                        readOnly
                        className="h-3.5 w-3.5 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </Link>

                    {/* Columns Cells wrapper */}
                    <Link
                      href={isActive ? '/users' : `/users?userId=${user.user_id}`}
                      className="flex flex-1 py-2.5 items-center min-w-0"
                    >
                      {tableFields.map((field, idx) => {
                        let cellContent;

                        if (idx === 0) {
                          cellContent = (
                            <div className="flex items-center gap-3">
                              <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0 text-xs ${colorClass}`}>
                                <User size={14} strokeWidth={2.5} />
                              </div>
                              <span className="font-semibold text-[13px] text-blue-600 group-hover:underline truncate">
                                {user[field] ? String(user[field]) : 'Unknown'}
                              </span>
                            </div>
                          );
                        } else {
                          // For object values (like JSON), stringify them so they don't crash React
                          let displayValue = '-';
                          if (user[field] !== null && user[field] !== undefined) {
                            displayValue = typeof user[field] === 'object' ? JSON.stringify(user[field]) : String(user[field]);
                          }

                          if (field === 'gender') {
                            cellContent = (
                              <div className="flex items-center justify-center">
                                {(() => {
                                  const g = displayValue.toLowerCase();
                                  if (g === 'male' || g === 'm') return <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-200 mx-auto" title="Male"><User size={18} /></div>;
                                  if (g === 'female' || g === 'f') return <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-50 text-pink-600 border border-pink-200 mx-auto" title="Female"><User size={18} /></div>;
                                  return <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-600 border border-slate-200 mx-auto" title={displayValue}><User size={18} /></div>;
                                })()}
                              </div>
                            );
                          } else if (field === 'birth_date') {
                            cellContent = (
                              <div className="flex items-center gap-2">
                                {displayValue !== '-' ? (
                                  <>
                                    <Calendar size={14} className="text-slate-400" />
                                    <span>
                                      {(() => {
                                        const d = new Date(displayValue);
                                        if (isNaN(d.getTime())) return displayValue;
                                        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                                      })()}
                                    </span>
                                  </>
                                ) : '-'}
                              </div>
                            );
                          } else if (field === 'dietary_preference') {
                            cellContent = (
                              <div className="flex items-center justify-center">
                                {(() => {
                                  if (displayValue === '-') return '-';
                                  const p = displayValue.toLowerCase().replace(/[^a-z]/g, '');
                                  if (p.includes('eggetarian')) {
                                    return <div className="flex mx-auto items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-md font-medium text-sm" title="Eggetarian"><EggFried size={16} /> <span>Egg</span></div>;
                                  }
                                  if (p.includes('nonveg')) {
                                    return <div className="flex mx-auto items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md font-medium text-sm" title="Non-Vegetarian"><Beef size={16} /> <span>Non-Veg</span></div>;
                                  }
                                  if (p.includes('veg')) {
                                    return <div className="flex mx-auto items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md font-medium text-sm" title="Vegetarian"><Leaf size={16} /> <span>Veg</span></div>;
                                  }
                                  return <div className="flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-50 text-slate-500 border border-slate-200 font-medium text-sm mx-auto" title={displayValue}><Utensils size={16} /> <span>{displayValue}</span></div>;
                                })()}
                              </div>
                            );
                          } else if (field === 'has_health_concerns') {
                            const isTrue = displayValue.toLowerCase() === 'true';
                            cellContent = (
                              <div className="flex items-center justify-center">
                                <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${isTrue ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isTrue ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                              </div>
                            );
                          } else {
                            cellContent = <span className="truncate">{displayValue}</span>;
                          }
                        }

                        const isCenterAligned = ['gender', 'dietary_preference', 'has_health_concerns'].includes(field);

                        return (
                          <div
                            key={field}
                            className={`px-4 border-r border-slate-200/50 last:border-r-0 text-slate-500 text-[14px] flex items-center h-14 ${getColClass(field)} ${isCenterAligned ? 'justify-center' : 'truncate'
                              }`}
                          >
                            {cellContent}
                          </div>
                        );
                      })}
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <User size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No users found</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-4">
                  Get started by adding your first user to the Supabase database.
                </p>
                <Link href="/users?action=new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm inline-flex items-center justify-center cursor-pointer">
                  Add User
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white flex-1 flex items-center justify-center min-h-0 overflow-hidden">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading data...</p>
      </div>
    </div>
  );
}
