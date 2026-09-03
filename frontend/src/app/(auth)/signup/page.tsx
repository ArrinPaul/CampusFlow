"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api";

const branches = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "Other"];
const years = [1, 2, 3, 4];

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    branch: "",
    year: "",
    telegram_username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const authError = params.get("error");

    if (authError) {
      setError("Google authentication failed. Please try again.");
    }

    if (token) {
      localStorage.setItem("unikit_token", token);
      window.location.href = "/dashboard";
    }
  }, []);

  const passwordStrength = (() => {
    const p = form.password;
    if (p.length === 0) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthColors = ["bg-red-500", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-600"];
  const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

  const handleGoogleLogin = async () => {
    try {
      const res = await api.get<{ url: string }>("/api/auth/google/url");
      window.location.href = res.url;
    } catch {
      setError("Failed to initiate Google login");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // Clear error on change
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!form.email || !form.password || !form.confirmPassword) {
        setError("Please fill all fields");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.name || !form.branch || !form.year) {
        setError("Please fill all personal info");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.telegram_username) {
      setError("Telegram username is required");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        branch: form.branch,
        year: Number(form.year),
        telegram_username: form.telegram_username,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[10px] border border-border p-5 sm:p-6 shadow-sm w-full">
      {/* Progress Indicator */}
      <div className="flex gap-2 mb-4">
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }}>
            {step === 1 ? "Account Credentials" : step === 2 ? "Personal Info" : "Telegram Sync"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {step === 1 ? "Step 1 of 3" : step === 2 ? "Step 2 of 3" : "Final Step"}
          </p>
        </div>
        {step > 1 && (
          <button onClick={handleBack} className="p-1.5 text-muted-foreground hover:bg-accent rounded-full transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-[10px] text-xs text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-3">
        
        {/* STEP 1: CREDENTIALS */}
        {step === 1 && (
          <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 pr-10 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-1.5">
                  <div className="flex gap-1 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i <= passwordStrength ? strengthColors[passwordStrength] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{strengthLabels[passwordStrength]}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 2: PERSONAL INFO */}
        {step === 2 && (
          <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-foreground mb-1">
                  Branch
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  required
                >
                  <option value="">Select</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-foreground mb-1">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  required
                >
                  <option value="">Select</option>
                  {years.map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TELEGRAM INFO */}
        {step === 3 && (
          <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
            <div className="p-3 bg-blue-500/10 text-blue-700 border border-blue-500/20 rounded-[10px] text-xs mb-3 leading-relaxed">
              UniKit uses Telegram to send you intelligent task reminders, summarize college notices on-the-fly, and alert you of attendance risks.
            </div>
            
            <div>
              <label htmlFor="telegram_username" className="block text-sm font-medium text-foreground mb-1">
                Telegram Username
              </label>
              <input
                id="telegram_username"
                name="telegram_username"
                type="text"
                value={form.telegram_username}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="@yourusername"
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-4 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-standard disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {step < 3 ? (
            <>
              Next <ArrowRight className="w-4 h-4" />
            </>
          ) : loading ? (
            "Creating account..."
          ) : (
            <>
              Create Account <Check className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {step === 1 && (
        <>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-semibold">
              <span className="bg-white px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-2 border border-border rounded-full text-sm font-medium text-foreground hover:bg-muted transition-standard flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button className="w-full py-2 border border-border rounded-full text-sm font-medium text-foreground hover:bg-muted transition-standard">
              Continue with GitHub
            </button>
          </div>
        </>
      )}

      {step === 1 && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
