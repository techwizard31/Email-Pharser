import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '../../../db';
import { EmailLog } from '../../../model';

export async function POST(req: NextRequest) {
  await connectToDB();

  const data = await req.json();

  try {
    const saved = await EmailLog.create(data);
    return NextResponse.json({ success: true, email: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
