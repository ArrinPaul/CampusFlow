import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const authStudent = getAuthenticatedStudent(req);

    if (authStudent.id === "00000000-0000-0000-0000-000000000000") {
      return NextResponse.json({ student: authStudent });
    }

    const { data: student, error } = await getClient()
      .from("students")
      .select("id, name, email, branch, year, telegram_username, subjects, created_at")
      .eq("id", authStudent.id)
      .single();

    if (error || !student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authStudent = getAuthenticatedStudent(req);
    const { name, branch, year, telegram_username, subjects } = await req.json();

    const { data: student, error } = await getClient()
      .from("students")
      .update({ name, branch, year, telegram_username, subjects })
      .eq("id", authStudent.id)
      .select("id, name, email, branch, year, telegram_username, subjects, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ student });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
