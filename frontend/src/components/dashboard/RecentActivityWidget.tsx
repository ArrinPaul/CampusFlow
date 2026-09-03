"use client";

import { useEffect, useState } from "react";
import { CheckCircle, BarChart3, Megaphone, Bell } from "lucide-react";
import { api } from "@/lib/api";
import type { AutomationLog } from "@/features/types";

const workflowIcons: Record<string, typeof CheckCircle> = {
  deadline_reminder: Bell,
  notice_broadcast: Megaphone,
  attendance_alert: BarChart3,
};

const workflowColors: Record<string, string> = {
  deadline_reminder: "text-orange-500",
  notice_broadcast: "text-primary",
  attendance_alert: "text-emerald-500",
};

const workflowBg: Record<string, string> = {
  deadline_reminder: "bg-orange-50",
  notice_broadcast: "bg-primary/10",
  attendance_alert: "bg-emerald-50",
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActivityWidget() {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ logs: AutomationLog[] }>("/api/automations")
      .then((res) => setLogs(res.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-[10px] p-5 h-full">
        <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse mb-2" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full">
        <h3 className="font-semibold text-foreground text-sm mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No activity yet</p>
          <p className="text-xs text-muted-foreground">Activity will appear here as you use CampusFlow</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full">
      <h3 className="font-semibold text-foreground text-sm mb-4">Recent Activity</h3>
      <div className="space-y-0">
        {logs.slice(0, 5).map((log) => {
          const Icon = workflowIcons[log.workflow_type] || CheckCircle;
          const color = workflowColors[log.workflow_type] || "text-muted-foreground";
          const bg = workflowBg[log.workflow_type] || "bg-muted";
          const label = log.workflow_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <div key={log.id} className="flex items-start gap-3 py-2.5">
              <div className={`w-8 h-8 rounded-[10px] ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(log.created_at)}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                log.status === "success" ? "bg-emerald-50 text-emerald-600" :
                log.status === "failed" ? "bg-destructive/10 text-destructive" :
                "bg-primary/10 text-primary"
              }`}>
                {log.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
