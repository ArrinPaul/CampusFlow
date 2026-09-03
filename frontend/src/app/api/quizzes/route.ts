import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);

    const { data: quizzes, error } = await getClient()
      .from("quizzes")
      .select("*")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ quizzes });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const { title, questions } = await req.json();
    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ message: "Title and questions array are required" }, { status: 400 });
    }

    const supabase = getClient();

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        student_id: student.id,
        title,
        total_questions: questions.length,
      })
      .select()
      .single();

    if (quizError) throw quizError;

    const questionsToInsert = questions.map((q: { question: string; options: string[]; correctIndex: number; explanation: string }) => ({
      quiz_id: quiz.id,
      question: q.question,
      options: q.options,
      correct_index: q.correctIndex,
      explanation: q.explanation,
    }));

    const { data: savedQuestions, error: qError } = await supabase
      .from("quiz_questions")
      .insert(questionsToInsert)
      .select();

    if (qError) {
      await supabase.from("quizzes").delete().eq("id", quiz.id);
      throw qError;
    }

    return NextResponse.json({ quiz, questions: savedQuestions }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
