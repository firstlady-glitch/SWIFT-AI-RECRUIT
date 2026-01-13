'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Conversation, Message, Profile } from '@/types';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    recipientId?: string;
    recipientName?: string;
    jobId?: string;
}

export function ChatPanel({ isOpen, onClose, recipientId, recipientName, jobId }: ChatPanelProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        if (isOpen) {
            initializeChat();
        }
    }, [isOpen, recipientId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Real-time subscription
    useEffect(() => {
        if (!activeConversation) return;

        const channel = supabase
            .channel(`messages:${activeConversation.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${activeConversation.id}`
            }, (payload) => {
                const newMsg = payload.new as Message;
                setMessages(prev => [...prev, newMsg]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeConversation, supabase]);

    const initializeChat = async () => {
        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUserId(user.id);

            // Fetch conversations
            const { data: convs } = await supabase
                .from('conversations')
                .select('*')
                .contains('participant_ids', [user.id])
                .order('last_message_at', { ascending: false });

            setConversations(convs || []);

            // If recipientId provided, find or create conversation
            if (recipientId) {
                let conv = convs?.find(c => c.participant_ids.includes(recipientId));

                if (!conv) {
                    const { data: newConv } = await supabase
                        .from('conversations')
                        .insert({
                            participant_ids: [user.id, recipientId],
                            job_id: jobId || null,
                        })
                        .select()
                        .single();

                    if (newConv) {
                        conv = newConv;
                        setConversations(prev => [newConv, ...prev]);
                    }
                }

                if (conv) {
                    setActiveConversation(conv);
                    await fetchMessages(conv.id);
                }
            } else if (convs && convs.length > 0) {
                setActiveConversation(convs[0]);
                await fetchMessages(convs[0].id);
            }
        } catch (err) {
            console.error('[Chat] Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles(full_name, profile_image_url)')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        setMessages(data || []);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConversation || !currentUserId) return;

        setIsSending(true);

        try {
            const { data: msg, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: activeConversation.id,
                    sender_id: currentUserId,
                    content: newMessage.trim(),
                })
                .select()
                .single();

            if (error) throw error;

            // Update conversation's last_message_at
            await supabase
                .from('conversations')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', activeConversation.id);

            setNewMessage('');
        } catch (err) {
            console.error('[Chat] Send error:', err);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-3xl h-[600px] bg-[#15171e] border border-gray-800 rounded-xl flex overflow-hidden">
                {/* Conversations List */}
                <div className="w-1/3 border-r border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-[var(--primary-blue)]" />
                            Messages
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length > 0 ? (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => {
                                        setActiveConversation(conv);
                                        fetchMessages(conv.id);
                                    }}
                                    className={`w-full p-4 text-left border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${activeConversation?.id === conv.id ? 'bg-gray-800/50' : ''}`}
                                >
                                    <p className="text-white text-sm font-medium truncate">
                                        Conversation
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {conv.last_message_at
                                            ? new Date(conv.last_message_at).toLocaleString()
                                            : 'No messages'}
                                    </p>
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No conversations yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="font-medium text-white">
                            {recipientName || 'Chat'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                            </div>
                        ) : messages.length > 0 ? (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.sender_id === currentUserId
                                            ? 'bg-[var(--primary-blue)] text-white'
                                            : 'bg-gray-800 text-gray-200'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <p className="text-xs opacity-60 mt-1">
                                            {new Date(msg.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No messages yet. Start the conversation!
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-800">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                                disabled={!activeConversation || isSending}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || !activeConversation || isSending}
                                className="px-4 py-3 bg-[var(--primary-blue)] hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {isSending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
