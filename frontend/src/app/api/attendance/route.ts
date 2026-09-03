import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);

    const { data: attendance, error } = await getClient()
      .from("attendance")
      .select("*")
      .eq("student_id", student.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ attendance });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const { subject, total_classes, attended_classes, threshold } = await req.json();

    if (!subject || total_classes === undefined || attended_classes === undefined) {
      return NextResponse.json({ message: "Subject, total classes, and attended classes are required" }, { status: 400 });
    }

    const { data: existing } = await getClient()
      .from("attendance")
      .select("id")
      .eq("student_id", student.id)
      .eq("subject", subject)
      .single();

    let record;

    if (existing) {
      const { data, error } = await getClient()
        .from("attendance")
        .update({ total_classes, attended_classes, threshold: threshold || 75, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      record = data;
    } else {
      const { data, error } = await getClient()
        .from("attendance")
        .insert({
          student_id: student.id,
          subject,
          total_classes,
          attended_classes,
          threshold: threshold || 75,
        })
        .select()
        .single();

      if (error) throw error;
      record = data;
    }

    return NextResponse.json({ attendance: record });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
