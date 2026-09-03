import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { generateQuiz } from "@/lib/server/groq";

export async function POST(req: NextRequest) {
  try {
    getAuthenticatedStudent(req);
    const { notes, count, type } = await req.json();
    if (!notes) {
      return NextResponse.json({ message: "Notes content is required" }, { status: 400 });
    }
    const questions = await generateQuiz(notes, count, type || "mcq");
    return NextResponse.json({ questions });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error, 500);
  }
}
