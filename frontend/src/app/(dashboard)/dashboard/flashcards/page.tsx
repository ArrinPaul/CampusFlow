"use client";

import { useState, useEffect } from "react";
import { 
  Layers, 
  BookOpen, 
  Trash2, 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  CheckCircle, 
  XCircle, 
  Bookmark, 
  HelpCircle,
  Sparkles,
  RefreshCw,
  Plus,
  FileText,
  Edit2,
  Copy,
  Check,
  Grid,
  List,
  ChevronRight,
  Info,
  Pin,
  Save,
  CheckSquare,
  Upload,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  citation?: string;
  status?: "mastered" | "review" | "unseen";
}

interface Deck {
  id: string;
  title: string;
  created_at: string;
  flashcards: Flashcard[];
}

export default function FlashcardsPage() {
  // Deck State
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  // Modal State for New Deck
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalTab, setModalTab] = useState<"text" | "upload">("text");
  
  // File Upload Status
  const [fileLoading, setFileLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  
  // Workspace Views: "carousel" | "grid" | "list"
  const [activeView, setActiveView] = useState<"carousel" | "grid" | "list">("carousel");
  
  // Flashcard Grid Individual Flip States
  const [gridFlippedState, setGridFlippedState] = useState<Record<number, boolean>>({});

  // Inline Flashcard Editing States
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editCardFront, setEditCardFront] = useState("");
  const [editCardBack, setEditCardBack] = useState("");
  const [editCardCitation, setEditCardCitation] = useState("");

  // Manual Card Addition Inputs
  const [showAddCardInline, setShowAddCardInline] = useState(false);
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");
  const [newCardCitation, setNewCardCitation] = useState("");

  // Copy Feedback State
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Fetch decks from backend
  useEffect(() => {
    async function fetchDecks() {
      try {
        const res = await api.get<{ decks: Deck[] }>("/api/flashcards/decks");
        if (res.decks && res.decks.length > 0) {
          setDecks(res.decks);
          // Auto-select first deck if none selected
          if (!selectedDeckId) {
            setSelectedDeckId(res.decks[0].id);
            setFlashcards(res.decks[0].flashcards || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch decks:", err);
      }
    }
    fetchDecks();
  }, [selectedDeckId]);

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

  // Document Upload File Handler
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
        // Text / Markdown files
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

      // Populate form and switch tab
      setModalTitle(file.name.replace(/\.[^/.]+$/, ""));
      setModalContent(extractedText);
      setModalTab("text"); // Switch back to text view to review/edit
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error reading uploaded file.");
    } finally {
      setFileLoading(false);
      // Clear file input value to allow uploading same file again if edited
      e.target.value = "";
    }
  };


  // Generate New Deck
  const handleGenerate = async () => {
    if (!modalTitle.trim() || !modalContent.trim()) {
      alert("Please provide both a title and notes text content.");
      return;
    }

    setError("");
    setLoading(true);
    setIsFlipped(false);
    setShowSummary(false);
    setFlashcards([]);
    setGridFlippedState({});
    setEditingCardId(null);
    setIsDeckModalOpen(false);

    try {
      // 1. Generate flashcards using AI
      const aiRes = await api.post<{ flashcards: Flashcard[] }>("/api/ai/flashcards", { 
        notes: modalContent.trim()
      });
      
      if (!aiRes.flashcards || aiRes.flashcards.length === 0) {
        throw new Error("AI did not generate any flashcards. Try pasting longer text.");
      }

      const generatedCards = aiRes.flashcards.map(c => ({
        front: c.front,
        back: c.back,
        citation: c.citation || "Derived from source reference.",
        status: "unseen" as const
      }));

      // 2. Save deck to database
      const saveRes = await api.post<{ deck: any, flashcards: Flashcard[] }>("/api/flashcards/decks", {
        title: modalTitle.trim(),
        flashcards: generatedCards
      });

      const newDeck: Deck = {
        ...saveRes.deck,
        flashcards: saveRes.flashcards
      };

      // 3. Update local state
      setDecks(prev => [newDeck, ...prev]);
      setSelectedDeckId(newDeck.id);
      setFlashcards(newDeck.flashcards);
      setCurrentIndex(0);
      
      setModalTitle("");
      setModalContent("");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate flashcards");
    } finally {
      setLoading(false);
    }
  };

  // Add custom manual card
  const handleAddManualCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) {
      alert("Please provide both front and back values.");
      return;
    }

    const newCard: Flashcard = {
      id: flashcards.length,
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      citation: newCardCitation.trim() || "Manually added concept.",
      status: "unseen" as const
    };

    setFlashcards(prev => [...prev, newCard]);
    setNewCardFront("");
    setNewCardBack("");
    setNewCardCitation("");
    setShowAddCardInline(false);
    
    setCurrentIndex(flashcards.length);
    setIsFlipped(false);
  };

  // Edit card inline
  const handleStartEditCard = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCardId(card.id);
    setEditCardFront(card.front);
    setEditCardBack(card.back);
    setEditCardCitation(card.citation || "");
  };

  const handleSaveCardEdit = () => {
    if (!editCardFront.trim() || !editCardBack.trim()) {
      alert("Question prompt and answer content cannot be empty.");
      return;
    }

    setFlashcards(prev => 
      prev.map(c => 
        c.id === editingCardId 
          ? { ...c, front: editCardFront.trim(), back: editCardBack.trim(), citation: editCardCitation.trim() } 
          : c
      )
    );
    setEditingCardId(null);
  };

  // Delete specific card
  const handleDeleteCard = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this flashcard?")) return;
    
    const updated = flashcards.filter(c => c.id !== id).map((c, index) => ({
      ...c,
      id: index
    }));
    setFlashcards(updated);
    
    if (currentIndex >= updated.length && updated.length > 0) {
      setCurrentIndex(updated.length - 1);
    }
    setIsFlipped(false);
  };

  // Mark mastery status
  const handleSetStatus = async (status: "mastered" | "review") => {
    if (flashcards.length === 0) return;
    
    const cardId = flashcards[currentIndex].id;

    // Optimistic update
    setFlashcards((prev) => 
      prev.map((c, index) => index === currentIndex ? { ...c, status } : c)
    );
    
    // API call
    try {
      await api.patch(`/api/flashcards/${cardId}/status`, { status });
      // Update the deck state as well to maintain consistency
      setDecks(prev => prev.map(d => {
        if (d.id === selectedDeckId) {
          return {
            ...d,
            flashcards: d.flashcards.map(c => c.id === cardId ? { ...c, status } : c)
          };
        }
        return d;
      }));
    } catch (err) {
      console.error("Failed to update status", err);
    }

    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      }, 250);
    } else {
      setTimeout(() => {
        setShowSummary(true);
      }, 400);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setFlashcards((prev) => prev.map(c => ({ ...c, status: "unseen" })));
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
  };

  const handleRestudyReviews = () => {
    const reviewsOnly = flashcards.filter(c => c.status === "review").map((c, index) => ({
      ...c,
      id: index,
      status: "unseen" as const
    }));
    setFlashcards(reviewsOnly);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
  };

  const handleClearDeck = () => {
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
    setError("");
  };

  const handleCopyCard = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const card = flashcards[index];
    navigator.clipboard.writeText(`Q: ${card.front}\nA: ${card.back}`);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    const text = flashcards.map((c, idx) => `Card ${idx + 1}\nQuestion: ${c.front}\nAnswer: ${c.back}\n`).join("\n---\n\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Keyboard navigation for Study Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") {
        return;
      }

      if (flashcards.length === 0 || showSummary || activeView !== "carousel" || editingCardId !== null) return;

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "1") {
        handleSetStatus("review");
      } else if (e.key === "2") {
        handleSetStatus("mastered");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flashcards, currentIndex, showSummary, activeView, editingCardId]);

  // Compute Metrics
  const masteredCount = flashcards.filter((c) => c.status === "mastered").length;
  const reviewCount = flashcards.filter((c) => c.status === "review").length;
  const unseenCount = flashcards.filter((c) => c.status === "unseen").length;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Flashcards
        </h1>

        {/* Global actions */}
        {flashcards.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCardInline(!showAddCardInline)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-[10px] hover:opacity-90 transition-standard cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Custom Card
            </button>
            <button
              onClick={handleClearDeck}
              className="px-4 py-2 border border-border hover:bg-accent text-sm font-medium rounded-[10px] text-foreground transition-standard cursor-pointer"
            >
              Clear Deck
            </button>
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent text-sm font-medium rounded-[10px] text-foreground transition-standard cursor-pointer"
            >
              {copiedAll ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              {copiedAll ? "Copied All!" : "Copy Deck"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-[10px] text-sm text-red-700 animate-in fade-in duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 block flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 overflow-y-auto pb-6 pr-1">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-[10px] p-5 space-y-4 shadow-sm">
            
            {/* Sidebar Title */}
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Your Decks ({decks.length})
              </h4>
              <button 
                onClick={() => {
                  setModalTitle("");
                  setModalContent("");
                  setModalTab("text");
                  setUploadError("");
                  setIsDeckModalOpen(true);
                }}
                className="text-[10px] font-semibold text-primary hover:text-foreground flex items-center gap-1 transition-standard cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                New Deck
              </button>
            </div>

            {/* Decks List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {decks.length === 0 ? (
                <div className="border border-dashed border-border rounded-[10px] p-6 text-center text-xs text-muted-foreground font-sans italic">
                  No decks found. Create your first flashcard deck!
                </div>
              ) : (
                decks.map((deck) => {
                  const isSelected = selectedDeckId === deck.id;
                  return (
                    <div 
                      key={deck.id}
                      onClick={() => {
                        setSelectedDeckId(deck.id);
                        setFlashcards(deck.flashcards || []);
                        setCurrentIndex(0);
                        setIsFlipped(false);
                        setShowSummary(false);
                      }}
                      className={`group border rounded-[10px] p-3 transition-standard cursor-pointer flex flex-col gap-1.5 relative ${
                        isSelected 
                          ? "bg-white border-primary/40 shadow-sm" 
                          : "bg-transparent border-border hover:bg-muted/45"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <BookOpen className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <h4 className="font-semibold text-xs text-foreground truncate pr-6">
                          {deck.title}
                        </h4>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono pl-5">
                        {deck.flashcards?.length || 0} cards
                      </p>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Right Side Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Inline Add Card */}
          {showAddCardInline && (
            <div className="bg-background border border-border rounded-[10px] p-5 space-y-3.5 shadow-sm">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Plus className="w-4 h-4 text-primary" />
                  Create Manual Flashcard
                </h4>
                <button
                  onClick={() => setShowAddCardInline(false)}
                  className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer"
                >
                  <XCircle className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                    Front / Prompt *
                  </label>
                  <input
                    type="text"
                    value={newCardFront}
                    onChange={(e) => setNewCardFront(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-sans"
                    placeholder="e.g. What is Active Recall?"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                    Back / Answer Explanation *
                  </label>
                  <textarea
                    value={newCardBack}
                    onChange={(e) => setNewCardBack(e.target.value)}
                    className="w-full h-16 px-3 py-2 bg-white border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none font-sans"
                    placeholder="e.g. Active retrieval testing."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Source Reference Citation
                </label>
                <input
                  type="text"
                  value={newCardCitation}
                  onChange={(e) => setNewCardCitation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-sans"
                  placeholder="e.g. Page 45"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddCardInline(false)}
                  className="px-4 py-1.5 border border-border hover:bg-[#f1ecf8] text-xs font-semibold rounded-[10px] transition-standard cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddManualCard}
                  className="px-4 py-1.5 bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold rounded-[10px] transition-standard cursor-pointer shadow-sm"
                >
                  Create Card
                </button>
              </div>
            </div>
          )}

          {/* Empty Desk */}
          {flashcards.length === 0 && !loading && (
            <div className="bg-white border border-border rounded-[10px] p-12 text-center shadow-sm">
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Notebook Study Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a deck on the left, or click <strong className="text-primary">"New Deck"</strong> to generate flashcards from your notes.
              </p>
              
              <div className="flex gap-3 mt-6 justify-center">
                <button
                  onClick={() => {
                    setModalTitle("");
                    setModalContent("");
                    setModalTab("upload"); // Open on Upload tab
                    setUploadError("");
                    setIsDeckModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-[10px] text-xs transition-standard cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document (PDF/Text)
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="h-[460px] border border-border rounded-[10px] bg-white flex flex-col items-center justify-center text-center p-8 shadow-sm">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-bold text-foreground font-sans">Deconstructing Materials</h3>
              <p className="text-sm text-muted-foreground max-w-xs font-sans italic mt-1.5 leading-relaxed">
                Reading documents, extracting concepts, and mapping citations...
              </p>
            </div>
          )}

          {/* Active Workspace */}
          {flashcards.length > 0 && !loading && (
            <div className="space-y-5">
              
              {/* Tab toggles */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border pb-2 gap-3">
                <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-[10px]">
                  <button
                    onClick={() => setActiveView("carousel")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] transition-standard cursor-pointer ${
                      activeView === "carousel" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Study Carousel
                  </button>
                  <button
                    onClick={() => setActiveView("grid")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] transition-standard cursor-pointer ${
                      activeView === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    Browse Grid ({flashcards.length})
                  </button>
                  <button
                    onClick={() => setActiveView("list")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] transition-standard cursor-pointer ${
                      activeView === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    Reference Sheet
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600" /> {masteredCount} Got It</span>
                  <span className="h-3 w-px bg-[#e0d4f0]" />
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> {reviewCount} Reviews</span>
                  <span className="h-3 w-px bg-[#e0d4f0]" />
                  <span className="font-semibold text-foreground">{Math.round(((masteredCount + reviewCount) / flashcards.length) * 100)}% Complete</span>
                </div>
              </div>

              {!showSummary ? (
                <>
                  {/* CAROUSEL */}
                  {activeView === "carousel" && (
                    <div className="space-y-6">
                      <div className="relative group">
                        {editingCardId === flashcards[currentIndex].id ? (
                          <div className="w-full h-80 rounded-[10px] border border-[#5b21b6] bg-white p-6 space-y-4 shadow-sm">
                            <h4 className="text-xs font-bold text-primary uppercase font-mono border-b border-[#f3eff8] pb-2">
                              Edit Flashcard #{currentIndex + 1}
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                                  Front Prompt
                                </label>
                                <input
                                  type="text"
                                  value={editCardFront}
                                  onChange={(e) => setEditCardFront(e.target.value)}
                                  className="w-full px-3 py-2 bg-background border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-sans"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                                  Back Answer
                                </label>
                                <textarea
                                  value={editCardBack}
                                  onChange={(e) => setEditCardBack(e.target.value)}
                                  className="w-full h-16 px-3 py-2 bg-background border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none font-sans leading-relaxed"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                                Citation
                              </label>
                              <input
                                type="text"
                                value={editCardCitation}
                                onChange={(e) => setEditCardCitation(e.target.value)}
                                className="w-full px-3 py-1.5 bg-background border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-sans"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-1 border-t border-[#f3eff8]">
                              <button
                                onClick={() => setEditingCardId(null)}
                                className="px-3.5 py-1.5 border border-border text-foreground rounded-[10px] text-xs font-semibold hover:bg-card transition-standard"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveCardEdit}
                                className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-[10px] text-xs font-semibold hover:opacity-90 transition-standard shadow-sm"
                              >
                                Save Card
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="w-full h-80 [perspective:1000px] cursor-pointer relative"
                          >
                            <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                              isFlipped ? '[transform:rotateY(180deg)]' : ''
                            }`}>
                              
                              <div className="absolute inset-0 w-full h-full rounded-[10px] border border-border bg-white p-8 flex flex-col justify-between shadow-sm [backface-visibility:hidden]">
                                <div className="flex items-center justify-between border-b border-[#f3eff8] pb-3">
                                  <span className="text-[10px] font-bold text-primary tracking-wider uppercase flex items-center gap-1">
                                    <Bookmark className="w-3.5 h-3.5 text-primary" />
                                    Concept Prompt
                                  </span>
                                  
                                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={(e) => handleStartEditCard(flashcards[currentIndex], e)}
                                      className="p-1 text-muted-foreground hover:text-primary hover:bg-card rounded-[10px] transition-standard cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteCard(flashcards[currentIndex].id, e)}
                                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[10px] transition-standard cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-xs text-muted-foreground font-mono ml-2">
                                      CARD {currentIndex + 1} OF {flashcards.length}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex-grow flex items-center justify-center py-4">
                                  <h2 className="text-xl md:text-2xl font-sans font-bold text-foreground text-center leading-relaxed max-w-xl">
                                    {flashcards[currentIndex].front}
                                  </h2>
                                </div>
                                
                                <div className="text-center text-xs text-muted-foreground font-sans italic border-t border-[#f3eff8] pt-3 flex items-center justify-center gap-1.5">
                                  <RotateCw className="w-3.5 h-3.5 text-primary" /> Click to reveal answer
                                </div>
                              </div>

                              <div className="absolute inset-0 w-full h-full rounded-[10px] border border-[#5b21b6]/30 bg-[#f5f0fa] p-8 flex flex-col justify-between shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                <div className="flex items-center justify-between border-b border-[#e0daf0] pb-3">
                                  <span className="text-[10px] font-bold text-primary tracking-wider uppercase flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                                    AI Answer Verification
                                  </span>
                                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-[10px] uppercase">
                                    Revealed
                                  </span>
                                </div>
                                
                                <div className="flex-grow flex flex-col justify-center py-4 space-y-3.5 overflow-y-auto max-h-48 scrollbar-thin">
                                  <p className="text-base text-foreground text-center font-sans leading-relaxed max-w-xl whitespace-pre-wrap mx-auto">
                                    {flashcards[currentIndex].back}
                                  </p>
                                  
                                  {flashcards[currentIndex].citation && (
                                    <div className="text-left bg-[#f0e8fa] border-l-2 border-[#5b21b6] px-3.5 py-2 text-xs text-muted-foreground font-sans italic max-w-lg mx-auto rounded-[4px]">
                                      <strong className="text-[10px] font-bold text-primary font-sans block not-italic uppercase mb-0.5">
                                        Source Citation Document:
                                      </strong>
                                      "{flashcards[currentIndex].citation}"
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between border-t border-[#e0daf0] pt-3">
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={(e) => handleCopyCard(currentIndex, e)}
                                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-standard cursor-pointer"
                                    >
                                      {copiedIndex === currentIndex ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
                                      <span>{copiedIndex === currentIndex ? "Copied!" : "Copy"}</span>
                                    </button>

                                  </div>
                                  
                                  <span className="text-[11px] text-muted-foreground italic font-sans">
                                    Click card to flip back
                                  </span>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="p-2.5 border border-border rounded-[10px] text-primary hover:bg-[#f1ecf8] disabled:opacity-40 disabled:hover:bg-transparent transition-standard"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="px-5 py-2.5 border border-[#5b21b6] hover:bg-[#f1ecf8] text-primary font-semibold rounded-[10px] text-xs transition-standard"
                          >
                            Flip Card (Space)
                          </button>

                          <button
                            onClick={handleNext}
                            disabled={currentIndex === flashcards.length - 1}
                            className="p-2.5 border border-border rounded-[10px] text-primary hover:bg-[#f1ecf8] disabled:opacity-40 disabled:hover:bg-transparent transition-standard"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleSetStatus("review")}
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#eedebb] bg-[#fdf9f2] hover:bg-[#f5ebd7] text-foreground font-semibold rounded-[10px] text-xs transition-standard cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Still Learning (1)
                          </button>
                          
                          <button
                            onClick={() => handleSetStatus("mastered")}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-[10px] text-xs transition-standard cursor-pointer shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Got It! (2)
                          </button>
                        </div>
                      </div>

                      <div className="bg-card border border-border rounded-[10px] px-4 py-2.5 flex items-center justify-between text-[11px] text-muted-foreground font-sans">
                        <div className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-primary" />
                          <span>Keyboard controls active.</span>
                        </div>
                        <div className="flex items-center gap-4 font-sans text-[10px] tracking-wider uppercase font-semibold">
                          <span>Space: Flip</span>
                          <span>← / →: Navigate</span>
                          <span>1: Learn</span>
                          <span>2: Got It</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GRID */}
                  {activeView === "grid" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {flashcards.map((card, idx) => {
                        const isCardFlipped = gridFlippedState[idx] || false;
                        const cardStatus = card.status || "unseen";
                        
                        let statusColor = "bg-muted text-muted-foreground";
                        if (cardStatus === "mastered") statusColor = "bg-purple-100 text-purple-800";
                        if (cardStatus === "review") statusColor = "bg-amber-100 text-amber-800";

                        return (
                          <div 
                            key={idx}
                            onClick={() => setGridFlippedState(prev => ({ ...prev, [idx]: !isCardFlipped }))}
                            className="h-48 [perspective:1000px] cursor-pointer relative"
                          >
                            <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                              isCardFlipped ? '[transform:rotateY(180deg)]' : ''
                            }`}>
                              
                              <div className="absolute inset-0 w-full h-full rounded-[10px] border border-border bg-white p-5 flex flex-col justify-between shadow-sm [backface-visibility:hidden]">
                                <div className="flex justify-between items-center border-b border-[#f3eff8] pb-2" onClick={(e) => e.stopPropagation()}>
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    CARD {idx + 1}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => handleStartEditCard(card, e)}
                                      className="p-1 text-muted-foreground hover:text-primary hover:bg-card rounded"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteCard(card.id, e)}
                                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-grow flex items-center justify-center py-2">
                                  <h4 className="text-sm font-bold text-foreground text-center font-sans leading-snug line-clamp-3">
                                    {card.front}
                                  </h4>
                                </div>
                                <div className="flex items-center justify-between pt-1.5 border-t border-[#f3eff8]">
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${statusColor}`}>
                                    {cardStatus}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground italic font-sans flex items-center gap-1">
                                    <RotateCw className="w-3 h-3 text-primary" /> Flip
                                  </span>
                                </div>
                              </div>

                              <div className="absolute inset-0 w-full h-full rounded-[10px] border border-[#5b21b6]/20 bg-[#fbfbfa] p-5 flex flex-col justify-between shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                <div className="flex justify-between items-center border-b border-[#e0daf0] pb-2" onClick={(e) => e.stopPropagation()}>
                                  <span className="text-[10px] font-bold text-primary uppercase">
                                    Answer Description
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => handleCopyCard(idx, e)}
                                      className="p-1 text-muted-foreground hover:text-primary rounded"
                                    >
                                      {copiedIndex === idx ? <Check className="w-3 h-3 text-purple-700" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-grow flex items-center justify-center py-2 overflow-y-auto max-h-24 scrollbar-thin">
                                  <p className="text-xs text-foreground font-sans leading-relaxed text-center">
                                    {card.back}
                                  </p>
                                </div>
                                <div className="text-center text-[10px] text-muted-foreground italic font-sans pt-1.5 border-t border-[#e0daf0]">
                                  Click to flip back
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* LIST */}
                  {activeView === "list" && (
                    <div className="bg-white border border-border rounded-[10px] overflow-hidden divide-y divide-[#e0d4f0] shadow-sm">
                      {flashcards.map((card, idx) => (
                        <div key={idx} className="p-5 hover:bg-background transition-standard space-y-2.5 relative group">
                          <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-standard">
                            <button
                              onClick={(e) => handleStartEditCard(card, e)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-card rounded-[10px] transition-standard cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleCopyCard(idx, e)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-card rounded-[10px] transition-standard cursor-pointer"
                            >
                              {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={(e) => handleDeleteCard(card.id, e)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[10px] transition-standard cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="bg-muted text-foreground text-[10px] px-2 py-0.5 rounded-[10px] font-mono font-bold">
                              CONCEPT {idx + 1}
                            </span>
                            {card.status && card.status !== "unseen" && (
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                card.status === "mastered" ? "bg-purple-50 text-purple-700" : "bg-amber-50 text-amber-700"
                              }`}>
                                {card.status}
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-bold text-foreground font-sans leading-snug pr-24">
                              Q: {card.front}
                            </h4>
                            <p className="text-xs text-foreground font-sans leading-relaxed pl-4 border-l border-border">
                              A: {card.back}
                            </p>
                            {card.citation && (
                              <p className="text-[10.5px] text-muted-foreground font-sans leading-relaxed pl-4 italic opacity-85">
                                Citation: "{card.citation}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setShowSummary(true)}
                      className="px-5 py-2.5 bg-muted hover:bg-accent text-foreground font-semibold rounded-[10px] text-xs transition-standard flex items-center gap-1.5 shadow-sm"
                    >
                      Finish Session & See Report
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* SUMMARY */
                <div className="bg-white border border-border rounded-[10px] p-8 shadow-sm text-center space-y-6">
                  <div className="max-w-md mx-auto space-y-2">
                    <div className="w-14 h-14 rounded-full bg-[#f3edfa] border border-[#d2c0f0] text-primary flex items-center justify-center mx-auto text-xl font-bold">
                      ✓
                    </div>
                    <h2 className="text-2xl font-bold text-foreground font-sans">Study Session Completed!</h2>
                    <p className="text-sm text-muted-foreground font-sans italic">
                      Here is your learning progress breakdown:
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
                    <div className="bg-[#f3edfa] border border-[#d2c0f0] rounded-[10px] p-4 text-center">
                      <div className="text-3xl font-extrabold text-primary">{masteredCount}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Mastered</div>
                    </div>
                    <div className="bg-[#fdf9f2] border border-[#eedebb] rounded-[10px] p-4 text-center">
                      <div className="text-3xl font-extrabold text-foreground">{reviewCount}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Review Needed</div>
                    </div>
                    <div className="bg-background border border-border rounded-[10px] p-4 text-center">
                      <div className="text-3xl font-extrabold text-muted-foreground">{unseenCount}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Unseen</div>
                    </div>
                  </div>

                  <div className="max-w-sm mx-auto space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                      <span>Mastery Progress</span>
                      <span>{Math.round((masteredCount / flashcards.length) * 100)}% Mastered</span>
                    </div>
                    <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden flex">
                      <div className="h-full bg-primary" style={{ width: `${(masteredCount / flashcards.length) * 100}%` }} />
                      <div className="h-full bg-[#c4a8f0]" style={{ width: `${(reviewCount / flashcards.length) * 100}%` }} />
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-6 border-t border-[#f3eff8] mt-6">
                    <button
                      onClick={handleRestart}
                      className="px-5 py-2.5 border border-[#5b21b6] hover:bg-[#f1ecf8] text-primary font-semibold rounded-[10px] text-xs transition-standard cursor-pointer"
                    >
                      Study Deck Again
                    </button>
                    {reviewCount > 0 && (
                      <button
                        onClick={handleRestudyReviews}
                        className="px-5 py-2.5 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-[10px] text-xs transition-standard shadow-sm"
                      >
                        Study Review Cards ({reviewCount})
                      </button>
                    )}
                    <button
                      onClick={handleClearDeck}
                      className="px-5 py-2.5 bg-muted hover:bg-accent text-foreground font-semibold rounded-[10px] text-xs transition-standard cursor-pointer"
                    >
                      Select New Sources
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* New Deck Modal */}
      {isDeckModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[12px] border border-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                New Deck
              </h2>
              <button
                onClick={() => {
                  setIsDeckModalOpen(false);
                  setModalTitle("");
                  setModalContent("");
                }}
                className="p-1 hover:bg-accent rounded-full text-muted-foreground transition-standard cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs for Manual Input vs Upload File */}
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
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-red-700 text-xs rounded-[10px] flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* TAB A: Text editor */}
            {modalTab === "text" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Deck Title *
                  </label>
                  <input
                    type="text"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="e.g. Photosynthesis Notes"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Source Content *
                  </label>
                  <textarea
                    value={modalContent}
                    onChange={(e) => setModalContent(e.target.value)}
                    className="w-full h-44 px-3 py-2 bg-white border border-border rounded-[10px] text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none text-foreground font-sans leading-relaxed"
                    placeholder="Paste details or notes here..."
                  />
                </div>
              </div>
            )}

            {/* TAB B: File Upload */}
            {modalTab === "upload" && (
              <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[10px] bg-white transition-standard hover:bg-background/50 text-center p-6 relative">
                {fileLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-xs font-sans text-muted-foreground italic animate-pulse">
                      Parsing document text...
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-xs font-bold text-foreground">
                      Select study document
                    </p>
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => {
                  setIsDeckModalOpen(false);
                  setModalTitle("");
                  setModalContent("");
                }}
                className="px-4 py-2 border border-border hover:bg-[#f1ecf8] text-foreground font-semibold rounded-[10px] text-xs transition-standard"
              >
                Cancel
              </button>
              
              <button
                onClick={handleGenerate}
                disabled={loading || modalTab !== "text" || !modalTitle.trim() || !modalContent.trim()}
                className="px-4 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold rounded-[10px] text-xs transition-standard shadow-sm"
              >
                {loading ? "Generating..." : "Generate Flashcards"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
