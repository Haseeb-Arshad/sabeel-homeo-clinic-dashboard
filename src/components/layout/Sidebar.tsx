import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  BookOpen,
  Stethoscope,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patients", icon: Users, label: "Patients" },
  { to: "/conversations", icon: MessageSquare, label: "Conversations" },
  { to: "/appointments", icon: Calendar, label: "Appointments" },
  { to: "/knowledge", icon: BookOpen, label: "Knowledge" },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const location = useLocation();

  return (
    <>
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Stethoscope className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground leading-tight">
            Sabeel Homeo
          </span>
          <span className="text-[11px] text-muted-foreground">Clinic Admin</span>
        </div>
      </div>
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-0.5 px-3">
          {navItems.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-4">
        <p className="text-[11px] text-muted-foreground text-center">
          v2.0
        </p>
      </div>
    </>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden md:flex h-screen w-60 flex-col bg-sidebar text-sidebar-foreground">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-60 bg-sidebar text-sidebar-foreground flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex h-16 items-center justify-end px-3">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent onNavClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}