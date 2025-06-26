import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth"; 

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const list = await gmail.users.messages.list({ userId: "me", maxResults: 10 });

  const msgs = await Promise.all(
    list.data.messages?.map(async (m) => {
      const full = await gmail.users.messages.get({ userId: "me", id: m.id! });
      return {
        id: m.id,
        subject: full.data.payload?.headers?.find(h => h.name === "Subject")?.value,
        from: full.data.payload?.headers?.find(h => h.name === "From")?.value,
        snippet: full.data.snippet,
      };
    }) || []
  );

  return NextResponse.json({ emails: msgs });
}
