import "server-only";
import fs from "fs";
import path from "path";

// Local-file fallback used only when Supabase is unreachable. Note this only
// persists reliably on a host with a writable, persistent filesystem (e.g. a
// VPS or Render) — on serverless/edge platforms writes won't survive across
// invocations.
const dbPath = path.join(process.cwd(), "whiteboards_db.local.json");

export interface WhiteboardRecord {
  id: string;
  student_id: string;
  title: string;
  data: unknown;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

interface LocalDb {
  whiteboards: WhiteboardRecord[];
}

export function readLocalDb(): LocalDb {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ whiteboards: [] }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch (err) {
    console.error("Failed to parse local whiteboard DB, resetting:", err instanceof Error ? err.message : err);
    return { whiteboards: [] };
  }
}

export function writeLocalDb(data: LocalDb) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write to local whiteboard DB:", err instanceof Error ? err.message : err);
  }
}
