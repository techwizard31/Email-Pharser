import { connectToDB } from '../../../db';
import { EmailLog } from '../../../model';
import { NextResponse } from 'next/server';

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
