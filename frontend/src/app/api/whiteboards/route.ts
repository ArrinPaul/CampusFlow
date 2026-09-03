import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/server/supabase";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { readLocalDb, writeLocalDb } from "@/lib/server/whiteboardFallback";

export async function GET(req: NextRequest) {
  let student;
  try {
    student = getAuthenticatedStudent(req);
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }

  try {
    const { data: whiteboards, error } = await getClient()
      .from("whiteboards")
      .select("*")
      .eq("student_id", student.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ whiteboards });
  } catch (dbErr) {
    console.warn("Supabase fetch failed, falling back to local storage file:", dbErr instanceof Error ? dbErr.message : dbErr);
    const db = readLocalDb();
    const userWbs = db.whiteboards
      .filter((w) => w.student_id === student.id)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return NextResponse.json({ whiteboards: userWbs });
  }
}

export async function POST(req: NextRequest) {
  let student;
  try {
    student = getAuthenticatedStudent(req);
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }

  const { title, data, thumbnail } = await req.json();

  try {
    const { data: whiteboard, error } = await getClient()
      .from("whiteboards")
      .insert({
        student_id: student.id,
        title: title || "Untitled Whiteboard",
        data: data || {},
        thumbnail: thumbnail || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ whiteboard });
  } catch (dbErr) {
    console.warn("Supabase insert failed, falling back to local storage file:", dbErr instanceof Error ? dbErr.message : dbErr);
    const db = readLocalDb();
    const newWb = {
      id: "wb_" + Date.now() + Math.random().toString(36).slice(2, 7),
      student_id: student.id,
      title: title || "Untitled Whiteboard",
      data: data || {},
      thumbnail: thumbnail || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.whiteboards.push(newWb);
    writeLocalDb(db);
    return NextResponse.json({ whiteboard: newWb });
  }
}
