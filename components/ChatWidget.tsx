"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Mail, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Message {
    role: "user" | "model";
    text: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "model",
            text: "Hi! I'm the SwiftAI Recruit assistant. How can I help you today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        if (isChatOpen) setIsChatOpen(false);
    };

    const openChat = () => {
        setIsOpen(false);
        setIsChatOpen(true);
    };

    const closeChat = () => {
        setIsChatOpen(false);
    };

    const handleWhatsApp = () => {
        alert("WhatsApp integration Coming Soon!");
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatOpen]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages((prev) => [
                    ...prev,
                    { role: "model", text: data.reply },
                ]);
            } else {
                console.error("Error:", data.error);
                setMessages((prev) => [
                    ...prev,
                    { role: "model", text: "Sorry, I encountered an error. Please try again." },
                ]);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "model", text: "Sorry, I am having trouble connecting. Please check your internet connection." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Chat Window */}
            {isChatOpen && (
                <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gray-900/80 backdrop-blur-md p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-lg">
                                <Image src="/icon.png" alt="SwiftAI" width={24} height={24} className="rounded" />
                            </div>
                            <h3 className="font-semibold">SwiftAI Recruit Chat</h3>
                        </div>
                        <button
                            onClick={closeChat}
                            className="hover:bg-blue-700 p-1 rounded transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none shadow-sm flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Menu Items */}
            {isOpen && !isChatOpen && (
                <div className="flex flex-col gap-3 items-end mb-2 animate-in fade-in slide-in-from-bottom-5 duration-200">
                    {/* Contact Form Button */}
                    <Link
                        href="/contact"
                        className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all hover:scale-105 group"
                    >
                        <span className="font-medium text-sm">Contact Form</span>
                        <div className="bg-red-500 text-white p-2 rounded-full group-hover:bg-red-600 transition-colors">
                            <Mail size={18} />
                        </div>
                    </Link>

                    {/* WhatsApp Button */}
                    <button
                        onClick={handleWhatsApp}
                        className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all hover:scale-105 group"
                    >
                        <span className="font-medium text-sm">WhatsApp</span>
                        <div className="bg-green-500 text-white p-2 rounded-full group-hover:bg-green-600 transition-colors">
                            <Phone size={18} />
                        </div>
                    </button>

                    {/* Chatbot Button */}
                    <button
                        onClick={openChat}
                        className="flex items-center gap-3 bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all hover:scale-105 group"
                    >
                        <span className="font-medium text-sm">Chatbot</span>
                        <div className="bg-white/30 backdrop-blur-sm p-1.5 rounded-full group-hover:bg-white/50 transition-colors overflow-hidden">
                            <Image src="/icon.png" alt="SwiftAI" width={28} height={28} className="rounded-full" />
                        </div>
                    </button>
                </div>
            )}

            {/* Main FAB */}
            <button
                onClick={toggleMenu}
                className={`p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen || isChatOpen ? "bg-gray-700" : "bg-(--primary-blue)"
                    } text-white`}
            >
                {isOpen || isChatOpen ? (
                    <X size={28} />
                ) : (
                    <MessageCircle size={28} />
                )}
            </button>
        </div>
    );
}
