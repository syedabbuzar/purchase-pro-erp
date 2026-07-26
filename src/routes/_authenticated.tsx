import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const navigate = useNavigate();
  const session = useAuth((s) => s.session);
  useEffect(() => {
    if (!session || session.expiresAt <= Date.now()) {
      navigate({ to: "/auth" });
    }
  }, [session, navigate]);

  if (!session) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 border-b bg-card/50 backdrop-blur flex items-center px-2 gap-2 no-print">
            <SidebarTrigger />
            <div className="text-sm font-semibold">STAR ENTERPRISES</div>
            <div className="ml-auto text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
