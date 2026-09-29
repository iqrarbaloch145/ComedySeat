import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizerId, stripeAccountId, status, actorUserId } = body;

    // STRICT AUTHENTICATION GUARD
    if (!actorUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Without login or registration, users are strictly prohibited from editing account or payment settings.',
        },
        { status: 401 }
      );
    }

    const actor = db.getProfileById(actorUserId);
    if (!actor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid authenticated session. Please sign in.',
        },
        { status: 401 }
      );
    }

    if (!organizerId) {
      return NextResponse.json(
        { success: false, message: 'Missing organizerId.' },
        { status: 400 }
      );
    }

    const org = db.getOrganizerById(organizerId);
    if (!org) {
      return NextResponse.json(
        { success: false, message: 'Organizer account not found.' },
        { status: 404 }
      );
    }

    // Ensure actor is either the organizer owner or super_admin
    if (org.user_id !== actor.id && actor.role !== 'super_admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to modify payment settings for this organizer account.',
        },
        { status: 403 }
      );
    }

    const updated = db.updateOrganizerStripeAccount(
      organizerId,
      stripeAccountId !== undefined ? stripeAccountId : org.stripe_account_id,
      status || org.stripe_account_status,
      actor.id
    );

    return NextResponse.json({
      success: true,
      message: 'Payment and payout settings updated successfully.',
      organizer: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update payment settings.' },
      { status: 500 }
    );
  }
}
