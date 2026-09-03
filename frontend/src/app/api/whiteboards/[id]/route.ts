import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { readLocalDb, writeLocalDb } from "@/lib/server/whiteboardFallback";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let student;
  try {
    student = getAuthenticatedStudent(req);
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
  const { id } = await params;

  try {
    const { data: whiteboard, error } = await getClient()
      .from("whiteboards")
      .select("*")
      .eq("id", id)
      .eq("student_id", student.id)
      .single();

    if (error) throw error;
    if (!whiteboard) {
      return NextResponse.json({ message: "Whiteboard not found" }, { status: 404 });
    }
    return NextResponse.json({ whiteboard });
  } catch (dbErr) {
    console.warn("Supabase fetch single failed, falling back to local storage file:", dbErr instanceof Error ? dbErr.message : dbErr);
    const db = readLocalDb();
    const wb = db.whiteboards.find((w) => w.id === id && w.student_id === student.id);
    if (!wb) {
      return NextResponse.json({ message: "Whiteboard not found" }, { status: 404 });
    }
    return NextResponse.json({ whiteboard: wb });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let student;
  try {
    student = getAuthenticatedStudent(req);
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
  const { id } = await params;
  const { title, data, thumbnail } = await req.json();

  try {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (data !== undefined) updateData.data = data;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

    const { data: whiteboard, error } = await getClient()
      .from("whiteboards")
      .update(updateData)
      .eq("id", id)
      .eq("student_id", student.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ whiteboard });
  } catch (dbErr) {
    console.warn("Supabase update failed, falling back to local storage file:", dbErr instanceof Error ? dbErr.message : dbErr);
    const db = readLocalDb();
    const idx = db.whiteboards.findIndex((w) => w.id === id && w.student_id === student.id);
    if (idx === -1) {
      return NextResponse.json({ message: "Whiteboard not found" }, { status: 404 });
    }

    const wb = db.whiteboards[idx];
    if (title !== undefined) wb.title = title;
    if (data !== undefined) wb.data = data;
    if (thumbnail !== undefined) wb.thumbnail = thumbnail;
    wb.updated_at = new Date().toISOString();

    writeLocalDb(db);
    return NextResponse.json({ whiteboard: wb });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let student;
  try {
    student = getAuthenticatedStudent(req);
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
  const { id } = await params;

  try {
    const { error } = await getClient()
      .from("whiteboards")
      .delete()
      .eq("id", id)
      .eq("student_id", student.id);

    if (error) throw error;
    return NextResponse.json({ message: "Whiteboard deleted successfully" });
  } catch (dbErr) {
    console.warn("Supabase delete failed, falling back to local storage file:", dbErr instanceof Error ? dbErr.message : dbErr);
    const db = readLocalDb();
    db.whiteboards = db.whiteboards.filter((w) => !(w.id === id && w.student_id === student.id));
    writeLocalDb(db);
    return NextResponse.json({ message: "Whiteboard deleted successfully" });
  }
}
