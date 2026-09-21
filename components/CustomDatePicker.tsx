'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  name: string;
  defaultValue?: string;
  required?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomDatePicker({ name, defaultValue, required }: CustomDatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    defaultValue ? new Date(defaultValue) : null
  );

  const [viewMonth, setViewMonth] = useState(
    defaultValue ? new Date(defaultValue).getMonth() : today.getMonth()
  );
  const [viewYear, setViewYear] = useState(
    defaultValue ? new Date(defaultValue).getFullYear() : today.getFullYear()
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state if defaultValue changes
  useEffect(() => {
    if (defaultValue) {
      const d = new Date(defaultValue);
      setSelectedDate(d);
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
  }, [defaultValue]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date as DD/MM/YYYY
  const getFormattedDate = (date: Date | null) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Date generators
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInActiveMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonthIndex = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevMonthYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);

  const dayCells: { date: Date; isCurrentMonth: boolean }[] = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    dayCells.push({
      date: new Date(prevMonthYear, prevMonthIndex, daysInPrevMonth - i),
      isCurrentMonth: false
    });
  }

  // 2. Active month days
  for (let i = 1; i <= daysInActiveMonth; i++) {
    dayCells.push({
      date: new Date(viewYear, viewMonth, i),
      isCurrentMonth: true
    });
  }

  // 3. Next month leading days (fill up to 42 cells)
  const remainingCells = 42 - dayCells.length;
  const nextMonthIndex = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  for (let i = 1; i <= remainingCells; i++) {
    dayCells.push({
      date: new Date(nextMonthYear, nextMonthIndex, i),
      isCurrentMonth: false
    });
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    // Disable going into future months if it contains only future dates
    const nextFirstDay = new Date(viewMonth === 11 ? viewYear + 1 : viewYear, viewMonth === 11 ? 0 : viewMonth + 1, 1);
    if (nextFirstDay > today) return;

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handlePrevYear = () => {
    setViewYear(viewYear - 1);
  };

  const handleNextYear = () => {
    // Prevent going to a year entirely in the future
    if (viewYear + 1 > today.getFullYear()) return;
    setViewYear(viewYear + 1);
  };

  const handleToday = () => {
    setSelectedDate(today);
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setIsOpen(false);
  };

  const handleSelectDay = (date: Date) => {
    // Prevent future date selection
    if (date > today) return;
    setSelectedDate(date);
    setViewMonth(date.getMonth());
    setViewYear(date.getFullYear());
    setIsOpen(false);
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isFuture = (date: Date) => {
    return date > today;
  };

  // Convert selected date to ISO String split for database hidden field
  const getHiddenValue = () => {
    if (!selectedDate) return '';
    // Format as YYYY-MM-DD local time to avoid timezone offset shifts
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden submit field */}
      <input type="hidden" name={name} value={getHiddenValue()} required={required} />

      {/* Selector Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[46px] px-4 py-3 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all bg-slate-50 hover:bg-slate-100/50 flex items-center justify-between cursor-pointer select-none"
      >
        <span className={`text-[14px] ${selectedDate ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
          {selectedDate ? getFormattedDate(selectedDate) : 'Select birth date'}
        </span>
        <CalendarIcon size={16} className="text-slate-400" />
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-slate-800 text-[15px] select-none">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={new Date(viewYear, viewMonth + 1, 1) > today}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                new Date(viewYear, viewMonth + 1, 1) > today
                  ? 'text-slate-200 pointer-events-none'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekdays Row */}
          <div className="grid grid-cols-7 gap-y-1 mb-2 text-center">
            {WEEKDAYS.map((day) => (
              <span key={day} className="text-[11px] font-bold text-slate-700 select-none py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center select-none">
            {dayCells.map((cell, idx) => {
              const selected = isSelected(cell.date);
              const activeToday = isToday(cell.date);
              const future = isFuture(cell.date);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.date)}
                  disabled={future}
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-[13px] font-medium transition-colors cursor-pointer relative ${
                    selected
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold'
                      : future
                      ? 'text-slate-200 pointer-events-none opacity-30'
                      : !cell.isCurrentMonth
                      ? 'text-slate-300 hover:bg-slate-50'
                      : activeToday
                      ? 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
            <button
              type="button"
              onClick={handlePrevYear}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[12px] font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Prev Year
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-4 py-2 hover:bg-slate-100 text-slate-700 rounded-full text-[12px] font-semibold transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextYear}
              disabled={viewYear + 1 > today.getFullYear()}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-colors cursor-pointer ${
                viewYear + 1 > today.getFullYear()
                  ? 'text-slate-300 pointer-events-none opacity-40'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Next Year
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
