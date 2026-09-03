const express = require("express");
const { getClient } = require("../services/supabase");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// --- Flashcard Decks & Cards ---

// Get all decks
router.get("/decks", async (req, res) => {
  try {
    const { data: decks, error } = await getClient()
      .from("flashcard_decks")
      .select("*, flashcards(*)")
      .eq("student_id", req.student.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ decks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save a new deck with flashcards
router.post("/decks", async (req, res) => {
  try {
    const { title, flashcards } = req.body;
    if (!title || !flashcards || !Array.isArray(flashcards)) {
      return res.status(400).json({ message: "Deck title and flashcards array are required" });
    }

    const supabase = getClient();
    
    // 1. Create Deck
    const { data: deck, error: deckError } = await supabase
      .from("flashcard_decks")
      .insert({ student_id: req.student.id, title })
      .select()
      .single();

    if (deckError) throw deckError;

    // 2. Create Flashcards
    const cardsToInsert = flashcards.map(card => ({
      deck_id: deck.id,
      front: card.front,
      back: card.back,
      citation: card.citation || null,
      status: card.status || 'unseen'
    }));

    const { data: savedCards, error: cardsError } = await supabase
      .from("flashcards")
      .insert(cardsToInsert)
      .select();

    if (cardsError) throw cardsError;

    res.status(201).json({ deck, flashcards: savedCards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update flashcard status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unseen', 'review', 'mastered'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const { data: card, error } = await getClient()
      .from("flashcards")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ card });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
