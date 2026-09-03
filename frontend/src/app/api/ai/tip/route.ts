import { NextResponse } from "next/server";
import { getStudyTip } from "@/lib/server/groq";

export async function GET() {
  try {
    const tip = await getStudyTip();
    return NextResponse.json({ tip });
  } catch {
    return NextResponse.json({ tip: "Take regular breaks while studying!" });
  }
}
