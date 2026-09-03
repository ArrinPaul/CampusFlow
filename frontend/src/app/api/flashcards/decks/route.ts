import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);

    const { data: decks, error } = await getClient()
      .from("flashcard_decks")
      .select("*, flashcards(*)")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ decks });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const { title, flashcards } = await req.json();
    if (!title || !flashcards || !Array.isArray(flashcards)) {
      return NextResponse.json({ message: "Deck title and flashcards array are required" }, { status: 400 });
    }

    const supabase = getClient();

    const { data: deck, error: deckError } = await supabase
      .from("flashcard_decks")
      .insert({ student_id: student.id, title })
      .select()
      .single();

    if (deckError) throw deckError;

    const cardsToInsert = flashcards.map((card: { front: string; back: string; citation?: string; status?: string }) => ({
      deck_id: deck.id,
      front: card.front,
      back: card.back,
      citation: card.citation || null,
      status: card.status || "unseen",
    }));

    const { data: savedCards, error: cardsError } = await supabase
      .from("flashcards")
      .insert(cardsToInsert)
      .select();

    if (cardsError) throw cardsError;

    return NextResponse.json({ deck, flashcards: savedCards }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
