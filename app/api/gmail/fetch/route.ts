import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth"; // ✅ this path must match where you define it

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    console.error("No access token in session:", session); // helpful debug log
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const list = await gmail.users.messages.list({ userId: "me", maxResults: 100 });

  const messages = await Promise.all(
    list.data.messages?.map(async (msg) => {
      const full = await gmail.users.messages.get({ userId: "me", id: msg.id! });
      const headers = full.data.payload?.headers ?? [];
      return {
        id: msg.id,
        snippet: full.data.snippet,
        subject: headers.find(h => h.name === "Subject")?.value,
        from: headers.find(h => h.name === "From")?.value,
      };
    }) || []
  );

  return NextResponse.json({ emails: messages });
}
