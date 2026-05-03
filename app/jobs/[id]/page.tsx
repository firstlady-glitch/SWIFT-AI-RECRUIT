import { redirect } from 'next/navigation';

type PageProps = {
    params: Promise<{ id: string }>;
};

/** Public job board links here; shared detail + apply live under /app/applicant/jobs. */
export default async function PublicJobDetailRedirect({ params }: PageProps) {
    const { id } = await params;
    redirect(`/app/applicant/jobs/${id}`);
}
