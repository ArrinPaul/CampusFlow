import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const student = getAuthenticatedStudent(req);
    const { id } = await params;
    const supabase = getClient();

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .eq("student_id", student.id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    const { data: questions, error: qError } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", id)
      .order("created_at", { ascending: true });

    if (qError) throw qError;

    return NextResponse.json({ quiz, questions });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const student = getAuthenticatedStudent(req);
    const { id } = await params;

    const { error } = await getClient()
      .from("quizzes")
      .delete()
      .eq("id", id)
      .eq("student_id", student.id);

    if (error) throw error;
    return NextResponse.json({ message: "Quiz deleted" });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
