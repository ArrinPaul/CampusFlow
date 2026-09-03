"use client";

import { useEffect, useState } from "react";
import { Quote, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

export function QuoteWidget() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchQuote = () => {
    setLoading(true);
    api
      .get<{ tip: string }>("/api/ai/tip")
      .then((res) => {
        setQuote(res.tip);
        setAuthor("UniKit AI");
      })
      .catch(() => {
        setQuote("The only way to do great work is to love what you do.");
        setAuthor("Steve Jobs");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-[10px] p-6 card-hover h-full text-white">
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-[10px] bg-white/15 flex items-center justify-center">
            <Quote className="w-5 h-5" />
          </div>
          <button
            onClick={fetchQuote}
            className="w-8 h-8 rounded-[10px] bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all"
            aria-label="New quote"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-white/20 rounded animate-pulse w-1/2" />
          </div>
        ) : (
          <>
            <blockquote className="text-lg font-medium leading-relaxed mb-4 italic" style={{ letterSpacing: "-0.01em" }}>
              &ldquo;{quote}&rdquo;
            </blockquote>
            <p className="text-sm text-white/70">&mdash; {author}</p>
          </>
        )}
      </div>
    </div>
  );
}
