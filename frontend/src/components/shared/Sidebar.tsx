"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Bot,
  ListTodo,
  Megaphone,
  BarChart3,
  Workflow,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  Layers,
  HelpCircle,
  Sparkles,
  PenTool,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/ai", icon: Bot, label: "AI Assistant" },
  ];

  const toolItems = [
    { href: "/dashboard/tasks", icon: ListTodo, label: "Tasks" },
    { href: "/dashboard/notices", icon: Megaphone, label: "Notices" },
    { href: "/dashboard/attendance", icon: BarChart3, label: "Attendance" },
    { href: "/dashboard/flashcards", icon: Layers, label: "Flashcards" },
    { href: "/dashboard/quiz", icon: HelpCircle, label: "MCQ Quiz" },
    { href: "/dashboard/tools", icon: Sparkles, label: "Smart Tools" },
    { href: "/dashboard/whiteboard", icon: PenTool, label: "Whiteboard" },
  ];

  const systemItems = [
    { href: "/dashboard/automations", icon: Workflow, label: "Automations" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];


  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-gradient-to-b from-primary to-primary/90 text-white transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className={cn("flex items-center h-16 border-b border-white/10", isCollapsed ? "justify-center px-2" : "px-5")}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[10px] bg-white/15 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <GraduationCap className="w-4.5 h-4.5 text-white" />
          </div>
          {!isCollapsed && <span className="text-base font-bold text-white" style={{ letterSpacing: "-0.02em" }}>CampusFlow</span>}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-150",
              isActive(item.href)
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}

        <div className="pt-4 pb-2 px-1">
          {!isCollapsed && (
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Tools</p>
          )}
        </div>

        {toolItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-150",
              isActive(item.href)
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}

        <div className="pt-4 pb-2 px-1">
          {!isCollapsed && (
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">System</p>
          )}
        </div>

        {systemItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-150",
              isActive(item.href)
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-2.5 space-y-1">
        {!isCollapsed && user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-150 text-white/70 hover:bg-white/10 hover:text-white",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>

        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-150 text-white/70 hover:bg-white/10 hover:text-white",
            isCollapsed && "justify-center"
          )}
        >
          {isCollapsed ? (
            <ChevronsRight className="w-4.5 h-4.5" />
          ) : (
            <>
              <ChevronsLeft className="w-4.5 h-4.5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
