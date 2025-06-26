import { NextResponse } from 'next/server';
import { connectToDB } from '../../db';
import { EmailLog } from '../../model';
import { fetchUnreadEmails } from '../../emailReader';

export async function POST() {
  try {
    await connectToDB();

    const emails = await fetchUnreadEmails();

    const savedEmails = [];

    for (const email of emails) {
      // Prevent duplicates using messageId
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