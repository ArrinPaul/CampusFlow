"use client";

import { useEffect, useState } from "react";
import { Megaphone, Sparkles, Send, Calendar, Clock, Loader2, RefreshCw, Users, Bell } from "lucide-react";
import { api } from "@/lib/api";
import type { Notice } from "@/features/types";

interface GroupEvent {
  id: string;
  group_id: string;
  title: string;
  event_date: string;
  priority: string;
  category: string;
  raw_message: string;
  created_at: string;
  telegram_groups?: { name: string };
}

export default function NoticesPage() {
  const [viewMode, setViewMode] = useState<"group" | "personal">("group");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [groupEvents, setGroupEvents] = useState<GroupEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form input states
  const [noticeText, setNoticeText] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  
  // Status states
  const [summarizing, setSummarizing] = useState(false);
  const [broadcastingId, setBroadcastingId] = useState<string | null>(null);
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchNotices = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [noticesRes, eventsRes] = await Promise.all([
        api.get<{ notices: Notice[] }>("/api/notices").catch(() => ({ notices: [] })),
        api.get<{ events: GroupEvent[] }>("/api/groups/events").catch(() => ({ events: [] }))
      ]);
      setNotices(noticesRes.notices || []);
      setGroupEvents(eventsRes.events || []);
      
      if (noticesRes.notices && noticesRes.notices.length > 0 && !activeNotice) {
        // Default to showing the latest personal notice if none selected
        setActiveNotice(noticesRes.notices[0]);
      }
    } catch (err) {
      console.error("Failed to fetch notices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSummarize = async () => {
    setError("");
    setSuccessMsg("");
    if (!noticeText.trim()) {
      setError("Please paste notice text first");
      return;
    }

    setSummarizing(true);
    try {
      const res = await api.post<{ notice: Notice }>("/api/notices", {
        notice_text: noticeText,
        event_title: eventTitle || null,
        event_date: eventDate || null,
      });
      
      setNoticeText("");
      setEventTitle("");
      setEventDate("");
      
      // Update list and select the newly created notice
      setNotices((prev) => [res.notice, ...prev]);
      setActiveNotice(res.notice);
      setSuccessMsg("Notice summarized successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI summarization failed");
    } finally {
      setSummarizing(false);
    }
  };

  const handleBroadcast = async (noticeId: string) => {
    setError("");
    setSuccessMsg("");
    setBroadcastingId(noticeId);
    
    try {
      const res = await api.post<{ success: boolean }>("/api/notices/broadcast", {
        notice_id: noticeId
      });
      
      if (res.success) {
        setSuccessMsg("Broadcast sent to Telegram bot successfully!");
        // Update local broadcast status
        setNotices((prev) => 
          prev.map((n) => n.id === noticeId ? { ...n, broadcast_status: "sent" } : n)
        );
        if (activeNotice && activeNotice.id === noticeId) {
          setActiveNotice({ ...activeNotice, broadcast_status: "sent" });
        }
      } else {
        setError("n8n notice broadcast failed to deliver");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to broadcast notice");
    } finally {
      setBroadcastingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
        <div className="flex bg-muted/40 p-1 rounded-[10px] w-full max-w-sm">
          <button 
            onClick={() => setViewMode("group")} 
            className={`flex-1 text-sm font-medium py-1.5 rounded-[8px] transition-standard flex items-center justify-center gap-2 ${viewMode === "group" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Users className="w-4 h-4" /> Group
          </button>
          <button 
            onClick={() => setViewMode("personal")} 
            className={`flex-1 text-sm font-medium py-1.5 rounded-[8px] transition-standard flex items-center justify-center gap-2 ${viewMode === "personal" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Sparkles className="w-4 h-4" /> Summarizer
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-[10px] text-sm text-destructive animate-in fade-in duration-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-[10px] text-sm text-green-600 animate-in fade-in duration-200">
          {successMsg}
        </div>
      )}

      {viewMode === "group" ? (
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Loading announcements...</p>
            </div>
          ) : groupEvents.length === 0 ? (
            <div className="bg-white border border-border rounded-[10px] p-12 text-center shadow-sm">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Group Announcements</h3>
              <p className="text-sm text-muted-foreground">
                Join a group via invite link to receive teacher announcements here.
              </p>
            </div>
          ) : (
            groupEvents.map(event => (
              <div key={event.id} className="bg-white border border-border rounded-[10px] p-5 shadow-sm space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full inline-flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    {event.telegram_groups?.name || "Unknown Group"}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{new Date(event.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-foreground text-lg">{event.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{event.raw_message}</p>
                <div className="flex items-center gap-4 text-xs font-medium pt-3 border-t border-border mt-3">
                  <div className="flex items-center gap-1.5 text-secondary"><Calendar className="w-3.5 h-3.5"/> Due: {new Date(event.event_date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1.5 text-amber-600"><Megaphone className="w-3.5 h-3.5"/> {event.priority} Priority</div>
                  <div className="flex items-center gap-1.5 text-purple-600"><Clock className="w-3.5 h-3.5"/> {event.category}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto pb-6 pr-1">
        {/* Notice Form Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-border rounded-[10px] p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Paste Notice Text *
              </label>
              <textarea
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full h-44 px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none font-sans"
                placeholder="Paste the full, detailed announcement text from your college portal or group chat here..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Associated Event Title (Optional)
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., End Sem Exam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Associated Event Date (Optional)
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSummarize}
                disabled={summarizing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-[10px] hover:opacity-90 transition-standard cursor-pointer disabled:opacity-50"
              >
                {summarizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Summarizing notice...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Summarize with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Notice Summary View */}
          {activeNotice && (
            <div className="bg-white border border-border rounded-[10px] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg">AI-Generated Summary</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created on {new Date(activeNotice.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleBroadcast(activeNotice.id)}
                  disabled={broadcastingId === activeNotice.id}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-[10px] hover:opacity-90 transition-standard cursor-pointer disabled:opacity-50"
                >
                  {broadcastingId === activeNotice.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {activeNotice.broadcast_status === "sent" ? "Re-Broadcast" : "Broadcast (TG)"}
                </button>
              </div>

              <div className="p-4 bg-muted/40 rounded-[10px] border border-border text-sm text-foreground space-y-2 whitespace-pre-line leading-relaxed">
                {activeNotice.ai_summary || "No summary generated for this notice."}
              </div>

              {(activeNotice.event_title || activeNotice.event_date) && (
                <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                  {activeNotice.event_title && (
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>Event: <strong>{activeNotice.event_title}</strong></span>
                    </div>
                  )}
                  {activeNotice.event_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-secondary" />
                      <span>Date: <strong>{new Date(activeNotice.event_date).toLocaleDateString(undefined, { dateStyle: "medium" })}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notices History Sidebar */}
        <div className="bg-white border border-border rounded-[10px] p-4 shadow-sm flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              Recent Notices
            </h3>
            <button 
              onClick={() => fetchNotices(false)}
              className="p-1.5 hover:bg-accent rounded-[10px] text-muted-foreground hover:text-foreground transition-standard cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
              <p className="text-xs text-muted-foreground">Loading notices...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="bg-white border border-border rounded-[10px] p-12 text-center shadow-sm my-auto">
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notices yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Paste your first announcement to generate history
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px]">
              {notices.map((notice) => (
                <button
                  key={notice.id}
                  onClick={() => setActiveNotice(notice)}
                  className={`w-full text-left p-3 rounded-[8px] transition-standard border text-xs flex flex-col gap-1 cursor-pointer ${
                    activeNotice?.id === notice.id
                      ? "bg-primary/5 border-primary text-primary"
                      : "bg-white hover:bg-accent border-border"
                  }`}
                >
                  <p className="font-semibold line-clamp-1 text-foreground">
                    {notice.event_title || notice.notice_text}
                  </p>
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                    {notice.ai_summary || notice.notice_text}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1 pt-1 border-t border-dashed border-border w-full">
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-[10px] ${
                      notice.broadcast_status === "sent" 
                        ? "bg-green-500/15 text-green-600" 
                        : notice.broadcast_status === "failed"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-yellow-500/15 text-yellow-600"
                    }`}>
                      {notice.broadcast_status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
