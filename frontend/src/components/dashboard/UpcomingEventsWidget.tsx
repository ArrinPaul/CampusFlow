"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import type { Task } from "@/features/types";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `${days} days`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getColor(idx: number): string {
  const colors = ["bg-primary", "bg-primary/70", "bg-primary/50", "bg-primary/30"];
  return colors[idx % colors.length];
}

export function UpcomingEventsWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ tasks: Task[] }>("/api/tasks/upcoming")
      .then((res) => setTasks(res.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const events = tasks.slice(0, 5);

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-[10px] p-5 h-full">
        <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-muted rounded animate-pulse mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground text-sm">Upcoming Events</h3>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <CalendarDays className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No upcoming events</p>
          <p className="text-xs text-muted-foreground">Your calendar is clear</p>
        </div>
      ) : (
        <div className="space-y-0">
          {events.map((event, i) => (
            <div key={event.id} className="flex gap-3 py-2.5">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${getColor(i)} flex-shrink-0 mt-1.5`} />
                {i < events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">{formatDate(event.deadline)}</p>
                <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {formatTime(event.deadline)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {event.subject}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
