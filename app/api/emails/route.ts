import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../db';
import { EmailLog } from '../../model';
import { fetchUnreadEmails } from '../../emailReader';

// ✅ GET: return all saved emails
export async function GET(req: NextRequest) {
  await connectToDB();

  try {
    const emails = await EmailLog.find().sort({ createdAt: -1 });
    return NextResponse.json({ emails });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ POST: fetch from Gmail and save new emails
export async function POST() {
  try {
    await connectToDB();

    const emails = await fetchUnreadEmails();
    const savedEmails = [];

    for (const email of emails) {
      const exists = await EmailLog.findOne({ messageId: email.messageId });
      if (exists) continue;

      const newEmail = await EmailLog.create({
        ...email,
        status: email.claimNumber ? 'success' : 'manual',
      });

      savedEmails.push(newEmail);
    }

    return NextResponse.json({ success: true, saved: savedEmails.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
