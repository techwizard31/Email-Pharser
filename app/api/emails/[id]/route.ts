import { connectToDB } from '../../../db';
import { EmailLog } from '../../../model';
import { NextRequest, NextResponse } from 'next/server';

// GET single email
export async function GET(_: Request, context: { params: { id: string } }) {
  await connectToDB();
  const { id } = context.params;

  try {
    const email = await EmailLog.findById(id);
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }
    return NextResponse.json({ email });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE email
export async function DELETE(_: Request, context: { params: { id: string } }) {
  await connectToDB();
  const { id } = context.params;

  try {
    await EmailLog.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Save new email by ID (if not already present)
export async function POST(req: NextRequest, context: { params: { id: string } }) {
  await connectToDB();
  const { id } = context.params;

  try {
    const { sender, subject, body, time } = await req.json();

    const claimRegex = /(claim|policy)[\s\-#:]*([A-Z0-9\-]+)/i;
    const match = body.match(claimRegex);
    const claimNumber = match ? match[2] : undefined;

    const emailData = {
      messageId: id,
      sender,
      subject,
      preview: body.slice(0, 150),
      time,
      claimNumber,
      status: claimNumber ? 'success' : 'manual',
    };

    const exists = await EmailLog.findOne({ messageId: id });
    if (exists) {
      return NextResponse.json({ success: false, message: 'Already exists' }, { status: 409 });
    }

    const saved = await EmailLog.create(emailData);
    return NextResponse.json({ success: true, email: saved });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
