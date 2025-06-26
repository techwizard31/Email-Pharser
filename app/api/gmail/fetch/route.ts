import { authOptions } from "../../../auth"; // ✅ this path must match where you define it
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDB } from "../../../db";
import { EmailLog } from "../../../model";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    console.error("No access token in session:", session);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  await connectToDB();

  const list = await gmail.users.messages.list({ userId: "me", maxResults: 100 });

  const savedEmails = [];

  for (const msg of list.data.messages || []) {
    const full = await gmail.users.messages.get({ userId: "me", id: msg.id! });
    const headers = full.data.payload?.headers ?? [];

    const subject = headers.find(h => h.name === "Subject")?.value || "No subject";
    const from = headers.find(h => h.name === "From")?.value || "Unknown sender";
    const snippet = full.data.snippet || "";
    const messageId = full.data.id || msg.id;

    const exists = await EmailLog.findOne({ messageId });
    if (exists) continue;

    const newEmail = await EmailLog.create({
      messageId,
      sender: from,
      subject,
      preview: snippet,
      time: new Date().toLocaleTimeString(),
      status: "manual", // or use regex to parse and determine status
    });

    savedEmails.push(newEmail);
  }

  return NextResponse.json({ emails: savedEmails });
}

