'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Conversation, Message, Profile } from '@/types';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Search, Send, Paperclip, MoreVertical, Archive, Trash2, Check, CheckCheck, User } from 'lucide-react';

interface ChatInterfaceProps {
    currentUserId: string;
}

export function ChatInterface({ currentUserId }: ChatInterfaceProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchConversations();

        // Subscribe to new messages
        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    const newMessage = payload.new as Message;

                    // If this message belongs to the selected conversation, add it
                    if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
                        // Fetch sender details if needed, or just append 
                        // For now simplified append, ideally we fetch sender
                        setMessages(prev => [...prev, newMessage]);
                        scrollToBottom();
                        markAsRead(selectedConversation.id);
                    }

                    // Update last message in conversation list
                    setConversations(prev => prev.map(c => {
                        if (c.id === newMessage.conversation_id) {
                            return {
                                ...c,
                                last_message: newMessage,
                                last_message_at: newMessage.created_at
                            };
                        }
                        return c;
                    }).sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedConversation]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/conversations');
            if (!res.ok) throw new Error('Failed to load conversations');
            const data = await res.json();

            // Transform to match types if needed (API returns joined fields)
            setConversations(data.conversations || []);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError('Failed to load conversations');
        } finally {
            setIsLoadingConversations(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        setIsLoadingMessages(true);
        try {
            const res = await fetch(`/api/messages?conversationId=${conversationId}`);
            if (!res.ok) throw new Error('Failed to load messages');
            const data = await res.json();
            setMessages(data.messages || []);
            scrollToBottom();
            markAsRead(conversationId);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const markAsRead = async (conversationId: string) => {
        try {
            await fetch('/api/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId })
            });
        } catch (err) {
            console.error('Error marking read:', err);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const tempData = {
            id: 'temp-' + Date.now(),
            conversation_id: selectedConversation.id,
            sender_id: currentUserId,
            content: newMessage,
            created_at: new Date().toISOString(),
            read_at: null
        } as Message;

        setMessages(prev => [...prev, tempData]);
        setNewMessage('');
        scrollToBottom();

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: selectedConversation.id,
                    content: tempData.content
                })
            });

            if (!res.ok) throw new Error('Failed to send');

            // API returns the real message
            const { message } = await res.json();

            // Replace temp message
            setMessages(prev => prev.map(m => m.id === tempData.id ? message : m));

        } catch (err) {
            console.error('Error sending message:', err);
            // Show error state on message?
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectConversation = (conv: Conversation) => {
        setSelectedConversation(conv);
        fetchMessages(conv.id);
    };

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants?.find(p => p.id !== currentUserId);
    };

    const filteredConversations = conversations.filter(c => {
        const other = getOtherParticipant(c);
        return other?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (isLoadingConversations) return <LoadingState type="list" count={5} />;
    if (error) return <ErrorState message={error} onRetry={fetchConversations} />;

    return (
        <div className="flex h-[calc(100vh-120px)] bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-[var(--border)] flex flex-col">
                <div className="p-4 border-b border-[var(--border)]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search messages..."
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-2 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No conversations found
                        </div>
                    ) : (
                        filteredConversations.map(conv => {
                            const other = getOtherParticipant(conv);
                            const isSelected = selectedConversation?.id === conv.id;
                            const isUnread = conv.last_message && !conv.last_message.read_at && conv.last_message.sender_id !== currentUserId;

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full p-4 flex items-start gap-3 border-b border-[var(--border)] transition-colors text-left
                                        ${isSelected ? 'bg-[var(--primary-blue)]/10 border-l-2 border-l-[var(--primary-blue)]' : 'hover:bg-[var(--background)]'}
                                    `}
                                >
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                            {other?.profile_image_url ? (
                                                <img src={other.profile_image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        {/* Online status indicator could go here */}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className={`text-sm font-medium truncate ${isUnread ? 'text-white' : 'text-gray-300'}`}>
                                                {other?.full_name || 'Unknown User'}
                                            </span>
                                            {conv.last_message_at && (
                                                <span className="text-xs text-gray-500">
                                                    {new Date(conv.last_message_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate ${isUnread ? 'text-white font-medium' : 'text-gray-500'}`}>
                                            {conv.last_message?.sender_id === currentUserId && 'You: '}
                                            {conv.last_message?.content || 'No messages yet'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[var(--background)]">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background-secondary)]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {getOtherParticipant(selectedConversation)?.profile_image_url ? (
                                        <img src={getOtherParticipant(selectedConversation)?.profile_image_url!} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">
                                        {getOtherParticipant(selectedConversation)?.full_name || 'Unknown User'}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {getOtherParticipant(selectedConversation)?.job_title || 'User'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {isLoadingMessages ? (
                                <div className="flex justify-center p-8">
                                    {/* Use a simple spinner or valid LoadingState type */}
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === currentUserId;
                                    const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;

                                    return (
                                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-8 flex-shrink-0">
                                                {showAvatar && !isMe && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                                        {msg.sender?.profile_image_url ? (
                                                            <img src={msg.sender.profile_image_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`max-w-[70%] group`}>
                                                <div className={`
                                                    p-3 rounded-2xl text-sm 
                                                    ${isMe
                                                        ? 'bg-[var(--primary-blue)] text-white rounded-br-none'
                                                        : 'bg-[var(--background-secondary)] border border-[var(--border)] text-gray-200 rounded-bl-none'
                                                    }
                                                `}>
                                                    {msg.content}
                                                </div>
                                                <div className={`text-[10px] text-gray-500 mt-1 flex items-center gap-1 ${isMe ? 'justify-end' : ''}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && (
                                                        <span>
                                                            {msg.read_at ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3" />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-[var(--background-secondary)] border-t border-[var(--border)]">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <button type="button" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-2 bg-[var(--primary-blue)] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
