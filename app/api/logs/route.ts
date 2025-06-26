import { NextResponse } from 'next/server';
import { connectToDB } from '../../db';
import { EmailLog } from '../../model';

export async function GET() {
  await connectToDB();
  const logs = await EmailLog.find().sort({ createdAt: -1 });
  return NextResponse.json({ logs });
}
