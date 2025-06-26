import { NextResponse } from 'next/server';
import { connectToDB } from '../../db';
import { EmailLog } from '../../model';

export async function GET() {
  await connectToDB();

  const emails = await EmailLog.find().sort({ createdAt: -1 }).limit(10);

  return NextResponse.json({ emails });
}
