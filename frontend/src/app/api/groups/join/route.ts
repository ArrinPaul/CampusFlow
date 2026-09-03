import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const { chat_id } = await req.json();

    if (!chat_id) {
      return NextResponse.json({ message: "chat_id is required" }, { status: 400 });
    }

    const supabase = getClient();

    const { data: group, error: groupError } = await supabase
      .from("telegram_groups")
      .select("id, name")
      .eq("telegram_chat_id", chat_id)
      .single();

    if (groupError || !group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", group.id)
      .eq("student_id", student.id)
      .single();

    if (existing) {
      return NextResponse.json({ message: "Already a member of this group", group_name: group.name });
    }

    const { error: insertError } = await supabase
      .from("group_members")
      .insert({
        group_id: group.id,
        student_id: student.id,
      });

    if (insertError) throw insertError;

    return NextResponse.json({ message: "Successfully joined group", group_name: group.name });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
