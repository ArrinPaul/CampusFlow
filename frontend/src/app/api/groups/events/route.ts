import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const supabase = getClient();

    const { data: memberships, error: memError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("student_id", student.id);

    if (memError) throw memError;

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ events: [] });
    }

    const groupIds = memberships.map((m) => m.group_id);

    const { data: events, error: eventError } = await supabase
      .from("events")
      .select("*, telegram_groups(name)")
      .in("group_id", groupIds)
      .order("created_at", { ascending: false });

    if (eventError) throw eventError;

    return NextResponse.json({ events });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
