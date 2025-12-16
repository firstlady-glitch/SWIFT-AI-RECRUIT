import { redirect } from 'next/navigation';

export default async function AuthPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const role = params?.role;
    const plan = params?.plan;
    const view = params?.view;

    // Construct query string from all existing searchParams
    const searchStringParams = new URLSearchParams();

    if (params) {
        Object.keys(params).forEach(key => {
            const value = params[key];
            if (value) {
                if (Array.isArray(value)) {
                    value.forEach(v => searchStringParams.append(key, v));
                } else {
                    searchStringParams.append(key, value);
                }
            }
        });
    }

    // Determine target path
    if (role || plan || view === 'register') {
        redirect(`/auth/register?${searchStringParams.toString()}`);
    }

    if (!role && !plan && !view) {
        redirect(`/auth/login?${searchStringParams.toString()}`);
    }
}

