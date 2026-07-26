import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Receipt, FileText, Package, Users, Boxes, TruckIcon,
  BarChart3, Percent, ClipboardList, Settings, DatabaseBackup, UserCog, Star, LogOut,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const groups = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "New Bill", url: "/billing", icon: Receipt },
      { title: "Invoices", url: "/invoices", icon: FileText },
    ],
  },
  {
    label: "Masters",
    items: [
      { title: "Products", url: "/products", icon: Package },
      { title: "Customers", url: "/customers", icon: Users },
    ],
  },
  {
    label: "Inventory",
    items: [
      { title: "Stock", url: "/stock", icon: Boxes },
      { title: "Purchases", url: "/purchases", icon: TruckIcon },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Daily Dispatch", url: "/reports/daily", icon: ClipboardList },
      { title: "Sales", url: "/reports/sales", icon: BarChart3 },
      { title: "GST", url: "/reports/gst", icon: Percent },
    ],
  },
  {
    label: "GST Reports",
    items: [
      { title: "GSTR-1 B2B", url: "/reports/gstr1-b2b", icon: FileText },
      { title: "GSTR-3B", url: "/reports/gstr3b", icon: ClipboardList },
      { title: "GST B2B Export", url: "/reports/gst-b2b-export", icon: BarChart3 },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Company", url: "/settings/company", icon: Settings },
      { title: "Users", url: "/settings/users", icon: UserCog, roles: ["admin"] },
      { title: "Backup", url: "/settings/backup", icon: DatabaseBackup },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useLocation().pathname;
  const session = useAuth((s) => s.session);
  const logout = useAuth((s) => s.logout);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-0">
        <div className={collapsed ? "flex items-center justify-center py-3" : "sidebar-brand flex items-center gap-2"}>
          <Star className={collapsed ? "h-6 w-6 text-primary" : "h-6 w-6"} strokeWidth={2} />
          {!collapsed && (
            <div className="min-w-0">
              <div className="brand-title text-sm truncate">STAR ENTERPRISES</div>
              <div className="brand-sub truncate">GST Billing ERP</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items
                  .filter((it) => !it.roles || (session && it.roles.includes(session.role)))
                  .map((item) => {
                    const active = pathname === item.url || pathname.startsWith(item.url + "/");
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                          <Link to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && session && (
          <div className="px-2 py-1 text-xs">
            <div className="font-medium truncate">{session.name}</div>
            <div className="text-muted-foreground capitalize">{session.role}</div>
          </div>
        )}
        <Button size="sm" onClick={logout} className="mx-2 mb-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <LogOut className="h-4 w-4 mr-1" />{collapsed ? "" : "Sign out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
