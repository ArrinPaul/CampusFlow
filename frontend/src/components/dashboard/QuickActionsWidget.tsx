"use client";

import Link from "next/link";
import { Plus, Megaphone, BarChart3, Bot, Settings } from "lucide-react";

const actions = [
  { icon: Plus, label: "Add Task", href: "/dashboard/tasks", color: "bg-primary text-white" },
  { icon: Megaphone, label: "Add Notice", href: "/dashboard/notices", color: "bg-primary/80 text-white" },
  { icon: BarChart3, label: "Attendance", href: "/dashboard/attendance", color: "bg-primary/60 text-white" },
  { icon: Bot, label: "AI Assistant", href: "/dashboard/ai", color: "bg-primary/40 text-white" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", color: "bg-muted text-muted-foreground" },
];

export function QuickActionsWidget() {
  return (
    <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full">
      <h3 className="font-semibold text-foreground text-sm mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`group flex flex-col items-center gap-2.5 p-4 rounded-[10px] ${action.color} shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105`}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-xs font-medium text-center">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
