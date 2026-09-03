import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { triggerN8nNotice } from "@/lib/server/n8n";

export async function POST(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const { notice_id } = await req.json();

    const { data: notice, error: noticeError } = await getClient()
      .from("notices")
      .select("*")
      .eq("id", notice_id)
      .eq("student_id", student.id)
      .single();

    if (noticeError || !notice) {
      return NextResponse.json({ message: "Notice not found" }, { status: 404 });
    }

    const { data: studentRow } = await getClient()
      .from("students")
      .select("name, telegram_username")
      .eq("id", student.id)
      .single();

    const result = await triggerN8nNotice({
      studentName: studentRow?.name,
      telegramUsername: studentRow?.telegram_username,
      aiSummary: notice.ai_summary,
      eventTitle: notice.event_title,
      eventDate: notice.event_date,
    });

    await getClient()
      .from("notices")
      .update({ broadcast_status: result.success ? "sent" : "failed" })
      .eq("id", notice_id);

    await getClient().from("automation_logs").insert({
      student_id: student.id,
      workflow_type: "notice_broadcast",
      status: result.success ? "success" : "failed",
      details: { notice_id },
    });

    return NextResponse.json({ success: result.success });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
