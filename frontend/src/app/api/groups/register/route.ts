import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { errorResponse } from "@/lib/server/auth";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Called by the n8n group-register workflow (no auth — internal automation endpoint).
// Registers a Telegram group and returns an invite link.
export async function POST(req: NextRequest) {
  try {
    const { telegram_chat_id, name } = await req.json();

    if (!telegram_chat_id || !name) {
      return NextResponse.json({ message: "telegram_chat_id and name are required" }, { status: 400 });
    }

    const supabase = getClient();

    const { data: existing } = await supabase
      .from("telegram_groups")
      .select("*")
      .eq("telegram_chat_id", telegram_chat_id)
      .single();

    if (existing) {
      return NextResponse.json({
        group_id: existing.id,
        invite_link: existing.invite_link,
        message: "Group already registered",
      });
    }

    const invite_link = `${FRONTEND_URL}/join?chat_id=${telegram_chat_id}`;

    const { data: group, error } = await supabase
      .from("telegram_groups")
      .insert({
        telegram_chat_id,
        name,
        invite_link,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      group_id: group.id,
      invite_link: group.invite_link,
      message: "Group registered successfully",
    });
  } catch (error) {
    console.error("Group registration error:", error instanceof Error ? error.message : error);
    return errorResponse(error);
  }
}
