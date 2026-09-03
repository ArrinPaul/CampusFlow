import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const student = getAuthenticatedStudent(req);
    const { id } = await params;
    const { title, subject, description, deadline, status } = await req.json();

    const { data: task, error } = await getClient()
      .from("tasks")
      .update({ title, subject, description, deadline, status })
      .eq("id", id)
      .eq("student_id", student.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const student = getAuthenticatedStudent(req);
    const { id } = await params;

    const { error } = await getClient()
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("student_id", student.id);

    if (error) throw error;
    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
