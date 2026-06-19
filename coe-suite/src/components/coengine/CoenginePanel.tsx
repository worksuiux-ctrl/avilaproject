import { useRef, useEffect, useState, useCallback } from "react";
import { ChatBubble } from "@coe/design-system";
import { useCoengineStore } from "./CoengineStore";
import { useUserStore } from "../../stores/userStore";
import type { ChatMessage } from "./types";

export function CoenginePanel() {
  const { messages, isMinimized, toggleOpen, addUserMessage, handleQuickReply } =
    useCoengineStore();
  const user = useUserStore((s) => s.current);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isMinimized) inputRef.current?.focus();
  }, [isMinimized]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addUserMessage(text);
    setTimeout(() => {
      useCoengineStore.getState().addBotMessage(
        "Gracias por tu mensaje. Un agente revisará tu consulta y te responderá a la brevedad.",
        [
          { id: "crear-ticket", label: "Crear un Ticket", flow: "crear-ticket" },
          { id: "soporte-tecnico", label: "Soporte Técnico", flow: "soporte-tecnico" },
          { id: "reportar-falla", label: "Reportar Falla en Interfaz", flow: "reportar-falla" },
          { id: "resolver-dura", label: "Resolver una Duda", flow: "resolver-dura" },
        ]
      );
    }, 600);
  }, [input, addUserMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const names: string[] = [];
    for (let i = 0; i < files.length; i++) names.push(files[i].name);
    setAttachments((prev) => [...prev, ...names]);
    e.target.value = "";
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div
      className={`
        fixed bottom-24 right-5 z-[9999]
        w-[380px] max-w-[calc(100vw-40px)] max-h-[660px] h-[600px]
        bg-white rounded-corner-m shadow-card
        flex flex-col overflow-hidden
        border border-[var(--color-neutro-200)]
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isMinimized ? "opacity-0 pointer-events-none scale-95 translate-y-4" : "opacity-100 scale-100 translate-y-0"}
      `}
    >
      {/* Header */}
      <div className="flex items-center px-4 py-3.5 bg-[var(--color-verde-100)] text-white shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight tracking-tight">COENGINE</p>
          <p className="text-[11px] font-medium opacity-80 leading-small">Asistente Inteligente</p>
        </div>
        <button
          onClick={() => toggleOpen()}
          className="w-7 h-7 flex items-center justify-center rounded-corner-xs hover:bg-white/20 transition-colors text-white/80 hover:text-white shrink-0"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
            <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L8 6.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L9.06 8l4.72 4.72a.75.75 0 1 1-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 bg-[var(--color-neutro-100)]">
        {messages.map((msg: ChatMessage) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div className="max-w-[85%]">
              {msg.sender === "user" ? (
                <ChatBubble
                  message={msg.text}
                  time={formatTime(msg.timestamp)}
                  sent={true}
                  avatar={
                    <div className="w-6 h-6 rounded-corner-full bg-[var(--color-verde-100)] flex items-center justify-center text-white font-bold text-[9px]">
                      {user.initials}
                    </div>
                  }
                  name={user.nombre}
                />
              ) : (
                <div className="flex items-end gap-2 flex-row">
                  <div className="flex-shrink-0">
                    <img src={`${import.meta.env.BASE_URL}Icono%20coe.png`} alt="COE" className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col max-w-[70%] items-start">
                    <span className="text-xs text-[var(--color-text-grey)] mb-1">COENGINE</span>
                    <div className="px-4 py-2 text-sm rounded-corner-m rounded-bl-corner-xs bg-[var(--color-surface-darkwhite)] text-[var(--color-text-darkgrey)] border border-[var(--color-neutro-200)]">
                      {msg.text}
                    </div>
                    <span className="text-xs text-[var(--color-text-grey)] mt-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              )}
            </div>
            {msg.sender === "bot" && msg.quickReplies && msg.quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {msg.quickReplies.map((qr) => (
                  <button
                    key={qr.id}
                    onClick={() => handleQuickReply(qr.id, qr.label)}
                    className={`
                      px-3 py-1.5 text-[12px] leading-small font-medium
                      rounded-corner-full border
                      border-[var(--color-verde-100)] text-[var(--color-verde-100)]
                      bg-white
                      hover:bg-[var(--color-verde-100)] hover:text-white
                      active:scale-95
                      transition-all duration-150 cursor-pointer
                      shadow-sm
                    `}
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-[var(--color-neutro-200)] bg-white px-3 pt-2.5 pb-3">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 px-0.5">
            {attachments.map((name, i) => (
              <div
                key={`att-${i}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--color-neutro-100)] rounded-corner-xs border border-[var(--color-neutro-200)] text-[11px] text-[var(--color-neutro-600)]"
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current shrink-0 text-[var(--color-ind-azul)]">
                  <path d="M4.5 2.5a3.5 3.5 0 0 1 7 0v7a4 4 0 0 1-8 0V5a.5.5 0 0 1 1 0v4.5a3 3 0 0 0 6 0v-7a2.5 2.5 0 0 0-5 0v7a1.5 1.5 0 0 0 3 0V5a.5.5 0 0 1 1 0v4.5a2.5 2.5 0 0 1-5 0v-7Z" />
                </svg>
                <span className="truncate max-w-[100px]">{name}</span>
                <button
                  onClick={() => removeAttachment(i)}
                  className="ml-0.5 hover:text-[var(--color-ind-rojo)] transition-colors"
                  aria-label="Quitar archivo"
                >
                  <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-9 h-9 flex items-center justify-center rounded-corner-full text-[var(--color-neutro-400)] hover:text-[var(--color-verde-100)] hover:bg-[var(--color-verde-100)]/10 transition-all shrink-0"
            aria-label="Adjuntar archivo"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" /><path d="M5 12h14" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="w-full bg-[var(--color-neutro-100)] rounded-corner-full pl-4 pr-4 py-2.5 text-[13px] leading-small outline-none border border-[var(--color-neutro-200)] focus:border-[var(--color-verde-100)]/40 focus:bg-white transition-all placeholder:text-[var(--color-neutro-400)]"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-corner-full bg-[var(--color-verde-100)] text-white hover:bg-[var(--color-verde-100)]/90 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0 shadow-md shadow-[var(--color-verde-100)]/25"
            aria-label="Enviar mensaje"
          >
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
      </div>
    </div>
  );
}
