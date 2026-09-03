import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const student = getAuthenticatedStudent(req);
    const { id } = await params;

    const { error } = await getClient()
      .from("attendance")
      .delete()
      .eq("id", id)
      .eq("student_id", student.id);

    if (error) throw error;
    return NextResponse.json({ message: "Attendance record deleted" });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
