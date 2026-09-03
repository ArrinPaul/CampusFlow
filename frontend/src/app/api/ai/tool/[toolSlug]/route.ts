import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { executeSmartTool } from "@/lib/server/groq";

export async function POST(req: NextRequest, { params }: { params: Promise<{ toolSlug: string }> }) {
  try {
    getAuthenticatedStudent(req);
    const { toolSlug } = await params;
    const { content, options } = await req.json();
    if (!content && toolSlug !== "study-schedule") {
      return NextResponse.json({ message: "Content input is required" }, { status: 400 });
    }
    const result = await executeSmartTool(toolSlug, content, options);
    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error, 500);
  }
}
