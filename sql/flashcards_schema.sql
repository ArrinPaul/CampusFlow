-- Flashcards Schema

-- 1. Flashcard Decks (Folders / Topics)
CREATE TABLE public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Flashcards
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  citation TEXT,
  status TEXT DEFAULT 'unseen' CHECK (status IN ('unseen', 'review', 'mastered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Client-side protection)
CREATE POLICY "Users can manage their own decks" ON public.flashcard_decks
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Users can manage their own cards" ON public.flashcards
  FOR ALL USING (
    deck_id IN (SELECT id FROM public.flashcard_decks WHERE student_id = auth.uid())
  );
