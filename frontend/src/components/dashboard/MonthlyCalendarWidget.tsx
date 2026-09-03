"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Link2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Task } from "@/features/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

interface CalendarItem {
  id: string;
  title: string;
  date: Date;
  type: "task" | "google";
  status?: string;
  subject?: string;
}

export function MonthlyCalendarWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tasks
        const taskRes = await api
          .get<{ tasks: Task[] }>("/api/tasks")
          .catch(() => ({ tasks: [] }));
        setTasks(taskRes.tasks || []);

        // Check Google Calendar status
        const statusRes = await api
          .get<{ connected: boolean }>("/api/auth/google/status")
          .catch(() => ({ connected: false }));
        setCalendarConnected(statusRes.connected);

        // Load Google Calendar events if connected
        if (statusRes.connected) {
          const gcalRes = await api
            .get<{ events: { items: GoogleCalendarEvent[] } }>("/api/auth/google/calendar/events")
            .catch(() => ({ events: { items: [] } }));
          setGoogleEvents(gcalRes.events?.items || []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const isSelected = (day: number) =>
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;

  const getItemsForDay = (day: number): CalendarItem[] => {
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(dayDate);
    nextDay.setDate(dayDate.getDate() + 1);

    // Local tasks
    const taskItems: CalendarItem[] = tasks
      .filter((t) => {
        const d = new Date(t.deadline);
        return d >= dayDate && d < nextDay;
      })
      .map((t) => ({
        id: t.id,
        title: t.title,
        date: new Date(t.deadline),
        type: "task" as const,
        status: t.status,
        subject: t.subject,
      }));

    // Google Calendar events
    const googleItems: CalendarItem[] = googleEvents
      .filter((e) => {
        const startStr = e.start?.dateTime || e.start?.date || "";
        const d = new Date(startStr);
        // For all-day events (date only), compare date strings
        if (e.start?.date && !e.start?.dateTime) {
          const eventDate = new Date(e.start.date + "T00:00:00");
          return eventDate >= dayDate && eventDate < nextDay;
        }
        return d >= dayDate && d < nextDay;
      })
      .map((e) => ({
        id: e.id,
        title: e.summary || "Untitled",
        date: new Date(e.start?.dateTime || e.start?.date || ""),
        type: "google" as const,
      }));

    return [...taskItems, ...googleItems];
  };

  const getSelectedDayItems = (): CalendarItem[] => {
    if (!selectedDate) return [];
    return getItemsForDay(selectedDate.getDate());
  };

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const selectedItems = getSelectedDayItems();

  const handleConnectCalendar = async () => {
    try {
      const res = await api.get<{ url: string }>("/api/auth/google/url");
      window.location.href = res.url;
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-[10px] p-5 h-full">
        <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-4" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Calendar</h3>
          {calendarConnected && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 rounded-[10px] px-2 py-0.5">
              <Link2 className="w-3 h-3" />
              Google Synced
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded-[10px] hover:bg-muted transition-colors" aria-label="Previous month">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground px-2 min-w-[120px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-[10px] hover:bg-muted transition-colors" aria-label="Next month">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-[10px] overflow-hidden mb-4">
        {DAY_NAMES.map((day) => (
          <div key={day} className="bg-muted/50 py-1.5 text-center text-[10px] font-semibold text-muted-foreground uppercase">
            {day}
          </div>
        ))}

        {calendarDays.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="bg-white min-h-[48px]" />;
          }

          const dayItems = getItemsForDay(day);
          const hasTaskItems = dayItems.some((item) => item.type === "task");
          const hasGoogleItems = dayItems.some((item) => item.type === "google");

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(new Date(year, month, day))}
              className={`relative bg-white min-h-[48px] p-1 transition-colors hover:bg-primary/5 ${
                isSelected(day) ? "bg-primary/10" : ""
              }`}
            >
              <span
                className={`text-xs font-medium block text-left ${
                  isToday(day)
                    ? "bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center -ml-0.5 -mt-0.5"
                    : "text-foreground"
                }`}
              >
                {day}
              </span>
              {(hasTaskItems || hasGoogleItems) && (
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {hasTaskItems && (
                    <div className="w-full h-1 rounded-full bg-primary" />
                  )}
                  {hasGoogleItems && (
                    <div className="w-full h-1 rounded-full bg-blue-400" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!calendarConnected && (
        <button
          onClick={handleConnectCalendar}
          className="w-full mb-3 flex items-center justify-center gap-2 py-2 px-3 rounded-[10px] border border-dashed border-blue-300 bg-blue-50/50 text-blue-600 text-xs font-medium hover:bg-blue-50 transition-colors"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Connect Google Calendar
        </button>
      )}

      {selectedDate && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          {selectedItems.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No events</p>
          ) : (
            <div className="space-y-1.5">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 p-2 rounded-[10px] text-xs ${
                    item.type === "google"
                      ? "bg-blue-50"
                      : item.status === "completed"
                      ? "bg-emerald-50"
                      : "bg-primary/5"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      item.type === "google"
                        ? "bg-blue-500"
                        : item.status === "completed"
                        ? "bg-emerald-500"
                        : "bg-primary"
                    }`}
                  />
                  <span
                    className={`font-medium truncate ${
                      item.status === "completed"
                        ? "text-emerald-700 line-through"
                        : item.type === "google"
                        ? "text-blue-700"
                        : "text-foreground"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="ml-auto text-muted-foreground flex-shrink-0">
                    {item.type === "google" ? "Google" : item.subject}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {calendarConnected && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Tasks
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            Google Calendar
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Completed
          </div>
        </div>
      )}
    </div>
  );
}
