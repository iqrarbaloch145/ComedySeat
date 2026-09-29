import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      eventId,
      ticketTypeId,
      quantity,
      idempotencyKey,
    } = body;

    if (!eventId || !ticketTypeId || !quantity) {
      return NextResponse.json(
        { success: false, message: 'Missing required checkout parameters.' },
        { status: 400 }
      );
    }

    // Resolve event and stored owner on server
    const event = db.getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
    }

    const organizer = db.getOrganizerById(event.organizer_id);
    if (!organizer) {
      return NextResponse.json({ success: false, message: 'Organizer record not found.' }, { status: 404 });
    }

    // Check organizer merchant account connection
    if (!organizer.stripe_account_id || organizer.stripe_account_status === 'not_connected') {
      return NextResponse.json(
        { 
          success: false, 
          message: `Checkout blocked: Organizer "${organizer.business_name}" has not connected a valid merchant payment account.` 
        },
        { status: 400 }
      );
    }

    if (organizer.stripe_account_status === 'restricted') {
      return NextResponse.json(
        { 
          success: false, 
          message: `Checkout blocked: Organizer "${organizer.business_name}" payment gateway is restricted.` 
        },
        { status: 400 }
      );
    }

    // Auto-create customer account if one does not exist
    const buyerEmail = (customerEmail || 'fan@comedyseat.com').trim().toLowerCase();
    const buyerName = (customerName || 'Comedy Fan').trim();
    let customer = db.getProfileByEmail(buyerEmail);
    let autoCreatedAccount = false;

    if (!customer) {
      customer = db.createUserProfile(buyerEmail, buyerName, 'customer');
      autoCreatedAccount = true;
    }

    // Process order fulfillment idempotently
    const result = db.createAndFulfillOrder({
      customerId: customer.id,
      customerName: buyerName,
      customerEmail: buyerEmail,
      customerPhone: customerPhone || '+1 (555) 234-5678',
      eventId,
      ticketTypeId,
      quantity,
      idempotencyKey,
      paymentMethod: 'stripe_connect_direct',
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      tickets: result.tickets,
      isDuplicate: result.isDuplicate,
      recipientAccount: organizer.stripe_account_id,
      autoCreatedAccount,
      user: customer,
    });
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Checkout fulfillment failed.' },
      { status: 500 }
    );
  }
}
