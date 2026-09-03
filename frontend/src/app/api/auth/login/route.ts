import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { errorResponse } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const { data: student, error } = await getClient()
      .from("students")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !student) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: student.id, email: student.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const { password_hash: _password_hash, ...studentData } = student;
    return NextResponse.json({ token, student: studentData });
  } catch (error) {
    return errorResponse(error);
  }
}
