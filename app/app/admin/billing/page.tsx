'use client';

import { useEffect, useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, Calendar, Download, FileText } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/client';
import type { Billing } from '@/types';

export default function AdminBillingPage() {
    const [billings, setBillings] = useState<Billing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        thisMonth: 0,
        successfulPayments: 0,
        failedPayments: 0,
    });

    useEffect(() => {
        fetchBillings();
    }, []);

    const fetchBillings = async () => {
        const supabase = createClient();

        try {
            const { data } = await supabase
                .from('billings')
                .select('*')
                .order('created_at', { ascending: false });

            setBillings(data || []);

            // Calculate stats
            const succeeded = (data || []).filter(b => b.status === 'succeeded');
            const failed = (data || []).filter(b => b.status === 'failed');
            const totalRevenue = succeeded.reduce((sum, b) => sum + b.amount, 0) / 100;

            const firstOfMonth = new Date();
            firstOfMonth.setDate(1);
            firstOfMonth.setHours(0, 0, 0, 0);
            const thisMonthRevenue = succeeded
                .filter(b => new Date(b.created_at) >= firstOfMonth)
                .reduce((sum, b) => sum + b.amount, 0) / 100;

            setStats({
                totalRevenue,
                thisMonth: thisMonthRevenue,
                successfulPayments: succeeded.length,
                failedPayments: failed.length,
            });
        } catch (err) {
            console.error('[Billing] Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'succeeded': return 'bg-green-500/10 text-green-400';
            case 'failed': return 'bg-red-500/10 text-red-400';
            case 'pending': return 'bg-yellow-500/10 text-yellow-400';
            default: return 'bg-gray-500/10 text-gray-400';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Billing</h1>
                <div className="grid md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-[#15171e] border border-gray-800 rounded-xl p-6 h-32 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Billing & Revenue</h1>
                <p className="text-gray-400">Payment tracking and revenue analytics</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </div>

                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-2xl font-bold">${stats.thisMonth.toLocaleString()}</p>
                </div>

                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <CreditCard className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm">Successful</p>
                    <p className="text-2xl font-bold">{stats.successfulPayments}</p>
                </div>

                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <CreditCard className="w-5 h-5 text-red-500" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm">Failed</p>
                    <p className="text-2xl font-bold">{stats.failedPayments}</p>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Recent Transactions</h3>

                {billings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Plan</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billings.slice(0, 20).map((billing) => (
                                    <tr key={billing.id} className="border-b border-gray-800 last:border-0">
                                        <td className="py-3 text-sm text-gray-300">
                                            {new Date(billing.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 text-white font-medium">
                                            ${(billing.amount / 100).toFixed(2)} {billing.currency.toUpperCase()}
                                        </td>
                                        <td className="py-3 text-sm text-gray-400 capitalize">
                                            {billing.plan_type || '-'}
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(billing.status)}`}>
                                                {billing.status}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            {billing.invoice_url ? (
                                                <a
                                                    href={billing.invoice_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[var(--primary-blue)] hover:underline text-sm flex items-center gap-1"
                                                >
                                                    <FileText className="w-4 h-4" /> View
                                                </a>
                                            ) : (
                                                <span className="text-gray-500 text-sm">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        icon={CreditCard}
                        title="No Transactions Yet"
                        description="Payment transactions will appear here once users start subscribing."
                    />
                )}
            </div>
        </div>
    );
}
