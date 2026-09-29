import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, reason, actorUserId } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing orderId or amount.' },
        { status: 400 }
      );
    }

    const result = db.processRefund(
      orderId,
      parseFloat(amount),
      reason || 'Customer refund request',
      actorUserId || '00000000-0000-0000-0000-000000000001'
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Refund processing failed.' },
      { status: 500 }
    );
  }
}
