"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

export function AiTipWidget() {
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ tip: string }>("/api/ai/tip")
      .then((res) => setTip(res.tip))
      .catch(() => setTip("Take regular breaks while studying!"))
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    api
      .get<{ tip: string }>("/api/ai/tip")
      .then((res) => setTip(res.tip))
      .catch(() => setTip("Stay curious, keep learning!"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-white border border-border rounded-[10px] p-5 card-hover h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
          </div>
          <h3 className="font-semibold text-foreground">AI Tip of the Day</h3>
        </div>
        <button
          onClick={handleRefresh}
          className="w-8 h-8 rounded-[10px] bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
          aria-label="Refresh tip"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded-full animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded-full animate-pulse w-1/2" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          &ldquo;{tip}&rdquo;
        </p>
      )}
    </div>
  );
}
