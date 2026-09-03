import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: tasks, error } = await getClient()
      .from("tasks")
      .select("*")
      .eq("student_id", student.id)
      .gte("deadline", today.toISOString())
      .lt("deadline", tomorrow.toISOString())
      .order("deadline", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ tasks });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
