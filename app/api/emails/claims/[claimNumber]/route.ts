import { connectToDB } from '../../../../db';
import { Claim } from '../../../../model'; // You must create this model
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { claimNumber: string } }) {
  await connectToDB();

  const claim = await Claim.findOne({ claimNumber: params.claimNumber });

  if (!claim) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, claim });
}
