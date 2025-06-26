import { NextResponse } from 'next/server';
import { connectToDB } from '../../../../db';
import { EmailLog } from '@/app/model';

// Access the dynamic route param using the second argument `{ params }`
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  await connectToDB();

  try {
    const updated = await EmailLog.findByIdAndUpdate(params.id, {
      status: 'manual',
      error: ''
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, email: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
