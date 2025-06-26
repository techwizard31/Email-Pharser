import { connectToDB } from '../../../db';
import { EmailLog } from '../../../model';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectToDB();
  const email = await EmailLog.findById(params.id);
  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 });
  }
  return NextResponse.json({ email });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectToDB();
  try {
    await EmailLog.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// NEW: Accept raw email content, extract claim number, and save
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDB();

  try {
    const { sender, subject, body, time } = await req.json();

    // Simple regex to extract claim/policy number (customize this!)
    const claimRegex = /(claim|policy)[\s\-#:]*([A-Z0-9\-]+)/i;
    const match = body.match(claimRegex);
    const claimNumber = match ? match[2] : undefined;

    const emailData = {
      messageId: params.id,
      sender,
      subject,
      preview: body.slice(0, 150),
      time,
      claimNumber,
      status: claimNumber ? 'success' : 'manual',
    };

    const exists = await EmailLog.findOne({ messageId: params.id });
    if (exists) {
      return NextResponse.json({ success: false, message: 'Already exists' }, { status: 409 });
    }

    const saved = await EmailLog.create(emailData);
    return NextResponse.json({ success: true, email: saved });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}