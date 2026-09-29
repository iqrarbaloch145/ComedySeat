import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia' as any,
  appInfo: {
    name: 'ComedySeat Ticketing Marketplace',
    version: '1.0.0',
  },
});

/**
 * Creates an Express or Standard Stripe Connect onboarding link for an organizer.
 */
export async function createOrganizerOnboardingLink(params: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: params.accountId,
      refresh_url: params.refreshUrl,
      return_url: params.returnUrl,
      type: 'account_onboarding',
    });
    return { success: true, url: accountLink.url };
  } catch (error: any) {
    console.error('Error creating Stripe onboarding link:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Creates a new Connected Account for a newly registered organizer.
 */
export async function createConnectedAccount(params: {
  email: string;
  businessName: string;
  country: string;
}) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: params.country || 'US',
      email: params.email,
      business_type: 'company',
      company: {
        name: params.businessName,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return { success: true, accountId: account.id };
  } catch (error: any) {
    console.error('Error creating connected Stripe account:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieves the current status of a connected account.
 */
export async function getConnectedAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    const isChargesEnabled = account.charges_enabled;
    const isPayoutsEnabled = account.payouts_enabled;
    
    let status: 'not_connected' | 'incomplete' | 'active' | 'restricted' = 'not_connected';
    if (account.requirements?.disabled_reason) {
      status = 'restricted';
    } else if (isChargesEnabled && isPayoutsEnabled) {
      status = 'active';
    } else {
      status = 'incomplete';
    }

    return {
      success: true,
      status,
      charges_enabled: isChargesEnabled,
      payouts_enabled: isPayoutsEnabled,
      details_submitted: account.details_submitted,
    };
  } catch (error: any) {
    console.error('Error retrieving connected account status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Creates a Direct Charge PaymentIntent for an organizer-owned event.
 * Notice: This uses the direct header `{ stripeAccount: organizerAccountId }`
 * ensuring that funds are charged directly on the connected organizer's merchant account!
 */
export async function createDirectChargePaymentIntent(params: {
  amountInCents: number;
  currency: string;
  organizerStripeAccountId: string;
  orderNumber: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: params.amountInCents,
        currency: params.currency.toLowerCase(),
        receipt_email: params.customerEmail,
        description: `EventHub Ticket Order #${params.orderNumber}`,
        metadata: {
          orderNumber: params.orderNumber,
          ...params.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      },
      {
        // Direct Payment routing straight to the organizer's connected merchant account!
        stripeAccount: params.organizerStripeAccountId,
      }
    );

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    console.error('Error creating Direct Charge PaymentIntent:', error);
    return { success: false, error: error.message };
  }
}
