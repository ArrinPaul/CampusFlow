import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const supabase = getClient();
    const { data: prefs } = await supabase
      .from("preferences")
      .select("settings")
      .eq("user_id", student.id)
      .single();

    const isConnected = !!prefs?.settings?.google_refresh_token;
    return NextResponse.json({ connected: isConnected });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return NextResponse.json({ connected: false });
  }
}
