"use client";

import { Flame, Clock, CheckCircle } from "lucide-react";
import type { Attendance } from "@/features/types";

interface StudyStreakWidgetProps {
  attendance: Attendance[];
}

export function StudyStreakWidget({ attendance = [] }: StudyStreakWidgetProps) {
  const getStreakData = () => {
    const totalAttended = attendance.reduce((s, r) => s + r.attended_classes, 0);
    const streak = totalAttended > 0 ? Math.min(totalAttended, 7) : 0;
    const totalHours = (totalAttended * 0.5).toFixed(1);
    const totalFinished = totalAttended;

    return { streak, totalHours, totalFinished };
  };

  const { streak, totalHours, totalFinished } = getStreakData();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-[10px] p-5 card-hover h-full text-white">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-[10px] bg-white/15 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5" />
        </div>
        <h3 className="font-semibold">Study Streak</h3>
      </div>

      <div className="text-center mb-4">
        <p className="text-4xl font-bold tracking-tight">{streak}</p>
        <p className="text-xs text-white/70 mt-0.5">Day Streak</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-[10px] p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-white/70" />
            <span className="text-xs text-white/70">Hours</span>
          </div>
          <p className="text-lg font-bold">{totalHours}</p>
        </div>
        <div className="bg-white/10 rounded-[10px] p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-white/70" />
            <span className="text-xs text-white/70">Tasks</span>
          </div>
          <p className="text-lg font-bold">{totalFinished}</p>
        </div>
      </div>
    </div>
  );
}
