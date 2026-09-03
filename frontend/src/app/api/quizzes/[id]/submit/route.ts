import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const student = getAuthenticatedStudent(req);
    const { id } = await params;
    const { score, answers } = await req.json();
    // answers: array of { question_id: UUID, user_answer_index: INT, is_correct: BOOLEAN }

    if (score === undefined || !Array.isArray(answers)) {
      return NextResponse.json({ message: "Score and answers array are required" }, { status: 400 });
    }

    const supabase = getClient();

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .update({ score })
      .eq("id", id)
      .eq("student_id", student.id)
      .select()
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ message: "Quiz not found or unauthorized" }, { status: 404 });
    }

    for (const ans of answers as { question_id: string; user_answer_index: number; is_correct: boolean }[]) {
      await supabase
        .from("quiz_questions")
        .update({
          user_answer_index: ans.user_answer_index,
          is_correct: ans.is_correct,
        })
        .eq("id", ans.question_id)
        .eq("quiz_id", id);
    }

    return NextResponse.json({ message: "Quiz submitted successfully", quiz });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
