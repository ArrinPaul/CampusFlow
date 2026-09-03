"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { TodayTasksWidget } from "@/features/dashboard/components/TodayTasksWidget";
import { UpcomingDeadlinesWidget } from "@/features/dashboard/components/UpcomingDeadlinesWidget";
import { AttendanceWidget } from "@/features/dashboard/components/AttendanceWidget";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { WeeklyProgressWidget } from "@/components/dashboard/WeeklyProgressWidget";
import { StudyStreakWidget } from "@/components/dashboard/StudyStreakWidget";
import { UpcomingEventsWidget } from "@/components/dashboard/UpcomingEventsWidget";
import { RecentActivityWidget } from "@/components/dashboard/RecentActivityWidget";
import { ProductivityScoreWidget } from "@/components/dashboard/ProductivityScoreWidget";
import { FocusTimerWidget } from "@/components/dashboard/FocusTimerWidget";
import { CampusNewsWidget } from "@/components/dashboard/CampusNewsWidget";
import { AchievementWidget } from "@/components/dashboard/AchievementWidget";
import { QuoteWidget } from "@/components/dashboard/QuoteWidget";
import { MonthlyCalendarWidget } from "@/components/dashboard/MonthlyCalendarWidget";
import { ListTodo, Clock, CheckCircle, CalendarDays } from "lucide-react";
import { api } from "@/lib/api";
import type { Task, Attendance } from "@/features/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ tasks: Task[] }>("/api/tasks").catch(() => ({ tasks: [] })),
      api.get<{ attendance: Attendance[] }>("/api/attendance").catch(() => ({ attendance: [] }))
    ]).then(([taskRes, attRes]) => {
      setTasks(taskRes.tasks || []);
      setAttendance(attRes.attendance || []);
    }).finally(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold mb-1 tracking-tight"
              style={{ letterSpacing: "-0.04em" }}
            >
              {getGreeting()}, {user?.name?.split(" ")[0] || "Student"} 👋
            </h1>
            <p className="text-white/70 text-sm">
              Here&apos;s what&apos;s happening with your deadlines today.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
              <CalendarDays className="w-4 h-4" />
              <span className="font-medium">{getFormattedDate()}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{getFormattedTime()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 1: Stat cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={ListTodo} label="Total Tasks"  value={String(totalCount)}    color="bg-primary/10 text-primary" />
          <StatCard icon={Clock}    label="Pending"      value={String(pendingCount)}   color="bg-amber-50 text-amber-600" />
          <StatCard icon={CheckCircle} label="Completed" value={String(completedCount)} color="bg-emerald-50 text-emerald-600" />
        </div>
      )}

      {/* ── Row 2: Calendar  |  Tasks + Deadlines ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <MonthlyCalendarWidget />
        <div className="grid grid-cols-1 gap-6">
          <TodayTasksWidget tasks={tasks} />
          <UpcomingDeadlinesWidget tasks={tasks} />
        </div>
      </div>

      {/* ── Row 3: Attendance  |  Study Streak ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <AttendanceWidget attendance={attendance} />
        <StudyStreakWidget attendance={attendance} />
      </div>

      {/* ── Row 4: Quick Actions  |  Weekly Progress  |  Upcoming Events ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <QuickActionsWidget />
        <WeeklyProgressWidget tasks={tasks} />
        <UpcomingEventsWidget />
      </div>

      {/* ── Row 5: Recent Activity  |  Productivity Score  |  Focus Timer ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <RecentActivityWidget />
        <ProductivityScoreWidget tasks={tasks} attendance={attendance} />
        <FocusTimerWidget />
      </div>

      {/* ── Row 6: Campus News  |  Achievements ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <CampusNewsWidget />
        <AchievementWidget tasks={tasks} attendance={attendance} />
      </div>

      {/* ── Row 7: Quote (full-width centered) ── */}
      <QuoteWidget />
    </div>
  );
}
