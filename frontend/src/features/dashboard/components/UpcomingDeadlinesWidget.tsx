"use client";

import Link from "next/link";
import { Clock, ArrowRight, PartyPopper, Plus } from "lucide-react";
import type { Task } from "@/features/types";

interface UpcomingDeadlinesWidgetProps {
  tasks: Task[];
}

function getDaysLeft(deadline: string): number {
  const now = new Date();
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getDaysLabel(days: number): string {
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

function getDaysColor(days: number): string {
  if (days < 0) return "bg-destructive/10 text-destructive";
  if (days <= 2) return "bg-orange-50 text-orange-600";
  if (days <= 5) return "bg-yellow-50 text-yellow-700";
  return "bg-emerald-50 text-emerald-600";
}

export function UpcomingDeadlinesWidget({ tasks = [] }: UpcomingDeadlinesWidgetProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingTasks = tasks.filter((task) => {
    const taskDate = new Date(task.deadline);
    return taskDate >= today && taskDate <= nextWeek;
  });

  return (
    <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-primary/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Upcoming Deadlines</h3>
        </div>
        {upcomingTasks.length > 0 && (
          <Link href="/dashboard/tasks" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {upcomingTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <PartyPopper className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No upcoming deadlines</p>
          <p className="text-xs text-muted-foreground mb-4">You&apos;re all caught up! Keep it up.</p>
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-medium rounded-[10px] hover:bg-primary/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Reminder
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingTasks.slice(0, 5).map((task) => {
            const days = getDaysLeft(task.deadline);
            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-[10px] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.subject}</p>
                </div>
                <span className={`ml-2 px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getDaysColor(days)}`}>
                  {getDaysLabel(days)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
