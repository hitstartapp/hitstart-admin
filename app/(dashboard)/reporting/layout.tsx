
import CommandBar from '@/components/CommandBar';

export default function ReportingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </>
  );
}
