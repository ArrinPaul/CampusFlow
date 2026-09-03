import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);

    const { data: logs, error } = await getClient()
      .from("automation_logs")
      .select("*")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ logs });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
