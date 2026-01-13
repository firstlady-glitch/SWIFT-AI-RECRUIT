'use client';

import { useEffect, useState } from 'react';
import { Bell, X, Check, MessageCircle, Briefcase, Calendar, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Notification, NotificationType } from '@/types';

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        fetchNotifications();

        // Real-time subscription
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications'
            }, (payload) => {
                const newNotif = payload.new as Notification;
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        setNotifications(data || []);
        setUnreadCount((data || []).filter(n => !n.read_at).length);
    };

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('id', id);

        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .is('read_at', null);

        setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        setUnreadCount(0);
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'message_received': return MessageCircle;
            case 'application_received':
            case 'application_status_changed': return Briefcase;
            case 'interview_scheduled':
            case 'interview_reminder': return Calendar;
            case 'payment_succeeded':
            case 'payment_failed': return CreditCard;
            default: return Bell;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#15171e] border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                            <h3 className="font-semibold">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-[var(--primary-blue)] hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => {
                                    const Icon = getIcon(notif.type as NotificationType);
                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => {
                                                if (!notif.read_at) markAsRead(notif.id);
                                                if (notif.link) window.location.href = notif.link;
                                            }}
                                            className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors ${!notif.read_at ? 'bg-blue-500/5' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`p-2 rounded-lg ${!notif.read_at ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!notif.read_at ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {notif.message && (
                                                        <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                                                    )}
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {new Date(notif.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                {!notif.read_at && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No notifications</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
