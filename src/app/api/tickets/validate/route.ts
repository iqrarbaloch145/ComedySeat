import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketCode, scannerUserId } = body;

    if (!ticketCode) {
      return NextResponse.json(
        { success: false, message: 'Ticket code is required.' },
        { status: 400 }
      );
    }

    const result = db.validateTicketScan(
      ticketCode,
      scannerUserId || '00000000-0000-0000-0000-000000000002'
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Validation failed.' },
      { status: 500 }
    );
  }
}
