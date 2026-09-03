import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { errorResponse } from "@/lib/server/auth";

// Called by the n8n ingestion workflow (no auth — internal automation endpoint).
// GET /api/groups/by-chat-id?chat_id=123 — looks up group_id by telegram_chat_id.
export async function GET(req: NextRequest) {
  try {
    const chat_id = req.nextUrl.searchParams.get("chat_id");

    if (!chat_id) {
      return NextResponse.json({ message: "chat_id query parameter is required" }, { status: 400 });
    }

    const { data: group, error } = await getClient()
      .from("telegram_groups")
      .select("id, name, telegram_chat_id")
      .eq("telegram_chat_id", chat_id)
      .single();

    if (error || !group) {
      return NextResponse.json({ message: "Group not found for this chat_id" }, { status: 404 });
    }

    return NextResponse.json({ group_id: group.id, name: group.name });
  } catch (error) {
    return errorResponse(error);
  }
}
