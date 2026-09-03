import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { errorResponse } from "@/lib/server/auth";

// Called by the n8n reminders workflow after sending a Telegram message (no auth — internal automation endpoint).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { data: reminder, error } = await getClient()
      .from("reminders")
      .update({ sent: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!reminder) {
      return NextResponse.json({ message: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Reminder marked as sent", reminder });
  } catch (error) {
    console.error("Mark reminder sent error:", error instanceof Error ? error.message : error);
    return errorResponse(error);
  }
}
