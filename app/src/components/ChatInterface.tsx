"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, Program, StudentProfile } from "@/types";

interface ChatInterfaceProps {
  profile: StudentProfile;
  filteredPrograms: Program[];
  onBack: () => void;
}

export default function ChatInterface({
  profile,
  filteredPrograms,
  onBack,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send initial greeting from AI when chat opens
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      sendInitialMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendInitialMessage = async () => {
    setIsLoading(true);
    const initialUserMsg: ChatMessage = {
      role: "user",
      content: `Merhaba! Profilimi doldurdum. ${filteredPrograms.length > 0 ? `Puanıma (${profile.puan} ${profile.puanTuru}) ve kriterlerime göre ${filteredPrograms.length} program bulundu.` : `Puanıma (${profile.puan} ${profile.puanTuru}) ve kriterlerime göre uygun program bulunamadı.`} Bana rehberlik edebilir misin?`,
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [initialUserMsg],
          profile,
          filteredPrograms,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages([
          {
            role: "assistant",
            content: `⚠️ Bir hata oluştu: ${data.error}. Lütfen GEMINI_API_KEY'in doğru yapılandırıldığından emin olun.`,
          },
        ]);
      } else {
        setMessages([
          initialUserMsg,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch {
      setMessages([
        {
          role: "assistant",
          content:
            "⚠️ Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          profile,
          filteredPrograms,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: `⚠️ Hata: ${data.error}`,
          },
        ]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "⚠️ Mesaj gönderilemedi. Lütfen tekrar deneyin.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          ← Geri Dön (Formu Düzenle)
        </button>
      </div>

      {/* Advisor Info */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <div className="bg-blue-600 text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold text-sm flex-shrink-0">
          AI
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">
            20 yıllık rehber öğretmen
          </p>
          <p className="text-xs text-gray-500">
            Empatik sohbet • Yönlendirme odaklı
          </p>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Hazır
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 text-sm mt-8">
            Danışmanınız yükleniyor...
          </div>
        )}

        {messages
          .filter((m) => m.role !== "user" || messages.indexOf(m) !== 0)
          .map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="bg-blue-600 text-white rounded-xl w-8 h-8 flex items-center justify-center font-bold text-xs flex-shrink-0 mr-2 mt-1">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.content}
              </div>
            </div>
          ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-blue-600 text-white rounded-xl w-8 h-8 flex items-center justify-center font-bold text-xs flex-shrink-0 mr-2 mt-1">
              AI
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Formla başlayan sohbetten sonra buradan devam edebilirsin."
            rows={2}
            disabled={isLoading}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm h-fit"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
