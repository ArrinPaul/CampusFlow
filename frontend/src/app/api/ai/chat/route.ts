import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { chatResponse } from "@/lib/server/groq";

export async function POST(req: NextRequest) {
  try {
    getAuthenticatedStudent(req);
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ message: "Messages array is required" }, { status: 400 });
    }
    const reply = await chatResponse(messages);
    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
