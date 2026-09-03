import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getTokensFromCode, verifyGoogleIdToken } from "@/lib/server/google";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {
    const tokens = await getTokensFromCode(code);

    if (!tokens.id_token) {
      throw new Error("Google did not return an id_token");
    }
    const payload = await verifyGoogleIdToken(tokens.id_token);
    if (!payload?.email) {
      throw new Error("Could not read email from Google profile");
    }
    const { email, name, sub: googleId } = payload;

    const supabase = getClient();

    let student = null;

    if (state) {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", state)
        .single();
      student = data;
    }

    if (!student) {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("email", email)
        .single();
      student = data;
    }

    if (!student) {
      const password_hash = await bcrypt.hash(googleId as string, 10);
      const { data: newStudent, error } = await supabase
        .from("students")
        .insert({
          name: name || email.split("@")[0],
          email,
          password_hash,
          branch: "Not Set",
          year: 1,
          telegram_username: "",
          subjects: [],
        })
        .select("id, name, email, branch, year, telegram_username, subjects, created_at")
        .single();

      if (error) throw error;
      student = newStudent;
    } else {
      const { password_hash: _password_hash, ...rest } = student;
      student = rest;
    }

    await supabase.from("preferences").upsert({
      user_id: student.id,
      settings: {
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_calendar_connected: true,
        google_token_expiry: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
      },
    });

    const appToken = jwt.sign(
      { id: student.id, email: student.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const userData = encodeURIComponent(JSON.stringify(student));

    return NextResponse.redirect(`${FRONTEND_URL}/login?token=${appToken}&user=${userData}`);
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
}
