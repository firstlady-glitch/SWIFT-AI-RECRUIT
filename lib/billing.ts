/**
 * Subscription catalog (amounts for Paystack are NGN kobo — see getPaystackAmountKobo).
 * Legacy `stripe_*` fields were removed; DB tables (`stripe_customers`, `billings`) stay as-is.
 */

export const SUBSCRIPTION_PLANS = {
    free: {
        name: 'Free',
        priceMonthly: 0,
        priceAnnual: 0,
        features: ['Basic profile', '5 job applications/month', 'Resume upload'],
    },
    career_plus: {
        name: 'Career+',
        priceMonthly: 1499,
        priceAnnual: 14990,
        features: [
            'Unlimited applications',
            'AI resume optimizer',
            'Priority visibility',
            'Interview prep tools',
            'Cover letter generator',
        ],
    },
    starter: {
        name: 'Starter',
        priceMonthly: 9900,
        priceAnnual: 99000,
        features: [
            '3 active job posts',
            'Basic candidate search',
            'Email support',
        ],
    },
    growth: {
        name: 'Growth',
        priceMonthly: 24900,
        priceAnnual: 249000,
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
        priceMonthly: 49900,
        priceAnnual: 499000,
        features: [
            'Unlimited job posts',
            'Advanced AI tools',
            'Unlimited team seats',
            'API access',
            'Dedicated support',
            'Custom integrations',
        ],
    },
    pro: {
        name: 'Pro Recruiter',
        priceMonthly: 19900,
        priceAnnual: 199000,
        features: [
            'Access employer jobs',
            'Candidate submissions',
            'AI sourcing tools',
            'Commission tracking',
        ],
    },
    enterprise: {
        name: 'Enterprise',
        priceMonthly: 0,
        priceAnnual: 0,
        features: [
            'Custom pricing',
            'Dedicated account manager',
            'SLA guarantees',
            'White-label options',
        ],
    },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;

/** Internal keys for Paystack amounts (NGN kobo). */
export type BillingAmountKey =
    | 'applicant_starter'
    | 'applicant_pro'
    | 'career_plus'
    | 'employer_starter'
    | 'employer_growth'
    | 'employer_scale'
    | 'employer_enterprise'
    | 'recruiter_starter'
    | 'recruiter_pro'
    | 'recruiter_agency';

const DEFAULT_KOBO: Record<
    BillingAmountKey,
    { monthly: number; annual: number }
> = {
    applicant_starter: { monthly: 2_500_000, annual: 25_000_000 },
    applicant_pro: { monthly: 4_500_000, annual: 45_000_000 },
    career_plus: { monthly: 6_500_000, annual: 65_000_000 },
    employer_starter: { monthly: 15_000_000, annual: 150_000_000 },
    employer_growth: { monthly: 40_000_000, annual: 400_000_000 },
    employer_scale: { monthly: 80_000_000, annual: 800_000_000 },
    employer_enterprise: { monthly: 200_000_000, annual: 2_000_000_000 },
    recruiter_starter: { monthly: 8_000_000, annual: 80_000_000 },
    recruiter_pro: { monthly: 16_000_000, annual: 160_000_000 },
    recruiter_agency: { monthly: 48_000_000, annual: 480_000_000 },
};

export function getPaystackAmountKobo(
    amountKey: BillingAmountKey,
    interval: 'monthly' | 'annual'
): number {
    const envM = process.env[`PAYSTACK_KOBO_${amountKey.toUpperCase()}_MONTHLY`];
    const envA = process.env[`PAYSTACK_KOBO_${amountKey.toUpperCase()}_ANNUAL`];
    if (interval === 'annual' && envA) return parseInt(envA, 10);
    if (interval === 'monthly' && envM) return parseInt(envM, 10);
    const row = DEFAULT_KOBO[amountKey];
    return interval === 'annual' ? row.annual : row.monthly;
}

/**
 * Map client plan key + role to Paystack amount bucket and `profiles.plan` value after payment.
 */
export function resolvePaystackBilling(
    planKey: string,
    role: string
): { amountKey: BillingAmountKey; profilePlan: string } | null {
    const pk = planKey;
    if (role === 'applicant') {
        if (pk === 'starter')
            return { amountKey: 'applicant_starter', profilePlan: 'starter' };
        if (pk === 'pro') return { amountKey: 'applicant_pro', profilePlan: 'pro' };
        if (pk === 'career_plus')
            return { amountKey: 'career_plus', profilePlan: 'career_plus' };
        return null;
    }
    if (role === 'employer') {
        if (pk === 'starter')
            return { amountKey: 'employer_starter', profilePlan: 'starter' };
        if (pk === 'growth' || pk === 'pro')
            return { amountKey: 'employer_growth', profilePlan: 'growth' };
        if (pk === 'scale' || pk === 'team')
            return { amountKey: 'employer_scale', profilePlan: 'scale' };
        if (pk === 'enterprise')
            return { amountKey: 'employer_enterprise', profilePlan: 'enterprise' };
        return null;
    }
    if (role === 'recruiter') {
        if (pk === 'recruiter_starter' || pk === 'starter')
            return { amountKey: 'recruiter_starter', profilePlan: 'recruiter_starter' };
        if (pk === 'recruiter_pro' || pk === 'pro')
            return { amountKey: 'recruiter_pro', profilePlan: 'recruiter_pro' };
        if (pk === 'agency')
            return { amountKey: 'recruiter_agency', profilePlan: 'agency' };
        return null;
    }
    return null;
}

export function isPaystackConfigured(): boolean {
    return !!(
        process.env.PAYSTACK_SECRET_KEY?.trim() &&
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim()
    );
}

/** Server + client via /api/config */
export function acceptPaymentsServer(): boolean {
    return isPaystackConfigured();
}
