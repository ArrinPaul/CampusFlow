"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  FileText, 
  Calendar, 
  GitFork, 
  Lightbulb, 
  ShieldAlert, 
  Megaphone, 
  X, 
  Loader2, 
  Copy, 
  Check 
} from "lucide-react";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: 'default' });

const MermaidChart = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && chart) {
      try {
        mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart).then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
            // Make the SVG occupy more space
            const svgElem = ref.current.querySelector('svg');
            if (svgElem) {
              svgElem.style.width = '100%';
              svgElem.style.maxWidth = '1000px';
              svgElem.style.height = 'auto';
            }
          }
        });
      } catch (e) {
        console.error("Mermaid error:", e);
      }
    }
  }, [chart]);
  return <div ref={ref} className="w-full flex justify-center my-6 overflow-x-auto bg-white p-6 md:p-10 rounded-[16px] border border-border shadow-sm" />;
};

interface Tool {
  slug: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  placeholder: string;
  action: string;
  options?: Array<{
    label: string;
    type: string;
    id: string;
    value?: string | number;
  }>;
}

const TOOLS_CONFIG: Tool[] = [
  {
    slug: "summarize-notes",
    title: "Summarize Notes",
    icon: FileText,
    description: "Get a concise, structured bullet-point summary of your lecture notes",
    placeholder: "Paste your detailed lecture notes, transcript, or slides content here...",
    action: "Summarize Notes"
  },
  {
    slug: "study-schedule",
    title: "Study Schedule",
    icon: Calendar,
    description: "Generate a personalized study plan based on subjects, exam dates, and daily hours",
    placeholder: "List your subjects and topics you need to cover (e.g. OS, DBMS, Compiler)...",
    action: "Generate Plan",
    options: [
      { label: "Exam Date / Target Date", type: "date", id: "examDate" },
      { label: "Daily Study Hours", type: "number", id: "studyHours", value: 4 }
    ]
  },
  {
    slug: "concept-map",
    title: "Concept Map",
    icon: GitFork,
    description: "Deconstruct your lecture topic into a hierarchical layout of connected ideas",
    placeholder: "Enter the lecture notes or key concept you want to map out...",
    action: "Map Concepts"
  },
  {
    slug: "explain-concept",
    title: "Explain Concept",
    icon: Lightbulb,
    description: "Explains difficult theories or code snippet simply with analogies and real-world examples",
    placeholder: "Enter the scientific concept, math formula, or coding topic (e.g., Red-Black Tree)...",
    action: "Explain Simply"
  },
  {
    slug: "attendance-risk",
    title: "Attendance Risk Check",
    icon: ShieldAlert,
    description: "Get custom action plans and calculate skip-class limits from subject percentages",
    placeholder: "Type subjects and your current attendance percentage (e.g., 'DBMS: 78, OS: 62, math: 85')...",
    action: "Assess Risk"
  },
  {
    slug: "notice-summarizer",
    title: "Notice Summarizer",
    icon: Megaphone,
    description: "Extract important dates, action items, and instructions from college circulars",
    placeholder: "Paste the raw circular notice text here...",
    action: "Extract Details"
  }
];

export default function SmartToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Options fields state
  const [examDate, setExamDate] = useState("");
  const [studyHours, setStudyHours] = useState(4);

  const handleOpenTool = (tool: Tool) => {
    setActiveTool(tool);
    setContent("");
    setResult("");
    setError("");
    setExamDate("");
    setStudyHours(4);
    setCopied(false);
  };

  const handleCloseTool = () => {
    setActiveTool(null);
  };

  const handleProcess = async () => {
    if (!activeTool) return;
    
    if (!content.trim() && activeTool.slug !== "study-schedule") {
      setError("Please input some content first!");
      return;
    }

    setError("");
    setLoading(true);
    setResult("");

    try {
      const optionsObj = activeTool.slug === "study-schedule" ? { examDate, studyHours } : {};
      
      const res = await api.post<{ result: string }>(`/api/ai/tool/${activeTool.slug}`, {
        content,
        options: optionsObj
      });

      if (res.result) {
        setResult(res.result);
      } else {
        throw new Error("No output returned from AI.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process tool");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Smart Tools</h1>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-[10px] text-sm text-red-700 flex-shrink-0">
          {error}
        </div>
      )}

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-0 pb-6">
        {TOOLS_CONFIG.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.slug}
              className="bg-white border border-border rounded-[12px] p-6 shadow-sm transition-all hover:shadow-lg flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-12 h-12 rounded-[12px] bg-primary/10 border border-border flex items-center justify-center text-primary mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1.5">
                  {tool.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {tool.description}
                </p>
              </div>
              <button
                onClick={() => handleOpenTool(tool)}
                className="w-full py-2.5 mt-4 bg-primary/5 border border-border hover:bg-primary hover:text-white hover:border-primary text-primary font-semibold rounded-[10px] text-sm transition-standard cursor-pointer text-center"
              >
                Launch Tool
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Overlay */}
      {activeTool && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[16px] border border-border shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-foreground">{activeTool.title}</h2>
              <button 
                onClick={handleCloseTool}
                className="p-1 hover:bg-accent rounded-full text-muted-foreground transition-standard cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Source Material / Text Input
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[200px] resize-y"
                  placeholder={activeTool.placeholder}
                />
              </div>

              {/* Dynamic options fields */}
              {activeTool.slug === "study-schedule" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Target Exam Date
                    </label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Daily Study Hours Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={studyHours}
                      onChange={(e) => setStudyHours(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end border-t border-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseTool}
                  className="px-4 py-2 border border-input text-foreground font-medium rounded-[10px] hover:bg-primary/10 text-xs transition-standard cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[10px] text-xs transition-standard cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {activeTool.action}
                </button>
              </div>

              {/* Result output display */}
              {(result || loading) && (
                <div className="mt-6 border-t border-border pt-6 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generated Output</span>
                    {result && (
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-1 border border-input hover:bg-primary/10 text-xs font-medium rounded-[10px] transition-standard cursor-pointer text-primary"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    )}
                  </div>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                      
                    </div>
                  ) : (
                    <div className="bg-white border border-border rounded-[12px] p-6 md:p-8 text-base text-foreground max-h-[500px] overflow-y-auto shadow-inner prose prose-slate max-w-none prose-headings:text-primary prose-a:text-primary prose-li:my-0">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code(props) {
                            const {children, className, node, ...rest} = props;
                            const match = /language-(\w+)/.exec(className || '');
                            if (match && match[1] === 'mermaid') {
                              return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
                            }
                            return <code {...rest} className={className}>{children}</code>;
                          }
                        }}
                      >
                        {result}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
