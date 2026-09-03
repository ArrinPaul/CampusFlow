"use client";

import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import type { Attendance } from "@/features/types";

function getPercentage(attended: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100);
}

function getColor(pct: number): string {
  if (pct >= 75) return "from-emerald-400 to-emerald-500";
  if (pct >= 65) return "from-yellow-400 to-yellow-500";
  return "from-red-400 to-red-500";
}

function getTextColor(pct: number): string {
  if (pct >= 75) return "text-emerald-600";
  if (pct >= 65) return "text-yellow-600";
  return "text-destructive";
}

function getRingColor(pct: number): string {
  if (pct >= 75) return "#10b981";
  if (pct >= 65) return "#eab308";
  return "#ef4444";
}

interface AttendanceWidgetProps {
  attendance: Attendance[];
}

export function AttendanceWidget({ attendance = [] }: AttendanceWidgetProps) {
  const totalAttended = attendance.reduce((s, r) => s + r.attended_classes, 0);
  const totalClasses = attendance.reduce((s, r) => s + r.total_classes, 0);
  const overallPct = getPercentage(totalAttended, totalClasses);
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (overallPct / 100) * circumference;

  return (
    <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-[10px] bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Attendance Overview</h3>
      </div>

      {attendance.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No attendance records</p>
          <p className="text-xs text-muted-foreground">Start tracking your attendance</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attendance.length > 1 && (
            <div className="flex items-center gap-5 p-4 bg-muted/40 rounded-[10px]">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="38" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
                  <circle
                    cx="40" cy="40" r="38" fill="none"
                    stroke={getRingColor(overallPct)} strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="animate-ring-fill"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{overallPct}%</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Overall</p>
                <p className="text-xs text-muted-foreground">{totalAttended}/{totalClasses} classes</p>
                <div className="flex items-center gap-1 mt-1">
                  {overallPct >= 75 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  )}
                  <span className={`text-xs font-medium ${overallPct >= 75 ? "text-emerald-500" : "text-destructive"}`}>
                    {overallPct >= 75 ? "On track" : "Needs attention"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3.5">
            {attendance.slice(0, 5).map((record) => {
              const pct = getPercentage(record.attended_classes, record.total_classes);
              return (
                <div key={record.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{record.subject}</span>
                    <span className={`text-sm font-semibold tabular-nums ${getTextColor(pct)}`}>{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getColor(pct)} transition-all duration-700 ease-out`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
