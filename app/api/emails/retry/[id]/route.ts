import { connectToDB } from '../../../../db';
import { EmailLog } from '../../../../model';
import { NextResponse } from 'next/server';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  await connectToDB();

  const email = await EmailLog.findById(params.id);
  if (!email) {
    return NextResponse.json({ success: false, message: 'Email not found' }, { status: 404 });
  }

  // Re-parse the saved preview/body again for claim/policy number
  const claimRegex = /(claim|policy)[\s\-#:]*([A-Z0-9\-]+)/i;
  const match = email.preview.match(claimRegex);
  const claimNumber = match ? match[2] : undefined;

  email.claimNumber = claimNumber;
  email.status = claimNumber ? 'success' : 'manual';
  email.error = '';
  await email.save();

  return NextResponse.json({ success: true, email });
}
