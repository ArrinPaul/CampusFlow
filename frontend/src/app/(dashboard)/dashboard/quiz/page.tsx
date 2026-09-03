"use client";

import { useState, useEffect } from "react";
import { 
  HelpCircle, 
  BookOpen, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Award,
  Plus,
  FileText,
  Edit2,
  Check,
  X,
  Info,
  ChevronRight,
  FileSpreadsheet,
  ListOrdered,
  Pin,
  Bookmark,
  Upload
} from "lucide-react";
import { api } from "@/lib/api";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  user_answer_index?: number;
  is_correct?: boolean;
  explanation: string;
  citation?: string;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation?: string;
}

interface Quiz {
  id: string;
  title: string;
  score: number | null;
  createdAt: string;
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Modal state for New Quiz
  const [isNewQuizModalOpen, setIsNewQuizModalOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizContent, setNewQuizContent] = useState("");
  const [newQuizCount, setNewQuizCount] = useState(5);
  const [newQuizType, setNewQuizType] = useState<"mcq" | "tf">("mcq");
  
  // File Upload Status
  const [fileLoading, setFileLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [modalTab, setModalTab] = useState<"text" | "upload">("text");

  // Active Quiz State
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  
  // Workspace Views: "interactive" | "review-sheet"
  const [activeView, setActiveView] = useState<"interactive" | "review-sheet">("interactive");

  const fetchQuizzes = async () => {
    try {
      const res = await api.get<{ quizzes: Quiz[] }>("/api/quizzes");
      setQuizzes(res.quizzes || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (!selectedQuizId) {
      setQuiz(null);
      setQuestions([]);
      return;
    }
    const loadQuiz = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get<{ quiz: Quiz; questions: Question[] }>(`/api/quizzes/${selectedQuizId}`);
        setQuiz(res.quiz);
        setQuestions(res.questions);
        
        const loadedAnswers: Record<number, number> = {};
        res.questions.forEach((q, idx) => {
          if (q.user_answer_index !== null && q.user_answer_index !== undefined) {
            loadedAnswers[idx] = q.user_answer_index;
          }
        });
        
        setAnswers(loadedAnswers);
        setSubmitted(res.quiz.score !== null);
        setActiveQuestionIndex(0);
        setActiveView("interactive");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [selectedQuizId]);

  // PDF.js dynamic CDN Loader helper
  const loadPdfJs = async () => {
    if (typeof window === "undefined") return null;
    const win = window as any;
    if (win.pdfjsLib) return win.pdfjsLib;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
      script.onload = () => {
        win.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        resolve(win.pdfjsLib);
      };
      script.onerror = () => reject(new Error("Failed to load PDF parsing library. Check internet connectivity."));
      document.head.appendChild(script);
    });
  };

  // File Upload Document Parser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    setUploadError("");

    try {
      let extractedText = "";

      if (file.name.endsWith(".pdf")) {
        const pdfjsLib = await loadPdfJs();
        if (!pdfjsLib) throw new Error("Could not initialize PDF reader module.");

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n\n";
        }
        extractedText = fullText;
      } else {
        extractedText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string || "");
          reader.onerror = () => reject(new Error("Failed to read text document."));
          reader.readAsText(file);
        });
      }

      if (!extractedText.trim()) {
        throw new Error("No readable text content could be extracted from this document.");
      }

      setNewQuizTitle(file.name.replace(/\.[^/.]+$/, ""));
      setNewQuizContent(extractedText);
      setModalTab("text"); // Switch back to text view
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error reading uploaded file.");
    } finally {
      setFileLoading(false);
      e.target.value = "";
    }
  };

  const handleGenerateQuiz = async () => {
    if (!newQuizTitle.trim() || !newQuizContent.trim()) {
      alert("Please provide both a title and notes text content.");
      return;
    }

    setLoading(true);
    setError("");
    setIsNewQuizModalOpen(false);

    try {
      const aiRes = await api.post<{ questions: GeneratedQuestion[] }>("/api/ai/quiz", {
        notes: newQuizContent,
        count: newQuizCount,
        type: newQuizType
      });

      if (!aiRes.questions || aiRes.questions.length === 0) {
        throw new Error("AI did not generate any quiz questions.");
      }

      const saveRes = await api.post<{ quiz: Quiz }>("/api/quizzes", {
        title: newQuizTitle,
        questions: aiRes.questions
      });

      setQuizzes(prev => [saveRes.quiz, ...prev]);
      setSelectedQuizId(saveRes.quiz.id);
      
      setNewQuizTitle("");
      setNewQuizContent("");
      setNewQuizCount(5);
      setNewQuizType("mcq");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await api.delete(`/api/quizzes/${id}`);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      if (selectedQuizId === id) {
        setSelectedQuizId(null);
      }
    } catch (err) {
      alert("Failed to delete quiz.");
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [activeQuestionIndex]: optIndex }));
  };

  const handleSubmitQuiz = async () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Submit anyway?`)) {
        return;
      }
    }

    setLoading(true);
    setError("");
      
    try {
      let scoreCount = 0;
      const submissionAnswers = questions.map((q, i) => {
        const userAnswerIndex = answers[i] ?? -1;
        const isCorrect = userAnswerIndex === q.correct_index;
        if (isCorrect) scoreCount++;
        return {
          question_id: q.id,
          user_answer_index: userAnswerIndex,
          is_correct: isCorrect
        };
      });

      const finalScore = Math.round((scoreCount / questions.length) * 100);

      await api.patch(`/api/quizzes/${selectedQuizId}/submit`, {
        score: finalScore,
        answers: submissionAnswers
      });

      setSubmitted(true);
      setActiveQuestionIndex(0);
      setQuiz(prev => prev ? { ...prev, score: finalScore } : null);
      
      setQuizzes(prev => prev.map(q => q.id === selectedQuizId ? { ...q, score: finalScore } : q));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit exam.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    setActiveQuestionIndex(0);
    setActiveView("interactive");
  };

  const calculateScore = () => {
    let scoreCount = 0;
    questions.forEach((q, qi) => {
      if (answers[qi] === q.correct_index) {
        scoreCount++;
      }
    });
    return scoreCount;
  };

  const score = calculateScore();
  const unansweredCount = questions.length - Object.keys(answers).length;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Quizzes
        </h1>

        {questions.length > 0 && selectedQuizId && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRetake}
              disabled={!submitted}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-[10px] hover:opacity-90 disabled:opacity-50 transition-standard cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Quiz
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 mb-4 bg-destructive/10 border border-destructive/20 rounded-[10px] text-sm text-red-700 animate-in fade-in duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 block flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 overflow-y-auto pb-6 pr-1">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-[10px] p-5 space-y-4 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0 mb-4 border-b border-border pb-4">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider font-mono">
                Your Quizzes
              </h4>
              <button 
                onClick={() => {
                  setNewQuizTitle("");
                  setNewQuizContent("");
                  setModalTab("text");
                  setUploadError("");
                  setIsNewQuizModalOpen(true);
                }}
                className="text-[10px] font-semibold text-primary hover:text-foreground flex items-center gap-1 transition-standard cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                New Quiz
              </button>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {quizzes.length === 0 ? (
                <div className="border border-dashed border-border rounded-[10px] p-6 text-center text-xs text-muted-foreground font-sans italic">
                  No quizzes found. Create one to start studying.
                </div>
              ) : (
                quizzes.map((q) => {
                  const isSelected = selectedQuizId === q.id;
                  return (
                    <div 
                      key={q.id}
                      onClick={() => setSelectedQuizId(q.id)}
                      className={`group border rounded-[10px] p-3 transition-standard cursor-pointer flex items-start gap-2.5 relative ${
                        isSelected ? "bg-white border-primary/40 shadow-sm" : "bg-transparent border-border hover:bg-muted/45"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <h4 className="font-semibold text-xs text-foreground truncate pr-12">
                            {q.title}
                          </h4>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {q.score !== null ? `Score: ${q.score}%` : "Not completed"}
                        </p>
                      </div>

                      <div className="absolute right-2 top-2 flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-standard" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleDeleteQuiz(q.id, e)}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[10px] transition-standard cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Empty State */}
          {!selectedQuizId && !loading && (
            <div className="bg-white border border-border rounded-[10px] p-12 text-center shadow-sm">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Assessment Center</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a quiz from the left or create a new one to start studying.
              </p>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setNewQuizTitle("");
                    setNewQuizContent("");
                    setModalTab("text");
                    setUploadError("");
                    setIsNewQuizModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-[10px] text-xs transition-standard cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate New Quiz
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="h-[460px] border border-border rounded-[10px] bg-white flex flex-col items-center justify-center text-center p-8 shadow-sm">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-bold text-foreground font-sans">
                {selectedQuizId && !questions.length ? "Loading Quiz..." : "Drafting Questions..."}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs font-sans italic mt-1.5 leading-relaxed">
                Please wait while we process the assessment...
              </p>
            </div>
          )}

          {/* Active Quiz */}
          {selectedQuizId && questions.length > 0 && !loading && (
            <div className="space-y-5">
              
              {/* Tabs */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border pb-2 gap-3">
                <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-[10px]">
                  <button
                    onClick={() => setActiveView("interactive")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] transition-standard cursor-pointer ${
                      activeView === "interactive" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    Interactive Workspace
                  </button>
                  
                  {submitted && (
                    <button
                      onClick={() => setActiveView("review-sheet")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] transition-standard cursor-pointer ${
                        activeView === "review-sheet" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Detailed Review Sheet
                    </button>
                  )}
                </div>

                <div className="text-xs font-semibold">
                  {submitted ? (
                    <span className="text-primary bg-purple-50 border border-purple-150 px-2.5 py-1 rounded-[10px] uppercase tracking-wider font-mono">
                      SCORE: {quiz?.score}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Progress: {Object.keys(answers).length} / {questions.length} answered
                    </span>
                  )}
                </div>
              </div>

              {/* View Rendering */}
              {!submitted || activeView === "interactive" ? (
                /* INTERACTIVE VIEW */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  <div className="md:col-span-8 bg-white border border-border rounded-[10px] p-6 shadow-sm space-y-6">
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between flex-shrink-0 mb-6">
                        <span className="text-[10px] font-bold text-primary tracking-wider uppercase font-mono">
                          QUESTION {activeQuestionIndex + 1} OF {questions.length}
                        </span>
                        
                        {submitted && (
                          answers[activeQuestionIndex] === questions[activeQuestionIndex].correct_index ? (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-[10px]">✓ Correct</span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-700 bg-destructive/10 px-2.5 py-0.5 rounded-[10px]">✗ Incorrect</span>
                          )
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-foreground font-sans leading-relaxed">
                        {questions[activeQuestionIndex].question}
                      </h3>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-3">
                      {questions[activeQuestionIndex].options?.map((option, optIdx) => {
                        const isSelected = answers[activeQuestionIndex] === optIdx;
                        const isCorrect = questions[activeQuestionIndex].correct_index === optIdx;
                        const optionLetter = String.fromCharCode(65 + optIdx);
                        
                        let cardStyle = "flex items-center gap-3.5 p-4 border border-border rounded-[10px] text-sm cursor-pointer transition-standard hover:bg-background hover:border-[#5b21b6]/50 text-foreground";
                        let letterBadgeStyle = "w-7 h-7 rounded-full bg-muted text-muted-foreground font-semibold text-xs flex items-center justify-center flex-shrink-0 transition-standard";
                        
                        if (submitted) {
                          if (isCorrect) {
                            cardStyle = "flex items-center gap-3.5 p-4 border border-purple-200 bg-[#f3edfa] text-purple-800 rounded-[10px] text-sm font-medium";
                            letterBadgeStyle = "w-7 h-7 rounded-full bg-purple-600 text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0";
                          } else if (isSelected) {
                            cardStyle = "flex items-center gap-3.5 p-4 border border-destructive/20 bg-destructive/10 text-red-800 rounded-[10px] text-sm font-medium";
                            letterBadgeStyle = "w-7 h-7 rounded-full bg-red-600 text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0";
                          } else {
                            cardStyle = "flex items-center gap-3.5 p-4 border border-border rounded-[10px] text-sm opacity-55 pointer-events-none";
                          }
                        } else if (isSelected) {
                          cardStyle = "flex items-center gap-3.5 p-4 border border-[#5b21b6] bg-[#f3eefa] text-foreground rounded-[10px] text-sm font-semibold shadow-sm";
                          letterBadgeStyle = "w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center flex-shrink-0";
                        }

                        return (
                          <div key={optIdx} onClick={() => handleSelectOption(optIdx)} className={cardStyle}>
                            <span className={letterBadgeStyle}>{optionLetter}</span>
                            <span className="font-sans">{option}</span>
                          </div>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div className="space-y-3.5 border-t border-[#f3eff8] pt-4">
                        {questions[activeQuestionIndex].explanation && (
                          <div className="bg-[#f5f0fa] border border-border rounded-[10px] p-4 text-xs text-muted-foreground font-sans leading-relaxed">
                            <strong className="text-primary font-sans block mb-1 uppercase tracking-wider text-[10px]">Explanation Key:</strong>
                            {questions[activeQuestionIndex].explanation}
                          </div>
                        )}

                        {questions[activeQuestionIndex].citation && (
                          <div className="bg-[#f0e8fa] border-l-2 border-[#5b21b6] p-3 text-xs text-muted-foreground font-sans italic rounded-r-[4px]">
                            <strong className="text-[10px] font-bold text-primary font-sans block not-italic uppercase mb-0.5">Reference Source Quote:</strong>
                            "{questions[activeQuestionIndex].citation}"
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-[#f3eff8] pt-4 mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                          disabled={activeQuestionIndex === 0}
                          className="inline-flex items-center gap-1 px-3.5 py-2 border border-border hover:bg-[#f1ecf8] text-xs font-semibold rounded-[10px] transition-standard disabled:opacity-50"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Previous
                        </button>
                      </div>
                      
                      {activeQuestionIndex < questions.length - 1 ? (
                        <button
                          onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                          className="inline-flex items-center gap-1 px-3.5 py-2 bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold rounded-[10px] transition-standard"
                        >
                          Next <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        !submitted && (
                          <button
                            onClick={handleSubmitQuiz}
                            className="px-5 py-2 bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold rounded-[10px] transition-standard shadow-sm"
                          >
                            Submit Exam
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Question Grid */}
                  <div className="md:col-span-4 bg-card border border-border rounded-[10px] p-5 space-y-4 shadow-sm">
                    <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Question Tracker</h4>

                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((_, idx) => {
                        const isCurrent = activeQuestionIndex === idx;
                        const isAnswered = answers[idx] !== undefined;
                        
                        const correct = answers[idx] === questions[idx].correct_index;
                        
                        let dotStyle = "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold font-sans cursor-pointer transition-standard border ";
                        
                        if (submitted) {
                          dotStyle += correct ? "bg-[#f3edfa] border-purple-500 text-purple-700" : "bg-destructive/10 border-red-500 text-red-700";
                        } else if (isCurrent) {
                          dotStyle += "bg-primary border-[#5b21b6] text-primary-foreground shadow-sm";
                        } else if (isAnswered) {
                          dotStyle += "bg-[#e5ece9] border-[#5b21b6]/30 text-foreground";
                        } else {
                          dotStyle += "bg-white border-border text-muted-foreground";
                        }

                        return (
                          <button key={idx} onClick={() => setActiveQuestionIndex(idx)} className={dotStyle}>
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    {!submitted && unansweredCount > 0 && (
                      <div className="p-3 bg-[#f0e6ff] border border-[#d4c0f0] text-foreground rounded-[10px] text-[10px] font-sans leading-normal">
                        ⚠️ <strong>{unansweredCount} item{unansweredCount > 1 ? "s" : ""} left.</strong> Complete all responses.
                      </div>
                    )}
                    
                    {!submitted && unansweredCount === 0 && (
                      <button onClick={handleSubmitQuiz} className="w-full py-2 bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold rounded-[10px] transition-standard shadow-sm">
                        Submit Responses
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                /* REPORT SHEET */
                <div className="space-y-6">
                  <div className="bg-white border border-border rounded-[10px] p-8 shadow-sm text-center space-y-6">
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="w-14 h-14 rounded-full bg-[#f3edfa] border border-[#d2c0f0] text-primary flex items-center justify-center mx-auto mb-2">
                        <Award className="w-7 h-7" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground font-sans">Assessment Summary</h2>
                      <p className="text-sm text-muted-foreground font-sans italic">Results based on reference notes:</p>
                    </div>

                    <div className="max-w-xs mx-auto bg-background border border-border rounded-[10px] p-5 text-center space-y-1 shadow-sm">
                      <div className="text-4xl font-extrabold text-primary">
                        {quiz?.score}%
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                        Score
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-3.5">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${quiz?.score || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-center gap-3 pt-4 border-t border-[#f3eff8] max-w-md mx-auto">
                      <button onClick={handleRetake} className="px-4 py-2 border border-[#5b21b6] hover:bg-[#f1ecf8] text-primary font-semibold rounded-[10px] text-xs transition-standard flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
                      </button>
                      <button onClick={() => setActiveView("interactive")} className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-[10px] text-xs transition-standard shadow-sm">
                        Inspect Citations
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-border rounded-[10px] overflow-hidden divide-y divide-[#e0d4f0] shadow-sm">
                    {questions.map((q, qidx) => {
                      const passed = answers[qidx] === q.correct_index;
                      return (
                        <div key={qidx} className="p-6 space-y-4 hover:bg-background relative group">
                          <div className="flex items-center justify-between flex-shrink-0 mb-6">
                            <span className="bg-muted text-foreground text-[10px] px-2 py-0.5 rounded-[10px] font-mono font-bold">QUESTION {qidx + 1}</span>
                            <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${passed ? "text-purple-700 bg-purple-50 border border-purple-150" : "text-red-700 bg-destructive/10 border border-red-150"}`}>
                              {passed ? "✓ Correct" : "✗ Incorrect"}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-foreground font-sans pr-16">{q.question}</h3>

                          {q.options && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                              {q.options.map((opt, oidx) => {
                                const selectedByUs = answers[qidx] === oidx;
                                const correctOne = q.correct_index === oidx;
                                let style = "text-xs p-2.5 border rounded-[10px] flex items-center gap-2 font-sans ";
                                if (correctOne) style += "border-purple-300 bg-purple-50/65 text-purple-800 font-semibold";
                                else if (selectedByUs) style += "border-red-300 bg-destructive/10/65 text-red-800 font-semibold";
                                else style += "border-border text-muted-foreground opacity-60";

                                return (
                                  <div key={oidx} className={style}>
                                    <span className="font-semibold">{String.fromCharCode(65 + oidx)}.</span>
                                    <span>{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="space-y-2.5">
                            {q.explanation && (
                              <div className="bg-[#f5f0fa] border border-border rounded-[10px] p-4 text-xs text-muted-foreground font-sans leading-relaxed">
                                <strong className="text-primary font-sans block mb-1 uppercase tracking-wider text-[10px]">Concept Explanation:</strong>
                                {q.explanation}
                              </div>
                            )}
                            {q.citation && (
                              <div className="bg-[#f0e8fa] border-l-2 border-[#5b21b6] p-3.5 text-xs text-muted-foreground font-sans italic rounded-r-[4px]">
                                <strong className="text-[10px] font-bold text-primary font-sans block not-italic uppercase mb-0.5">Supporting Citation:</strong>
                                "{q.citation}"
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Quiz Modal */}
      {isNewQuizModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[12px] border border-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Generate New Quiz
              </h2>
              <button
                onClick={() => setIsNewQuizModalOpen(false)}
                className="p-1 hover:bg-accent rounded-full text-muted-foreground transition-standard cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-1 bg-muted/60 p-1 rounded-[10px]">
              <button
                onClick={() => setModalTab("text")}
                className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-[10px] transition-standard ${
                  modalTab === "text" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Write / Paste Text
              </button>
              <button
                onClick={() => setModalTab("upload")}
                className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-[10px] transition-standard ${
                  modalTab === "upload" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Upload File
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-red-700 text-xs rounded-[10px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {modalTab === "text" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Quiz Title *</label>
                  <input
                    type="text"
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="e.g. Photosynthesis Chapter 4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Format</label>
                    <select
                      value={newQuizType}
                      onChange={(e) => setNewQuizType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    >
                      <option value="mcq">MCQ (4 choices)</option>
                      <option value="tf">True / False</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Questions</label>
                    <select
                      value={newQuizCount}
                      onChange={(e) => setNewQuizCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    >
                      <option value={3}>3 Items</option>
                      <option value={5}>5 Items</option>
                      <option value={10}>10 Items</option>
                      <option value={15}>15 Items</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Study Notes / Content *</label>
                  <textarea
                    value={newQuizContent}
                    onChange={(e) => setNewQuizContent(e.target.value)}
                    className="w-full h-44 px-3 py-2 bg-white border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none text-foreground font-sans leading-relaxed"
                    placeholder="Paste details or notes to generate quiz from..."
                  />
                </div>
              </div>
            )}

            {modalTab === "upload" && (
              <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[10px] bg-white transition-standard hover:bg-background/50 text-center p-6 relative">
                {fileLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-xs font-sans text-muted-foreground italic animate-pulse">Parsing document text...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-xs font-bold text-foreground">Select study document</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-sans max-w-xs leading-normal">
                      Drag and drop your file here, or click to browse. Supports <strong className="text-primary">PDF, TXT, and Markdown (.md)</strong>.
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.txt,.md"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-4">
              <button
                onClick={() => setIsNewQuizModalOpen(false)}
                className="px-4 py-2 border border-border hover:bg-[#f1ecf8] text-foreground font-semibold rounded-[10px] text-xs transition-standard"
              >
                Cancel
              </button>
              
              <button
                onClick={handleGenerateQuiz}
                disabled={modalTab !== "text" || !newQuizTitle.trim() || !newQuizContent.trim()}
                className="px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold rounded-[10px] text-xs transition-standard shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Generate Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
