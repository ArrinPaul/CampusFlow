"use client";

import { GraduationCap, Heart, ArrowUp } from "lucide-react";
import Link from "next/link";

export function DashboardFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-primary text-white">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-white/15 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold text-white">CampusFlow</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed max-w-xs">
                AI-powered student hub. Never miss a deadline again.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">Quick Links</h4>
              <div className="grid grid-cols-2 gap-1.5">
                <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/dashboard/tasks" className="text-sm text-white/60 hover:text-white transition-colors">Tasks</Link>
                <Link href="/dashboard/ai" className="text-sm text-white/60 hover:text-white transition-colors">AI Assistant</Link>
                <Link href="/dashboard/attendance" className="text-sm text-white/60 hover:text-white transition-colors">Attendance</Link>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">Connect</h4>
              <div className="flex gap-2">
                {[
                  { label: "Website" },
                  { label: "Chat" },
                  { label: "Email" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="w-8 h-8 rounded-[10px] bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    aria-label={social.label}
                  >
                    <span className="text-xs font-medium text-white">{social.label[0]}</span>
                  </a>
                ))}
              </div>
              <p className="text-xs text-white/50">Built for students, by students.</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/50 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-white" /> CampusFlow Team &copy; {new Date().getFullYear()}
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors group"
            >
              Back to top
              <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
