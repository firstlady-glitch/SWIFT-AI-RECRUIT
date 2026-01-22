import Stripe from 'stripe';

// Check if payments are enabled
export const ACCEPT_PAYMENTS = process.env.NEXT_PUBLIC_ACCEPT_PAYMENTS !== 'false';

// Initialize Stripe client (only if we have a key)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2025-12-15.clover',
        typescript: true,
    })
    : null;

// Subscription plan configurations
export const SUBSCRIPTION_PLANS = {
    // Applicant Plans
    free: {
        name: 'Free',
        priceMonthly: 0,
        priceAnnual: 0,
        stripePriceIdMonthly: null,
        stripePriceIdAnnual: null,
        features: [
            'Basic profile',
            '5 job applications/month',
            'Resume upload',
        ],
    },
    career_plus: {
        name: 'Career+',
        priceMonthly: 1499, // $14.99 in cents
        priceAnnual: 14990, // $149.90 (10 months)
        stripePriceIdMonthly: 'price_career_plus_monthly',
        stripePriceIdAnnual: 'price_career_plus_annual',
        features: [
            'Unlimited applications',
            'AI resume optimizer',
            'Priority visibility',
            'Interview prep tools',
            'Cover letter generator',
        ],
    },
    // Employer Plans
    starter: {
        name: 'Starter',
        priceMonthly: 9900, // $99 in cents
        priceAnnual: 99000,
        stripePriceIdMonthly: 'price_starter_monthly',
        stripePriceIdAnnual: 'price_starter_annual',
        features: [
            '3 active job posts',
            'Basic candidate search',
            'Email support',
        ],
    },
    growth: {
        name: 'Growth',
        priceMonthly: 24900, // $249
        priceAnnual: 249000,
        stripePriceIdMonthly: 'price_growth_monthly',
        stripePriceIdAnnual: 'price_growth_annual',
        features: [
            '10 active job posts',
            'AI candidate ranking',
            'Team collaboration (5 seats)',
            'Interview scheduling',
            'Priority support',
        ],
    },
    scale: {
        name: 'Scale',
        priceMonthly: 49900, // $499
        priceAnnual: 499000,
        stripePriceIdMonthly: 'price_scale_monthly',
        stripePriceIdAnnual: 'price_scale_annual',
        features: [
            'Unlimited job posts',
            'Advanced AI tools',
            'Unlimited team seats',
            'API access',
            'Dedicated support',
            'Custom integrations',
        ],
    },
    // Recruiter Plans
    pro: {
        name: 'Pro Recruiter',
        priceMonthly: 19900, // $199
        priceAnnual: 199000,
        stripePriceIdMonthly: 'price_pro_monthly',
        stripePriceIdAnnual: 'price_pro_annual',
        features: [
            'Access employer jobs',
            'Candidate submissions',
            'AI sourcing tools',
            'Commission tracking',
        ],
    },
    enterprise: {
        name: 'Enterprise',
        priceMonthly: 0, // Custom pricing
        priceAnnual: 0,
        stripePriceIdMonthly: null,
        stripePriceIdAnnual: null,
        features: [
            'Custom pricing',
            'Dedicated account manager',
            'SLA guarantees',
            'White-label options',
        ],
    },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(params: {
    priceId: string;
    customerId?: string;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session | null> {
    if (!stripe || !ACCEPT_PAYMENTS) {
        console.log('[Stripe] Payments not enabled or Stripe not configured');
        return null;
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: params.priceId,
                    quantity: 1,
                },
            ],
            customer: params.customerId,
            customer_email: params.customerId ? undefined : params.customerEmail,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: params.metadata,
        });

        console.log('[Stripe] Created checkout session:', session.id);
        return session;
    } catch (error) {
        console.error('[Stripe] Error creating checkout session:', error);
        throw error;
    }
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(params: {
    customerId: string;
    returnUrl: string;
}): Promise<Stripe.BillingPortal.Session | null> {
    if (!stripe || !ACCEPT_PAYMENTS) {
        return null;
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: params.customerId,
            return_url: params.returnUrl,
        });

        console.log('[Stripe] Created portal session');
        return session;
    } catch (error) {
        console.error('[Stripe] Error creating portal session:', error);
        throw error;
    }
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string
): Stripe.Event | null {
    if (!stripe) return null;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('[Stripe] No webhook secret configured');
        return null;
    }

    try {
        return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
        console.error('[Stripe] Webhook signature verification failed:', error);
        return null;
    }
}
