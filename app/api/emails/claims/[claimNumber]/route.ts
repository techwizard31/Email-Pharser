import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { claimNumber: string } }) {
  const claimNumber = params.claimNumber;

  // Simulate: In real-world, replace this with MongoDB or API lookup
  if (claimNumber === 'CLM101') {
    return NextResponse.json({
      found: true,
      claim: {
        claimNumber,
        name: "John Doe",
        status: "Open"
      }
    });
  }

  return NextResponse.json({ found: false });
}