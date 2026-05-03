"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Mail, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { whatsAppChatUrl } from "@/lib/whatsapp";

interface Message {
    role: "user" | "model";
    text: string;
}

const assistantMarkdownComponents: Components = {
    p: ({ children }) => (
        <p className="mb-2 last:mb-0 leading-relaxed text-gray-800">{children}</p>
    ),
    h1: ({ children }) => (
        <h4 className="mb-2 mt-3 first:mt-0 text-base font-bold text-gray-900">{children}</h4>
    ),
    h2: ({ children }) => (
        <h4 className="mb-2 mt-3 first:mt-0 text-[0.95rem] font-bold text-gray-900">{children}</h4>
    ),
    h3: ({ children }) => (
        <h5 className="mb-1.5 mt-2 first:mt-0 text-sm font-semibold text-gray-900">{children}</h5>
    ),
    h4: ({ children }) => (
        <h6 className="mb-1.5 mt-2 first:mt-0 text-sm font-semibold text-gray-800">{children}</h6>
    ),
    ul: ({ children }) => (
        <ul className="mb-2 list-disc space-y-1 pl-5 text-gray-800 last:mb-0">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="mb-2 list-decimal space-y-1 pl-5 text-gray-800 last:mb-0">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed [&>p]:mb-0">{children}</li>,
    a: ({ href, children }) => (
        <a
            href={href}
            className="font-medium text-blue-600 underline decoration-blue-600/40 underline-offset-2 hover:text-blue-700"
            target="_blank"
            rel="noopener noreferrer"
        >
            {children}
        </a>
    ),
    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
    blockquote: ({ children }) => (
        <blockquote className="my-2 border-l-4 border-blue-200 pl-3 text-gray-700 italic">
            {children}
        </blockquote>
    ),
    hr: () => <hr className="my-3 border-gray-200" />,
    pre: ({ children }) => (
        <pre className="my-2 overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs text-gray-900 [&>code]:block [&>code]:bg-transparent [&>code]:p-0 [&>code]:font-mono [&>code]:text-[0.85rem] [&>code]:text-gray-900">
            {children}
        </pre>
    ),
    code: ({ className, children, ...props }) => (
        <code
            className={`rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.85em] text-gray-900 ${className ?? ""}`}
            {...props}
        >
            {children}
        </code>
    ),
    table: ({ children }) => (
        <div className="my-2 overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[12rem] border-collapse text-xs">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
    th: ({ children }) => (
        <th className="border-b border-gray-200 px-2 py-1.5 text-left font-semibold text-gray-900">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="border-b border-gray-100 px-2 py-1.5 text-gray-800">{children}</td>
    ),
};

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

    const openWhatsApp = () => {
        window.open(whatsAppChatUrl(), "_blank", "noopener,noreferrer");
        setIsOpen(false);
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
                <div className="mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-lg bg-white text-gray-900 shadow-2xl [color-scheme:light] animate-in fade-in slide-in-from-bottom-5 duration-300 md:w-[400px]">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-gray-900/80 p-4 text-white backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-white/10 p-1.5 backdrop-blur-sm">
                                <Image src="/icon.png" alt="SwiftAI" width={24} height={24} className="rounded" />
                            </div>
                            <h3 className="text-base font-semibold leading-tight text-white">SwiftAI Recruit Chat</h3>
                        </div>
                        <button
                            onClick={closeChat}
                            className="hover:bg-blue-700 p-1 rounded transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === "user"
                                        ? "rounded-br-none bg-blue-600 text-white"
                                        : "rounded-bl-none border border-gray-200 bg-white text-gray-800 shadow-sm"
                                        }`}
                                >
                                    {msg.role === "user" ? (
                                        <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                                    ) : (
                                        <div className="min-w-0 break-words">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={assistantMarkdownComponents}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    )}
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
                    <div className="flex gap-2 border-t border-gray-200 bg-white p-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm !text-neutral-900 caret-neutral-900 shadow-none placeholder:!text-neutral-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* WhatsApp */}
                    <button
                        type="button"
                        onClick={openWhatsApp}
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
