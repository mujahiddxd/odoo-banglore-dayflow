// This route is deprecated. Use /api/auth/signin instead.
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'This endpoint is deprecated. Please use /signin.' },
    { status: 410 }
  );
}
