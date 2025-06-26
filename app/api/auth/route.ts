import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { credential } = await req.json();

  const oauth2Client = new google.auth.OAuth2();
  const ticket = await oauth2Client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  // You can save this email or session if needed
  // Save token for future API calls (not shown here for security)
  return NextResponse.json({ success: true, user: payload.email });
}