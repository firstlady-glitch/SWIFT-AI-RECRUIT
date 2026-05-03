import { DashboardRouteLayout } from '@/components/dashboard/DashboardRouteLayout';

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ dashboard: string }>;
}) {
    const { dashboard } = await params;

    return (
        <DashboardRouteLayout role="recruiter" dashboardId={dashboard}>
            {children}
        </DashboardRouteLayout>
    );
}
