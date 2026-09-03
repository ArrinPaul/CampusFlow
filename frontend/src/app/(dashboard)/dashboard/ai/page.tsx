"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, User, Sparkles, MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Create a study plan for mid-semester exams",
  "Explain the difference between SQL and NoSQL",
  "What is the best way to handle overlapping deadlines?",
  "Suggest a memory technique for formulas"
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am Uki, your UniKit AI study assistant. How can I help you organize your schedule, explain academic topics, or prepare for exams today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Send the entire chat history for context
      const conversationContext = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.post<{ reply: string }>("/api/ai/chat", {
        messages: conversationContext
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that message. Please check if your backend and GROQ_API_KEY are configured."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          AI Assistant
        </h1>
      </div>

      {/* Main chat card */}
      <div className="flex-1 bg-white border border-border rounded-[12px] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* Chat History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              } animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-white"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-[12px] text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-muted/30 text-foreground border-border"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center animate-pulse">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-muted/30 border border-border rounded-[12px] flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-border bg-muted/10">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Suggested topics to ask
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSendMessage(s)}
                  className="text-left px-3 py-2 bg-white border border-border rounded-[8px] text-xs text-muted-foreground hover:text-foreground hover:bg-accent hover:border-primary/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t border-border bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(input)}
            placeholder="Ask about a subject, deadline, or general college guidance..."
            className="flex-1 px-3 py-2.5 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-[10px] hover:opacity-90 transition-standard disabled:opacity-50 cursor-pointer flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
