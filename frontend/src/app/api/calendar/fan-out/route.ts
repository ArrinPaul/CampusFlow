import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getValidAccessToken, createCalendarEvent } from "@/lib/server/google";
import { errorResponse } from "@/lib/server/auth";

// Called by the n8n ingestion workflow after an event is saved (no auth — internal automation endpoint).
// Creates Google Calendar events for all group members who have calendar connected.
export async function POST(req: NextRequest) {
  try {
    const { event_id } = await req.json();

    if (!event_id) {
      return NextResponse.json({ message: "event_id is required" }, { status: 400 });
    }

    const supabase = getClient();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const { data: members, error: membersError } = await supabase
      .from("group_members")
      .select("student_id")
      .eq("group_id", event.group_id);

    if (membersError) throw membersError;

    if (!members || members.length === 0) {
      return NextResponse.json({
        message: "No group members found",
        synced: 0,
        failed: 0,
      });
    }

    let synced = 0;
    let failed = 0;

    for (const member of members) {
      try {
        const accessToken = await getValidAccessToken(member.student_id);
        if (!accessToken) {
          // Student doesn't have Google Calendar connected — skip
          continue;
        }

        const eventDate = new Date(event.event_date);
        await createCalendarEvent(accessToken, {
          summary: `[${event.category || "Deadline"}] ${event.title}`,
          description: `Priority: ${event.priority || "Medium"}\nCategory: ${event.category || "Other"}\n\nOriginal message: ${event.raw_message || "N/A"}\n\nSynced via CampusFlow NotifyMe`,
          start: {
            date: event.event_date, // All-day event (event_date is DATE, not DATETIME)
          },
          end: {
            date: new Date(eventDate.getTime() + 86400000).toISOString().split("T")[0],
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "popup", minutes: 1440 }, // 1 day before
              { method: "popup", minutes: 60 },   // 1 hour before
            ],
          },
        });

        synced++;
      } catch (calErr) {
        console.error(`Calendar sync failed for student ${member.student_id}:`, calErr instanceof Error ? calErr.message : calErr);
        failed++;
      }
    }

    await supabase.from("automation_logs").insert({
      student_id: members[0].student_id, // Log under first member for visibility
      workflow_type: "deadline_reminder",
      status: failed === 0 ? "success" : "triggered",
      details: {
        event_id,
        event_title: event.title,
        total_members: members.length,
        synced,
        failed,
      },
    });

    return NextResponse.json({
      message: "Calendar fan-out complete",
      synced,
      failed,
      total_members: members.length,
    });
  } catch (error) {
    console.error("Calendar fan-out error:", error instanceof Error ? error.message : error);
    return errorResponse(error);
  }
}
