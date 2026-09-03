import "server-only";
import axios from "axios";

export async function triggerN8nDeadline(data: unknown) {
  try {
    await axios.post(process.env.N8N_DEADLINE_WEBHOOK as string, data, { timeout: 10000 });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function triggerN8nNotice(data: unknown) {
  try {
    await axios.post(process.env.N8N_NOTICE_WEBHOOK as string, data, { timeout: 10000 });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
