import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { gradeShortAnswer } from "@/lib/server/groq";

export async function POST(req: NextRequest) {
  try {
    getAuthenticatedStudent(req);
    const { question, modelAnswer, userAnswer } = await req.json();
    if (!question || !modelAnswer || userAnswer === undefined) {
      return NextResponse.json({ message: "Question, modelAnswer, and userAnswer are required" }, { status: 400 });
    }
    const result = await gradeShortAnswer(question, modelAnswer, userAnswer);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error, 500);
  }
}
