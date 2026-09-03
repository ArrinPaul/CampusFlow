"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Calendar, CheckCircle, Plus, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Notice } from "@/features/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function CampusNewsWidget() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ notices: Notice[] }>("/api/notices")
      .then((res) => setNotices(res.notices || []))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-[10px] p-5 h-full">
        <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
            <Newspaper className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Campus News</h3>
        </div>
        <Link
          href="/dashboard/notices"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-[10px] hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Notice
        </Link>
      </div>

      {notices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <Newspaper className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No notices yet</p>
          <p className="text-xs text-muted-foreground mb-3">Campus announcements will appear here</p>
          <Link
            href="/dashboard/notices"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-medium rounded-[10px] hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Your First Notice
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
            {notices.slice(0, 4).map((notice) => (
              <div key={notice.id} className="flex items-start gap-3 p-2.5 rounded-[10px] hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {notice.ai_summary ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <Calendar className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {notice.event_title && (
                    <p className="text-xs font-medium text-primary mb-0.5">{notice.event_title}</p>
                  )}
                  <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                    {notice.ai_summary || notice.notice_text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(notice.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/notices"
            className="flex items-center justify-center gap-1 mt-3 py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All Notices <ArrowRight className="w-3 h-3" />
          </Link>
        </>
      )}
    </div>
  );
}
