import { NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { errorResponse } from "@/lib/server/auth";

interface Reminder {
  event_date: string;
  days_left: number;
  [key: string]: unknown;
}

// Called by the n8n reminders workflow every 30 minutes (no auth — internal automation endpoint).
// Returns all unsent reminders where the reminder should fire today or earlier.
export async function GET() {
  try {
    const supabase = getClient();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("sent", false)
      .order("event_date", { ascending: true });

    if (error) throw error;

    const dueReminders = ((reminders as Reminder[]) || []).filter((r) => {
      const eventDate = new Date(r.event_date);
      const reminderDate = new Date(eventDate);
      reminderDate.setDate(reminderDate.getDate() - r.days_left);
      const todayDate = new Date(today);
      return reminderDate <= todayDate;
    });

    return NextResponse.json(dueReminders);
  } catch (error) {
    console.error("Fetch due reminders error:", error instanceof Error ? error.message : error);
    return errorResponse(error);
  }
}
