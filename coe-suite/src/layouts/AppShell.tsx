import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell() {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 90% 60% at 10% 20%, rgba(66,170,66,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 70% 50% at 85% 70%, rgba(66,170,66,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 50% 40%, rgba(13,157,219,0.05) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 70% 10%, rgba(150,71,252,0.04) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 20% 80%, rgba(0,211,255,0.04) 0%, transparent 50%),
            var(--color-neutro-100)
          `
        }} />
        <Topbar />
        <main className="flex-1 overflow-y-auto p-5 px-6 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
