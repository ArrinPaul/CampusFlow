"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ReactLenis } from 'lenis/react';
import {
  CalendarClock,
  Sparkles,
  BarChart3,
  ArrowRight,
  ChevronDown,
  Zap,
  CheckCircle,
  Bell,
  GraduationCap,
  Menu,
  X,
  FileText,
  AlertTriangle,
  Send,
  Bot,
  TrendingUp,
  Shield,
  MessageSquare,
  CheckSquare,
  Calendar,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function Header() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-ukit.png" alt="UniKit Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-foreground">UniKit</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#modules" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-standard">
              Features
            </Link>
            <Link href="#ai-features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-standard">
              AI Tools
            </Link>
            <Link href="#why-us" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-standard">
              Why Us
            </Link>
            <a
              href="https://github.com/ArrinPaul/Hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-standard"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-[10px] hover:opacity-90 transition-standard"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-[10px] hover:bg-accent transition-standard"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-standard shadow-md shadow-primary/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-border"
        >
          <div className="px-4 py-4 space-y-3">
            <Link href="#modules" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
              Features
            </Link>
            <Link href="#ai-features" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
              AI Tools
            </Link>
            <Link href="#why-us" className="block text-sm font-medium text-foreground" onClick={() => setMobileOpen(false)}>
              Why Us
            </Link>
            {user ? (
              <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-[10px] text-center" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 text-sm font-medium text-foreground border border-border rounded-[10px] text-center" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/signup" className="block px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-[10px] text-center" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-[10px] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Student Hub
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]"
        >
          Your Smart{" "}
          <span className="relative">
            Campus
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-secondary/20 -z-10 rounded-full" />
          </span>{" "}
          <br className="hidden sm:block" />
          Workflow Suite
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          UniKit unifies deadlines, attendance, notices, and AI tools so your academic life
          moves from chaos to clarity — automatically.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-standard shadow-lg shadow-primary/25"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#modules"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-foreground border border-border rounded-[10px] hover:bg-accent transition-standard"
          >
            Learn More
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 flex justify-center"
        >
          <button
            onClick={() => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })}
            className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="text-sm font-medium mb-2">Discover More</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

const modules = [
  {
    id: "deadlines",
    icon: CalendarClock,
    label: "Deadlines",
    title: "Smart Deadlines",
    description: "Create tasks and get automatic Telegram reminders before your deadlines. Never miss an assignment again.",
    color: "bg-primary",
    iconBg: "bg-primary",
    items: [
      "Automatic Telegram reminders before deadlines",
      "Google Calendar sync for every task",
      "Recurring task support for weekly assignments",
      "Priority-based alerts for urgent deadlines",
    ],
  },
  {
    id: "attendance",
    icon: BarChart3,
    label: "Attendance",
    title: "Attendance Tracker",
    description: "Track attendance per subject and get risk alerts before it's too late. Stay above the threshold.",
    color: "bg-secondary",
    iconBg: "bg-green-500",
    items: [
      "Per-subject attendance tracking",
      "Risk alerts before threshold drops",
      "Visual progress charts and trends",
      "Semester-wide attendance overview",
    ],
  },
  {
    id: "notices",
    icon: FileText,
    label: "Notices",
    title: "AI Notice Summarizer",
    description: "Paste any college notice and get a 3-bullet AI summary in seconds. Save time reading long announcements.",
    color: "bg-blue-500",
    iconBg: "bg-blue-500",
    items: [
      "Instant AI-powered summaries",
      "Key deadline extraction from notices",
      "Action item detection and highlighting",
      "Searchable notice archive",
    ],
  },
  {
    id: "automation",
    icon: Zap,
    label: "Automations",
    title: "Smart Automation",
    description: "Fully automated workflows powered by n8n. Create a task and everything else happens automatically.",
    color: "bg-amber-500",
    iconBg: "bg-amber-500",
    items: [
      "n8n workflow engine integration",
      "Zero manual work after setup",
      "Cross-platform event sync",
      "Custom triggers and conditions",
    ],
  },
];

function Modules() {
  const [active, setActive] = useState("deadlines");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const activeModule = modules.find((m) => m.id === active)!;

  return (
    <section id="modules" ref={ref} className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[20%] -left-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Powerful <span className="text-primary">Tools</span> for Every Need
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Each tool works perfectly on its own or as part of the integrated ecosystem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-[10px] shadow-md p-4 md:p-6 flex flex-col"
          >
            <h3 className="text-lg font-bold mb-4 text-foreground">Modules</h3>
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 flex-grow scrollbar-hide">
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setActive(mod.id)}
                  onMouseEnter={() => setActive(mod.id)}
                  className={`flex items-center gap-3 p-3 rounded-[10px] text-left transition-all duration-200 shrink-0 ${
                    active === mod.id
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div className={`p-2 rounded-[10px] text-white ${mod.iconBg}`}>
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium whitespace-nowrap">{mod.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-[10px] shadow-md overflow-hidden min-h-[400px]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 h-full"
              >
                <div className="p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className={`p-3 rounded-[10px] text-white w-fit mb-4 ${activeModule.iconBg}`}>
                      <activeModule.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">{activeModule.title}</h3>
                    <p className="text-muted-foreground mb-6">{activeModule.description}</p>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Key Features</h4>
                    <ul className="space-y-3">
                      {activeModule.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-muted/50 p-6 md:p-8 flex items-center justify-center">
                  <div className="w-full max-w-sm bg-white rounded-[10px] shadow-sm border border-border p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-[10px] ${activeModule.iconBg} flex items-center justify-center`}>
                        <activeModule.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="h-3 bg-foreground/10 rounded-full w-28 mb-1.5" />
                        <div className="h-2 bg-foreground/5 rounded-full w-20" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full ${activeModule.iconBg}/10 flex items-center justify-center shrink-0`}>
                            <CheckCircle className={`w-3.5 h-3.5 ${activeModule.iconBg === "bg-primary" ? "text-primary" : activeModule.iconBg === "bg-green-500" ? "text-green-500" : activeModule.iconBg === "bg-blue-500" ? "text-blue-500" : "text-amber-500"}`} />
                          </div>
                          <div className="h-2.5 bg-foreground/5 rounded-full flex-1" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className={`h-9 rounded-[10px] ${activeModule.iconBg} flex items-center justify-center`}>
                        <span className="text-white text-sm font-medium">Add New</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const aiFeatures = [
  {
    icon: Bot,
    title: "AI Notice Summarizer",
    description: "Paste any college notice and get a 3-bullet AI summary in seconds. Never read a full notice again.",
    color: "bg-primary",
    gradient: "from-primary to-primary/60",
  },
  {
    icon: AlertTriangle,
    title: "Attendance Risk Alerts",
    description: "AI predicts when you're at risk of falling below attendance threshold and alerts you proactively.",
    color: "bg-secondary",
    gradient: "from-secondary to-secondary/60",
  },
  {
    icon: Send,
    title: "Telegram Auto-Reminders",
    description: "Smart scheduling sends reminders at the perfect time before deadlines so you're never caught off guard.",
    color: "bg-blue-500",
    gradient: "from-blue-500 to-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Smart Priority Scoring",
    description: "AI ranks your tasks by urgency and importance automatically, so you always know what to tackle first.",
    color: "bg-amber-500",
    gradient: "from-amber-500 to-amber-400",
  },
];

function AIFeatureCard({ feature, index }: { feature: typeof aiFeatures[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group bg-white rounded-[10px] shadow-lg hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-500 ease-in-out h-[280px] flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <feature.icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
          {feature.title}
        </h3>
        <div className="relative overflow-hidden flex-1">
          <div
            className={`transition-all duration-500 ease-in-out ${
              hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
              {feature.description}
            </p>
          </div>
          {!hovered && (
            <div className="h-5" />
          )}
        </div>
      </div>
    </div>
  );
}

function AIFeatures() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="ai-features" ref={ref} className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] -right-[5%] w-[25%] h-[25%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[30%] -left-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-[10px] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-POWERED FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Smart Tools That <span className="text-primary">Amplify</span> Your Productivity
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <AIFeatureCard feature={feature} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const comparisons = [
  { feature: "Tool Management", traditional: "Multiple disconnected tools with separate logins", UniKit: "Single platform with integrated modules", icon: LayoutDashboard },
  { feature: "Context Switching", traditional: "Constant switching between apps disrupts focus", UniKit: "Seamless workflow with everything in one place", icon: Zap },
  { feature: "Reminders", traditional: "Manual calendar entries and phone alarms", UniKit: "Automatic Telegram alerts before deadlines", icon: Bell },
  { feature: "Notice Processing", traditional: "Read entire long documents manually", UniKit: "AI-powered 3-bullet summaries in seconds", icon: FileText },
  { feature: "Attendance Tracking", traditional: "Manual spreadsheet tracking and guesswork", UniKit: "Real-time per-subject risk alerts", icon: BarChart3 },
];

function WhyUs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="why-us" ref={ref} className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] -right-[5%] w-[25%] h-[25%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[30%] -left-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-[10px] mb-4">
            <Shield className="w-3.5 h-3.5" />
            WHY UniKit?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Less Context Switching
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Stop juggling multiple apps. UniKit puts everything you need in one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white rounded-[10px] border border-border p-6 shadow-sm mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[10px] bg-destructive/10 flex items-center justify-center">
                  <X className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-lg font-bold text-foreground">The Old Way</h3>
              </div>
              <div className="space-y-4">
                {comparisons.map((row, i) => (
                  <motion.div
                    key={row.feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                    className="flex items-start gap-3 p-3 rounded-[10px] bg-muted/50"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-white border border-border flex items-center justify-center shrink-0 mt-0.5">
                      <row.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-0.5">{row.feature}</p>
                      <p className="text-sm text-muted-foreground">{row.traditional}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-[10px] border-2 border-primary/20 p-6 shadow-lg shadow-primary/5 mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[10px] bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">The UniKit Way</h3>
              </div>
              <div className="space-y-4">
                {comparisons.map((row, i) => (
                  <motion.div
                    key={row.feature}
                    initial={{ opacity: 0, x: 10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                    className="flex items-start gap-3 p-3 rounded-[10px] bg-primary/5 border border-primary/10"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <row.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-0.5">{row.feature}</p>
                      <p className="text-sm text-primary font-medium">{row.UniKit}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-[10px] p-8 text-center border border-primary/10"
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">5+</p>
              <p className="text-sm text-muted-foreground">Tools Replaced</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">1</p>
              <p className="text-sm text-muted-foreground">Platform</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">Context Switches</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ReplaceTools() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const tools = [
    { name: "Google Calendar", icon: Calendar },
    { name: "Excel Sheets", icon: FileText },
    { name: "Manual Reminders", icon: Bell },
    { name: "Notice Boards", icon: LayoutDashboard },
    { name: "WhatsApp Groups", icon: MessageSquare },
  ];

  return (
    <section ref={ref} className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Replace Multiple Tools with{" "}
            <span className="text-primary">UniKit</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            One platform to rule them all. Stop paying for five different apps.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4">
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 w-full">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="bg-white border border-border rounded-[10px] p-4 flex items-center gap-3 opacity-50 hover:opacity-70 transition-opacity"
              >
                <div className="w-10 h-10 rounded-[10px] bg-muted flex items-center justify-center shrink-0">
                  <tool.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground line-through decoration-primary/40">{tool.name}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 200 }}
            className="shrink-0"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
              <ArrowRight className="w-7 h-7 text-white lg:rotate-0 rotate-90" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex-1 w-full"
          >
            <div className="bg-white border-2 border-primary/20 rounded-[10px] p-6 shadow-lg shadow-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-[10px] bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                  <img src="/logo-ukit.png" alt="UniKit Logo" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">UniKit</h3>
                  <p className="text-sm text-primary font-medium">All-in-one student hub</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["Deadlines", "Attendance", "Notices", "AI Tools", "Automations", "Telegram"].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-primary via-primary to-secondary rounded-[10px] p-10 md:p-16 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-white/20 rounded-[10px] mb-6">
              <Zap className="w-3.5 h-3.5" />
              Free for Students
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              Start Building with UniKit Today
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
              Join students across India who never miss a deadline. Get started for free during our public beta and experience the full platform at no cost.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-primary bg-white rounded-full hover:bg-white/90 transition-standard shadow-lg"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#modules"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-white border border-white/30 rounded-[10px] hover:bg-white/10 transition-standard"
              >
                Learn More
              </a>
            </div>
            <p className="text-xs text-white/60 mt-6">
              No credit card required • Free during public beta • Full platform access
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo-ukit.png" alt="UniKit Logo" className="w-6 h-6 object-contain" />
              <span className="text-lg font-bold text-foreground">UniKit</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered student hub for deadline management
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#modules" className="text-sm text-muted-foreground hover:text-foreground transition-standard">Features</Link></li>
              <li><Link href="#ai-features" className="text-sm text-muted-foreground hover:text-foreground transition-standard">AI Tools</Link></li>
              <li><Link href="#why-us" className="text-sm text-muted-foreground hover:text-foreground transition-standard">Why Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><a href="https://github.com/ArrinPaul/Hackathon" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-standard">GitHub</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-standard">Sign In</Link></li>
              <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-standard">Get Started</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 UniKit. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-standard">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-standard">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <Modules />
          <AIFeatures />
          <WhyUs />
          <ReplaceTools />
          <CTA />
        </main>
        <Footer />
      </div>
    </ReactLenis>
  );
}
