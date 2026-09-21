import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC] text-sm text-[#1E293B] font-sans w-full">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <div className="flex flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
