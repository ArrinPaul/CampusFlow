import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);

    const { data: memberships, error } = await getClient()
      .from("group_members")
      .select("group_id, telegram_groups(id, name, telegram_chat_id, created_at)")
      .eq("student_id", student.id);

    if (error) throw error;

    const groups = (memberships || []).map((m) => m.telegram_groups);
    return NextResponse.json({ groups });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
