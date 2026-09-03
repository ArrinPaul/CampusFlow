import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { triggerN8nDeadline } from "@/lib/server/n8n";
import { getValidAccessToken, createCalendarEvent } from "@/lib/server/google";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);

    const { data: tasks, error } = await getClient()
      .from("tasks")
      .select("*")
      .eq("student_id", student.id)
      .order("deadline", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ tasks });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const { title, subject, description, deadline, reminder_time, add_to_calendar } = await req.json();

    if (!title || !subject || !deadline) {
      return NextResponse.json({ message: "Title, subject, and deadline are required" }, { status: 400 });
    }

    const reminder = reminder_time || new Date(new Date(deadline).getTime() - 86400000).toISOString();

    const { data: task, error } = await getClient()
      .from("tasks")
      .insert({
        student_id: student.id,
        title,
        subject,
        description,
        deadline,
        reminder_time: reminder,
        add_to_calendar: add_to_calendar !== false,
      })
      .select()
      .single();

    if (error) throw error;

    const { data: studentRow } = await getClient()
      .from("students")
      .select("name, telegram_username")
      .eq("id", student.id)
      .single();

    if (add_to_calendar !== false) {
      const accessToken = await getValidAccessToken(student.id);
      if (accessToken) {
        try {
          const deadlineDate = new Date(deadline);
          await createCalendarEvent(accessToken, {
            summary: `[CampusFlow] ${title}`,
            description: `Subject: ${subject}${description ? `\n${description}` : ""}`,
            start: { dateTime: deadlineDate.toISOString() },
            end: { dateTime: new Date(deadlineDate.getTime() + 3600000).toISOString() },
            reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 60 }] },
          });
        } catch (calErr) {
          console.error("Failed to create calendar event:", calErr instanceof Error ? calErr.message : calErr);
        }
      }

      await triggerN8nDeadline({
        studentName: studentRow?.name,
        telegramUsername: studentRow?.telegram_username,
        subject,
        deadline,
        taskTitle: title,
      });

      await getClient().from("automation_logs").insert({
        student_id: student.id,
        workflow_type: "deadline_reminder",
        status: "triggered",
        details: { task_id: task.id, title },
      });
    }

    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
