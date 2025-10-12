import React, { useEffect, useState } from "react";
import { sendWhatsAppMessage } from "../lib/integrations/whatsapp";
import { CloseIcon, WhatsAppIcon } from "./icons/Icons";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultTo?: string;
  defaultMessage?: string;
  context?: {
    clientId?: string;
    clientName?: string;
    quoteId?: string;
  };
  onSent?: () => void;
};

const SendWhatsAppModal: React.FC<Props> = ({ isOpen, onClose, defaultTo, defaultMessage, context, onSent }) => {
  const [to, setTo] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; info: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTo(defaultTo || "");
      setMessage(defaultMessage || "");
      setResult(null); // Reset result state
      setSending(false); // Reset sending state
    }
  }, [isOpen, defaultTo, defaultMessage]);

  if (!isOpen) return null;

  const onSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await sendWhatsAppMessage(to, message, {
        clientId: context?.clientId,
        clientName: context?.clientName,
        metadata: context?.quoteId ? { quoteId: context.quoteId } : undefined,
      });
      setResult({ ok: true, info: `Message queued (id: ${res.id || "n/a"})` });
      if (onSent) {
        onSent();
      }
    } catch (e: any) {
      setResult({ ok: false, info: e?.message || String(e) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 transform transition-all dark:bg-gray-800">
        <div className="p-6 border-b flex items-center justify-between dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <WhatsAppIcon />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Send WhatsApp</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To (phone)</label>
            <input
              type="tel"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="+44..."
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              placeholder="Type your message…"
            />
          </div>

          {result && (
            <div className={`p-2 rounded ${result.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              {result.ok ? "✅ " : "❌ "}{result.info}
            </div>
          )}
        </div>

        <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3 dark:bg-gray-900/50 dark:border-t dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button onClick={onSend} disabled={sending || !to || !message.trim()} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-semibold shadow-md text-sm disabled:bg-gray-400">
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendWhatsAppModal;
