import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { extractGroupEvent } from "@/lib/server/groq";
import { errorResponse } from "@/lib/server/auth";

// n8n webhook for processing Telegram messages (no auth — internal automation endpoint).
export async function POST(req: NextRequest) {
  try {
    const { chat_id, text } = await req.json();

    if (!chat_id || !text) {
      return NextResponse.json({ message: "chat_id and text are required" }, { status: 400 });
    }

    const supabase = getClient();

    const { data: group, error: groupError } = await supabase
      .from("telegram_groups")
      .select("id")
      .eq("telegram_chat_id", chat_id)
      .single();

    if (groupError || !group) {
      return NextResponse.json({ message: "Group not found for chat_id" }, { status: 404 });
    }

    const extractedData = await extractGroupEvent(text);

    if (!extractedData) {
      return NextResponse.json({ message: "Ignored: No academic event extracted." });
    }

    const { data: event, error: insertError } = await supabase
      .from("events")
      .insert({
        group_id: group.id,
        title: extractedData.title,
        event_date: extractedData.event_date,
        priority: extractedData.priority || "Medium",
        category: extractedData.category || "Other",
        raw_message: text,
        source: "telegram",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Trigger calendar fan-out asynchronously against this same deployment.
    fetch(new URL("/api/calendar/fan-out", req.nextUrl.origin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: event.id }),
    }).catch((err) => console.error("Fan-out trigger failed:", err));

    return NextResponse.json(
      { message: "Event extracted and saved successfully", event },
      { status: 201 }
    );
  } catch (error) {
    console.error("Webhook processing error:", error instanceof Error ? error.message : error);
    return errorResponse(error);
  }
}
