"use client";

import { GraduationCap, CheckCircle, Bell, CalendarClock } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-[10px] bg-white/15 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>CampusFlow</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4" style={{ letterSpacing: "-0.03em" }}>
            Your AI-Powered Student Hub
          </h1>
          <p className="text-white/70 mb-8 text-sm leading-relaxed">
            Never miss a deadline again. Smart reminders, AI summaries, and attendance tracking — all in one place.
          </p>
          <div className="space-y-4">
            {[
              { icon: CalendarClock, text: "Automatic Telegram reminders" },
              { icon: CheckCircle, text: "AI notice summarization" },
              { icon: Bell, text: "Attendance risk alerts" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-white/15 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-muted/30">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
}
