import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

// Replace with user's access token (get via OAuth flow)
const ACCESS_TOKEN = 'user-oauth-access-token';

export async function GET() {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: ACCESS_TOKEN });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const res = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });

  const messages = await Promise.all(
    res.data.messages?.map(async (msg) => {
      const full = await gmail.users.messages.get({ userId: 'me', id: msg.id! });
      return {
        id: msg.id,
        snippet: full.data.snippet,
        subject: full.data.payload?.headers?.find(h => h.name === 'Subject')?.value,
        from: full.data.payload?.headers?.find(h => h.name === 'From')?.value,
      };
    }) || []
  );

  return NextResponse.json({ emails: messages });
}
