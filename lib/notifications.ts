import nodemailer from 'nodemailer';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { NotificationType } from '@/types';

// Email transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// Email enabled check
export const EMAIL_ENABLED = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

/**
 * Create a notification in the database
 */
export async function createNotification(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message?: string;
    link?: string;
}): Promise<boolean> {
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase.from('notifications').insert({
            user_id: params.userId,
            type: params.type,
            title: params.title,
            message: params.message || null,
            link: params.link || null,
        });

        if (error) {
            console.error('[Notifications] Error creating notification:', error);
            return false;
        }

        console.log('[Notifications] Created notification for user:', params.userId);
        return true;
    } catch (error) {
        console.error('[Notifications] Error:', error);
        return false;
    }
}

/**
 * Send an email notification
 */
export async function sendEmailNotification(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
}): Promise<boolean> {
    if (!EMAIL_ENABLED) {
        console.log('[Email] Email not enabled, skipping send to:', params.to);
        return false;
    }

    try {
        await transporter.sendMail({
            from: `"SwiftAI Recruit" <${process.env.GMAIL_USER}>`,
            to: params.to,
            subject: params.subject,
            html: params.html,
            text: params.text,
        });

        console.log('[Email] Sent email to:', params.to);
        return true;
    } catch (error) {
        console.error('[Email] Error sending email:', error);
        return false;
    }
}

/**
 * Notify user of application status change
 */
export async function notifyApplicationStatusChange(params: {
    applicantId: string;
    applicantEmail: string;
    applicantName: string;
    jobTitle: string;
    companyName: string;
    newStatus: string;
}): Promise<void> {
    const statusMessages: Record<string, string> = {
        reviewed: 'Your application is being reviewed',
        shortlisted: 'Congratulations! You\'ve been shortlisted',
        interview: 'You\'ve been invited for an interview',
        offer: 'Great news! You have a job offer',
        hired: 'Welcome aboard! You\'ve been hired',
        rejected: 'Application update',
    };

    const title = statusMessages[params.newStatus] || 'Application updated';

    // Create in-app notification
    await createNotification({
        userId: params.applicantId,
        type: 'application_status_changed',
        title,
        message: `${params.jobTitle} at ${params.companyName}`,
        link: '/app/applicant/applications',
    });

    // Send email
    await sendEmailNotification({
        to: params.applicantEmail,
        subject: `${title} - ${params.jobTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a1a2e;">Hi ${params.applicantName},</h2>
                <p>There's an update on your application for <strong>${params.jobTitle}</strong> at <strong>${params.companyName}</strong>.</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="font-size: 18px; margin: 0;"><strong>Status:</strong> ${params.newStatus.charAt(0).toUpperCase() + params.newStatus.slice(1)}</p>
                </div>
                <p>Log in to your account to view more details.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/applicant/applications" 
                   style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
                    View Application
                </a>
                <p style="color: #666; margin-top: 40px; font-size: 12px;">
                    SwiftAI Recruit - AI-Powered Recruitment Platform
                </p>
            </div>
        `,
    });
}

/**
 * Notify employer of new application
 */
export async function notifyNewApplication(params: {
    employerId: string;
    employerEmail: string;
    applicantName: string;
    jobTitle: string;
    jobId: string;
    dashboardId: string; /* The dashboard (or organization) ID for the route path */
}): Promise<void> {
    // Create in-app notification
    await createNotification({
        userId: params.employerId,
        type: 'application_received',
        title: 'New application received',
        message: `${params.applicantName} applied for ${params.jobTitle}`,
        link: `/app/org/employer/${params.dashboardId}/jobs/${params.jobId}`,
    });

    // Send email
    await sendEmailNotification({
        to: params.employerEmail,
        subject: `New Application: ${params.applicantName} for ${params.jobTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a1a2e;">New Application Received</h2>
                <p><strong>${params.applicantName}</strong> has applied for the <strong>${params.jobTitle}</strong> position.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/org/employer/${params.dashboardId}/jobs/${params.jobId}" 
                   style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
                    Review Application
                </a>
                <p style="color: #666; margin-top: 40px; font-size: 12px;">
                    SwiftAI Recruit - AI-Powered Recruitment Platform
                </p>
            </div>
        `,
    });
}

/**
 * Notify user of interview scheduled
 */
export async function notifyInterviewScheduled(params: {
    applicantId: string;
    applicantEmail: string;
    applicantName: string;
    jobTitle: string;
    companyName: string;
    scheduledAt: string;
    meetingLink?: string;
}): Promise<void> {
    const date = new Date(params.scheduledAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Create in-app notification
    await createNotification({
        userId: params.applicantId,
        type: 'interview_scheduled',
        title: 'Interview scheduled',
        message: `${params.jobTitle} at ${params.companyName} - ${formattedDate}`,
        link: '/app/applicant/interviews',
    });

    // Send email
    await sendEmailNotification({
        to: params.applicantEmail,
        subject: `Interview Scheduled: ${params.jobTitle} at ${params.companyName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a1a2e;">Interview Scheduled!</h2>
                <p>Hi ${params.applicantName},</p>
                <p>Your interview for <strong>${params.jobTitle}</strong> at <strong>${params.companyName}</strong> has been scheduled.</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="font-size: 18px; margin: 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
                    ${params.meetingLink ? `<p style="margin-top: 10px;"><strong>Meeting Link:</strong> <a href="${params.meetingLink}">${params.meetingLink}</a></p>` : ''}
                </div>
                <p>Please make sure to be on time and prepared for your interview.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/applicant/interviews" 
                   style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
                    View Interview Details
                </a>
                <p style="color: #666; margin-top: 40px; font-size: 12px;">
                    SwiftAI Recruit - AI-Powered Recruitment Platform
                </p>
            </div>
        `,
    });
}
