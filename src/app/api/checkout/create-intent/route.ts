import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';
import { createDirectChargePaymentIntent } from '@/lib/stripe';
import { generateOrderNumber } from '@/lib/utils';
import { TicketType } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, ticketTypeId, quantity, customerEmail } = body;

    // 1. Resolve event and stored owner on server
    const event = db.getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
    }

    const organizer = db.getOrganizerById(event.organizer_id);
    if (!organizer) {
      return NextResponse.json({ success: false, message: 'Organizer not found.' }, { status: 404 });
    }

    // 2. Critical check: block if missing or disconnected
    if (!organizer.stripe_account_id || organizer.stripe_account_status === 'not_connected') {
      return NextResponse.json(
        { 
          success: false, 
          message: `Checkout blocked: Organizer "${organizer.business_name}" has not connected a valid payment account.` 
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

    const ticketType = event.ticket_types?.find((t: TicketType) => t.id === ticketTypeId);
    if (!ticketType) {
      return NextResponse.json({ success: false, message: 'Ticket type not found.' }, { status: 404 });
    }

    if (ticketType.available_inventory < quantity) {
      return NextResponse.json(
        { success: false, message: 'Not enough tickets available in inventory.' },
        { status: 400 }
      );
    }

    const orderNumber = generateOrderNumber();
    const amountInCents = Math.round(ticketType.price * quantity * 100);

    // 3. Create Direct Charge with Stripe Connect (or sandbox fallback)
    const isSandbox = process.env.NEXT_PUBLIC_ENABLE_SANDBOX_PAYMENTS === 'true' || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    if (isSandbox) {
      return NextResponse.json({
        success: true,
        isSandbox: true,
        orderNumber,
        clientSecret: `mock_sec_${crypto.randomUUID().slice(0, 16)}`,
        paymentIntentId: `pi_mock_${crypto.randomUUID().slice(0, 14)}`,
        organizerMerchantAccountId: organizer.stripe_account_id,
        amount: ticketType.price * quantity,
      });
    }

    // Live Stripe Connect Direct Charge
    const stripeRes = await createDirectChargePaymentIntent({
      amountInCents,
      currency: ticketType.currency,
      organizerStripeAccountId: organizer.stripe_account_id,
      orderNumber,
      customerEmail,
      metadata: {
        eventId: event.id,
        ticketTypeId: ticketType.id,
        quantity: String(quantity),
      },
    });

    if (!stripeRes.success) {
      return NextResponse.json({ success: false, message: stripeRes.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      clientSecret: stripeRes.clientSecret,
      paymentIntentId: stripeRes.paymentIntentId,
      orderNumber,
      organizerMerchantAccountId: organizer.stripe_account_id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to initialize payment.' },
      { status: 500 }
    );
  }
}
