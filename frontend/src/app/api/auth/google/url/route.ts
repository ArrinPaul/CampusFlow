import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/server/google";

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state") ?? undefined;
  const url = getAuthUrl(state);
  return NextResponse.json({ url });
}
