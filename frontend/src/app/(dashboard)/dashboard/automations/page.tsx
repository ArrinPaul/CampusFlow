"use client";

import { useEffect, useState } from "react";
import { Workflow, RefreshCw, Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { api } from "@/lib/api";
import type { AutomationLog } from "@/features/types";

export default function AutomationsPage() {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get<{ logs: AutomationLog[] }>("/api/automations");
      setLogs(res.logs || []);
    } catch (err) {
      console.error("Failed to fetch automation logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getWorkflowLabel = (type: string) => {
    switch (type) {
      case "deadline_reminder":
        return "Deadline TG Reminder & GCal Sync";
      case "notice_broadcast":
        return "Telegram Notice Broadcast";
      case "attendance_alert":
        return "AI Attendance Risk Assess";
      default:
        return type;
    }
  };

  return (
    <div className="max-w-4xl space-y-8 mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Automations</h1>
        <button
          onClick={() => fetchLogs(false)}
          className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
          title="Refresh logs"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-border rounded-[10px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Loading logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-border rounded-[10px] p-12 text-center shadow-sm">
          <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No automation logs</h3>
          <p className="text-sm text-muted-foreground">
            Logs will appear here when n8n flows trigger upon task creation or notice broadcasts.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-[10px] overflow-hidden shadow-sm">
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-standard"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full flex-shrink-0 mt-0.5 ${
                    log.status === "success" 
                      ? "bg-green-500/10 text-green-600" 
                      : log.status === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                  }`}>
                    {log.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : log.status === "failed" ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4 animate-pulse" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {getWorkflowLabel(log.workflow_type)}
                    </p>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2 items-center">
                      <span>Log ID: <span className="font-mono">{log.id.slice(0, 8)}...</span></span>
                      <span>•</span>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1 bg-muted/40 p-2 rounded-[6px] border border-border font-mono max-w-lg overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center justify-end sm:text-right">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                    log.status === "success"
                      ? "bg-green-500/15 text-green-600"
                      : log.status === "failed"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-primary/15 text-primary"
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
