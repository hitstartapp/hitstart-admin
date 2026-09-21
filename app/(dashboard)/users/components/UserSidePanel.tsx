'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveUser } from '../actions';
import { ChevronDown, Check, X, Trash2 } from 'lucide-react';
import CustomDatePicker from '@/components/CustomDatePicker';

export default function UserSidePanel({ user, isNew }: { user?: any, isNew: boolean }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasHealthConcerns, setHasHealthConcerns] = useState(
    user?.has_health_concerns === true || String(user?.has_health_concerns).toLowerCase() === 'true'
  );

  useEffect(() => {
    // Open on mount
    setIsOpen(true);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      if (user?.user_id) {
        router.push(`/users?userId=${user.user_id}`);
      } else {
        router.push('/users');
      }
    }, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeModal} 
      />
      
      {/* Sliding Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-slate-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">{isNew ? 'New User' : 'Edit User'}</h2>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form action={saveUser} className="flex flex-col flex-1 min-h-0">
          {/* Hidden submits to trigger from CommandBar */}
          <button type="submit" id="hidden-save-btn" name="action" value="save" className="hidden" />
          <button type="submit" id="hidden-save-close-btn" name="action" value="save_and_close" className="hidden" />
          {user?.user_id && (
            <button type="submit" id="hidden-delete-btn" name="action" value="delete" className="hidden" />
          )}
          {user?.user_id && (
            <input type="hidden" name="user_id" value={user.user_id} />
          )}

          {/* Mini CommandBar inside panel */}
          <div className="h-11 bg-white border-b border-slate-200 flex items-center px-6 gap-1 select-none flex-shrink-0 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('hidden-save-close-btn')?.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
            >
              <Check size={15} className="text-emerald-600" strokeWidth={2.5} />
              <span>Save & Close</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                closeModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 text-[13px] font-medium transition-colors cursor-pointer"
            >
              <X size={15} className="text-slate-500" strokeWidth={2.5} />
              <span>Cancel</span>
            </button>
            {!isNew && (
              <>
                <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm('Are you sure you want to delete this user?')) {
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

          {/* Panel Body */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col items-center justify-start min-h-0 w-full">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 w-full max-w-xl space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="user_name" 
                  defaultValue={user?.user_name || ''} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="Enter name..."
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={user?.email || ''} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="Enter email..."
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  Phone
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  defaultValue={user?.phone || ''} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-medium text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="Enter phone..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  Gender
                </label>
                <div className="relative">
                  <select 
                    name="gender" 
                    defaultValue={user?.gender || ''} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer pr-10 font-medium text-slate-800"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  Birth Date
                </label>
                <CustomDatePicker 
                  name="birth_date" 
                  defaultValue={user?.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : undefined} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  Dietary Preference
                </label>
                <div className="relative">
                  <select 
                    name="dietary_preference" 
                    defaultValue={user?.dietary_preference || ''} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer pr-10 font-medium text-slate-800"
                  >
                    <option value="">Select Preference</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="flex flex-col pt-2">
                <label className="flex flex-shrink-0 items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer select-none">
                  <span className="text-sm font-medium text-slate-700">User has specific health concerns</span>
                  <div className="relative inline-flex items-center">
                    <input 
                      type="checkbox" 
                      name="has_health_concerns" 
                      value="true"
                      checked={hasHealthConcerns}
                      onChange={(e) => setHasHealthConcerns(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>

                {hasHealthConcerns && (
                  <div className="flex flex-col mt-6">
                    <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">Health Concern Details</label>
                    <textarea 
                      name="health_concern_details" 
                      defaultValue={user?.health_concern_details || ''} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white resize-none font-medium text-slate-800"
                      placeholder="If any, please describe..."
                      rows={4}
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
