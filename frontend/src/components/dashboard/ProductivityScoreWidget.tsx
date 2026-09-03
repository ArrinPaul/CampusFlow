"use client";

import { Lightbulb } from "lucide-react";
import type { Task, Attendance } from "@/features/types";

interface ProductivityScoreWidgetProps {
  tasks: Task[];
  attendance: Attendance[];
}

export function ProductivityScoreWidget({ tasks = [], attendance = [] }: ProductivityScoreWidgetProps) {

  const calculateScore = () => {
    if (tasks.length === 0 && attendance.length === 0) return 0;

    let score = 0;

    if (tasks.length > 0) {
      const completed = tasks.filter((t) => t.status === "completed").length;
      score += (completed / tasks.length) * 50;
    }

    if (attendance.length > 0) {
      const totalAttended = attendance.reduce((s, r) => s + r.attended_classes, 0);
      const totalClasses = attendance.reduce((s, r) => s + r.total_classes, 0);
      if (totalClasses > 0) {
        score += (totalAttended / totalClasses) * 50;
      }
    }

    return Math.round(Math.min(score, 100));
  };

  const score = calculateScore();
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  const suggestions = [];
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  if (pendingCount > 0) {
    suggestions.push(`You have ${pendingCount} pending task${pendingCount > 1 ? "s" : ""} — try to complete one today`);
  }
  if (attendance.length > 0) {
    const totalAttended = attendance.reduce((s, r) => s + r.attended_classes, 0);
    const totalClasses = attendance.reduce((s, r) => s + r.total_classes, 0);
    const pct = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
    if (pct < 75) {
      suggestions.push("Your attendance is below 75% — attend more classes to stay on track");
    } else {
      suggestions.push("Great attendance! Keep up the consistent effort");
    }
  }
  if (suggestions.length === 0) {
    suggestions.push("Add tasks and track attendance to see your productivity score");
  }

  return (
    <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full">
      <h3 className="font-semibold text-foreground text-sm mb-4">Productivity Score</h3>

      <div className="flex items-center justify-center mb-4">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke="hsl(var(--primary))" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="animate-ring-fill"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{score}</span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2 p-2 bg-primary/5 rounded-[10px]">
            <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
