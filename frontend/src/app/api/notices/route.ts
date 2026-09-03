import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { summarizeNotice } from "@/lib/server/groq";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);

    const { data: notices, error } = await getClient()
      .from("notices")
      .select("*")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ notices });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const { notice_text, event_title, event_date } = await req.json();

    if (!notice_text) {
      return NextResponse.json({ message: "Notice text is required" }, { status: 400 });
    }

    const ai_summary = await summarizeNotice(notice_text);

    const { data: notice, error } = await getClient()
      .from("notices")
      .insert({
        student_id: student.id,
        notice_text,
        ai_summary,
        event_title,
        event_date,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ notice });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
