"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { CheckCircle, Loader2, AlertCircle, Users } from "lucide-react";

export default function JoinGroupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <JoinGroupContent />
    </Suspense>
  );
}

function JoinGroupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const chatId = searchParams.get("chat_id");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-auth">("loading");
  const [groupName, setGroupName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!chatId) {
      setStatus("error");
      setErrorMsg("Invalid invite link — missing group ID.");
      return;
    }

    if (!user) {
      setStatus("no-auth");
      return;
    }

    // Join the group
    api
      .post<{ message: string; group_name: string }>("/api/groups/join", {
        chat_id: Number(chatId),
      })
      .then((res) => {
        setGroupName(res.group_name);
        setStatus("success");
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to join group.");
        setStatus("error");
      });
  }, [chatId, user]);

  const handleLogin = () => {
    // Save the current URL so user can be redirected back after login
    if (typeof window !== "undefined") {
      localStorage.setItem("UniKit_redirect", window.location.href);
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-[10px] shadow-lg border border-slate-200 p-8 max-w-md w-full text-center">
        {/* Loading */}
        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Joining group...</h1>
            <p className="text-sm text-slate-500">Linking your UniKit account to this Telegram group.</p>
          </div>
        )}

        {/* Not logged in */}
        {status === "no-auth" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Join Your Class Group</h1>
            <p className="text-sm text-slate-500">
              Sign in to UniKit to link your account. All deadlines from your teacher will automatically sync to your Google Calendar.
            </p>
            <button
              onClick={handleLogin}
              className="w-full py-3 px-4 bg-primary text-white rounded-[10px] font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
            >
              Sign in to join
            </button>
            <p className="text-xs text-slate-400">
              Don&apos;t have an account? Sign up first, then come back to this link.
            </p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">You&apos;re in! 🎉</h1>
            <p className="text-sm text-slate-500">
              Successfully joined <span className="font-semibold text-slate-700">{groupName}</span>.
              Deadlines posted by your teacher will now sync to your Google Calendar automatically.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 px-4 bg-primary text-white rounded-[10px] font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
            <p className="text-sm text-slate-500">{errorMsg}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-[10px] font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        <p className="mt-6 text-[10px] text-slate-300 uppercase tracking-wider">UniKit × NotifyMe</p>
      </div>
    </div>
  );
}
