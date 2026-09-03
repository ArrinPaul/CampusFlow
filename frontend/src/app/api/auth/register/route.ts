import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { errorResponse } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, branch, year, telegram_username, subjects } = await req.json();

    if (!name || !email || !password || !branch || !year || !telegram_username) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const { data: existing } = await getClient()
      .from("students")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: student, error } = await getClient()
      .from("students")
      .insert({
        name,
        email,
        password_hash,
        branch,
        year,
        telegram_username,
        subjects: subjects || [],
      })
      .select("id, name, email, branch, year, telegram_username, subjects, created_at")
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: student.id, email: student.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token, student });
  } catch (error) {
    return errorResponse(error);
  }
}
