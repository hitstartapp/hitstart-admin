'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Dumbbell, Utensils, Settings, HelpCircle, Gamepad2, LayoutDashboardIcon } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Reporting', path: '/reporting', icon: LayoutDashboardIcon },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Workout', path: '/workout', icon: Dumbbell },
    { name: 'Meal', path: '/meal', icon: Utensils },
    { name: 'Gamification', path: '/gamification', icon: Gamepad2 },
    { name: 'Configuration', path: '/configuration', icon: Settings },
  ];

  return (
    <aside className="w-[68px] flex-shrink-0 border-r border-slate-200 flex flex-col items-center py-4 bg-white z-20">
      {/* <div className="w-10 h-10 rounded-full flex items-center justify-center mb-6 shadow-md overflow-hidden bg-indigo-600">
        <img src="/app_icon.png" alt="Hitstart Logo" className="w-full h-full object-cover" />
      </div> */}
      <div className="flex flex-col gap-6 w-full items-center flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              title={item.name}
              className={isActive
                ? "bg-indigo-50 text-indigo-600 p-2 rounded-xl w-11 h-11 flex items-center justify-center relative shadow-sm border border-indigo-100/50"
                : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors rounded-xl w-11 h-11 flex items-center justify-center relative"
              }
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-md"></div>}
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            </Link>
          );
        })}
      </div>
      <div className="mt-auto pt-4">
        <button className="text-slate-400 hover:text-slate-600" title="Help">
          <HelpCircle size={22} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
