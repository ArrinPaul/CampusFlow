import "server-only";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export interface Student {
  id: string;
  name: string;
  email: string;
  branch: string;
  year: number;
  telegram_username: string;
  subjects: string[];
  created_at: string;
}

const DEV_STUDENT: Student = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Developer",
  email: "dev@example.com",
  branch: "Computer Science",
  year: 4,
  telegram_username: "dev_user",
  subjects: ["CS101", "CS102"],
  created_at: new Date().toISOString(),
};

export class AuthError extends Error {}

export function getAuthenticatedStudent(req: NextRequest): Student {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthError("No token provided");
  }

  const token = authHeader.split(" ")[1];

  if (process.env.DEV_MODE === "true" && token === "dev-token") {
    return DEV_STUDENT;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded as Student;
  } catch {
    throw new AuthError("Invalid token");
  }
}

export function unauthorized(message = "No token provided") {
  return NextResponse.json({ message }, { status: 401 });
}

export function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ message }, { status });
}
