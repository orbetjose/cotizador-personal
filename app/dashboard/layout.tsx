import { Sidebar } from "@/components/sidebar/sidebar";
import { Toaster } from "sonner"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        {children}
        <Toaster position="top-right" richColors />
      </main>
    </div>
  );
}
