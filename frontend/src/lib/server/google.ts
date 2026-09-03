import "server-only";
import { OAuth2Client } from "google-auth-library";
import { getClient } from "./supabase";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export function getAuthUrl(state?: string) {
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/calendar",
    ],
    prompt: "consent",
    state,
  });
}

export async function getTokensFromCode(code: string) {
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

async function refreshAccessToken(refreshToken: string) {
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
}

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const supabase = getClient();
  const { data: prefs } = await supabase
    .from("preferences")
    .select("settings")
    .eq("user_id", userId)
    .single();

  const settings = prefs?.settings;
  if (!settings?.google_access_token) return null;

  const expiry = settings.google_token_expiry;
  if (expiry && new Date(expiry).getTime() > Date.now() + 60000) {
    return settings.google_access_token;
  }

  if (!settings.google_refresh_token) return null;

  try {
    const newCredentials = await refreshAccessToken(settings.google_refresh_token);
    await supabase.from("preferences").upsert({
      user_id: userId,
      settings: {
        ...settings,
        google_access_token: newCredentials.access_token,
        google_token_expiry: newCredentials.expiry_date
          ? new Date(newCredentials.expiry_date).toISOString()
          : null,
      },
    });
    return newCredentials.access_token ?? null;
  } catch (err) {
    console.error("Failed to refresh Google token:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function getCalendarEvents(accessToken: string) {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Calendar API error: ${res.status}`);
  }
  return res.json();
}

export async function createCalendarEvent(accessToken: string, event: unknown) {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Calendar API error: ${res.status}`);
  }
  return res.json();
}
