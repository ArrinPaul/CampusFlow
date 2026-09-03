import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { attendanceAlert } from "@/lib/server/groq";

export async function POST(req: NextRequest) {
  try {
    getAuthenticatedStudent(req);
    const { subject, total, attended, threshold } = await req.json();

    if (!subject || total === undefined || attended === undefined) {
      return NextResponse.json({ message: "Subject, total, and attended are required" }, { status: 400 });
    }

    const result = await attendanceAlert(subject, total, attended, threshold);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
