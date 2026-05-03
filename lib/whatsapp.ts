/** Official support WhatsApp (E.164 without + for wa.me links). */
export const WHATSAPP_E164_LOCAL = '2349019212601';

export function whatsAppChatUrl(message?: string): string {
    const base = `https://wa.me/${WHATSAPP_E164_LOCAL}`;
    if (!message?.trim()) return base;
    return `${base}?text=${encodeURIComponent(message.trim())}`;
}
