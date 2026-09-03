import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { generateFlashcards } from "@/lib/server/groq";

export async function POST(req: NextRequest) {
  try {
    getAuthenticatedStudent(req);
    const { notes } = await req.json();
    if (!notes) {
      return NextResponse.json({ message: "Notes content is required" }, { status: 400 });
    }
    const flashcards = await generateFlashcards(notes);
    return NextResponse.json({ flashcards });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error, 500);
  }
}
