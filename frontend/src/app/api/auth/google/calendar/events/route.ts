import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedStudent, AuthError, unauthorized, errorResponse } from "@/lib/server/auth";
import { getValidAccessToken, getCalendarEvents, createCalendarEvent } from "@/lib/server/google";

export async function GET(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const accessToken = await getValidAccessToken(student.id);
    if (!accessToken) {
      return NextResponse.json({ message: "Google Calendar not connected" }, { status: 400 });
    }

    const events = await getCalendarEvents(accessToken);
    return NextResponse.json({ events });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const student = getAuthenticatedStudent(req);
    const accessToken = await getValidAccessToken(student.id);
    if (!accessToken) {
      return NextResponse.json({ message: "Google Calendar not connected" }, { status: 400 });
    }

    const body = await req.json();
    const event = await createCalendarEvent(accessToken, body);
    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized(error.message);
    return errorResponse(error);
  }
}
