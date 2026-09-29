import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/data-store';
import { Order, Organizer } from '@/types/database';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // 1. Signature Verification
  if (webhookSecret && signature && !webhookSecret.includes('placeholder') && !webhookSecret.includes('mock')) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } else {
    // Fallback parser for sandbox / demo webhook trigger
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
  }

  // 2. Event Handling with Idempotency
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const meta = paymentIntent.metadata || {};

        if (meta.eventId && meta.ticketTypeId) {
          // Idempotent ticket issuance: if already fulfilled, returns without duplicate tickets!
          db.createAndFulfillOrder({
            customerId: meta.customerId || '00000000-0000-0000-0000-000000000005',
            customerName: paymentIntent.receipt_email || 'Valued Customer',
            customerEmail: paymentIntent.receipt_email || 'customer@eventhub.com',
            eventId: meta.eventId,
            ticketTypeId: meta.ticketTypeId,
            quantity: parseInt(meta.quantity || '1', 10),
            paymentIntentId: paymentIntent.id,
            idempotencyKey: paymentIntent.id, // Guarantee idempotency against retries
            paymentMethod: 'stripe_connect_direct',
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        if (paymentIntentId) {
          const orders = db.getOrders();
          const targetOrder = orders.find((o: Order) => o.payment_intent_id === paymentIntentId);
          if (targetOrder) {
            db.processRefund(targetOrder.id, targetOrder.total_amount, 'Stripe Gateway Charge Refund', 'system');
          }
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        const isChargesEnabled = account.charges_enabled;
        const isPayoutsEnabled = account.payouts_enabled;
        const isRestricted = !!account.requirements?.disabled_reason;

        const newStatus = isRestricted ? 'restricted' : (isChargesEnabled && isPayoutsEnabled) ? 'active' : 'incomplete';
        const orgs = db.getOrganizers();
        const targetOrg = orgs.find((o: Organizer) => o.stripe_account_id === account.id);
        if (targetOrg) {
          db.updateOrganizerStripeAccount(targetOrg.id, account.id, newStatus);
        }
        break;
      }

      default:
        // Other events ignored safely
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error handling webhook event:', err);
    return NextResponse.json({ error: 'Webhook processing failed', details: err.message }, { status: 500 });
  }
}
