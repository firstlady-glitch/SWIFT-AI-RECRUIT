import { redirect } from 'next/navigation';

export default function AuthPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const role = searchParams.role;
    const plan = searchParams.plan;
    const view = searchParams.view;

    // Construct query string from all existing searchParams
    const params = new URLSearchParams();
    Object.keys(searchParams).forEach(key => {
        const value = searchParams[key];
        if (value) {
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v));
            } else {
                params.append(key, value);
            }
        }
    });

    // Determine target path
    // If role is present, or if a plan is selected (implying intent to sign up), go to register
    if (role || plan || view === 'register') {
        redirect(`/auth/register?${params.toString()}`);
    }

    // Default redirect if nothing specified
    redirect(`/auth/login?${params.toString()}`);
}
