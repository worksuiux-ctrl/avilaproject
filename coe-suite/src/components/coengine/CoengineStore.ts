import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, QuickReplyOption } from "./types";
import { findFlowByQuickReplyId } from "./mockFlows";

interface CoengineState {
  isOpen: boolean;
  isMinimized: boolean;
  isHidden: boolean;
  messages: ChatMessage[];
  unreadCount: number;

  toggleOpen: () => void;
  setOpen: (v: boolean) => void;
  setMinimized: (v: boolean) => void;
  toggleHidden: () => void;
  addUserMessage: (text: string) => void;
  addBotMessage: (text: string, quickReplies?: QuickReplyOption[]) => void;
  handleQuickReply: (qrId: string, qrLabel: string) => void;
  dismissQuickReplies: () => void;
  markAllRead: () => void;
  reset: () => void;
}

let msgCounter = 0;
function nextId(): string {
  msgCounter += 1;
  return `msg-${Date.now()}-${msgCounter}`;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  text: "¡Hola! Soy COENGINE, tu asistente inteligente de COE Suite. ¿En qué puedo ayudarte?",
  sender: "bot",
  timestamp: Date.now(),
  quickReplies: [
    { id: "crear-ticket", label: "Crear un Ticket", flow: "crear-ticket" },
    { id: "soporte-tecnico", label: "Soporte Técnico", flow: "soporte-tecnico" },
    { id: "reportar-falla", label: "Reportar Falla en Interfaz", flow: "reportar-falla" },
    { id: "resolver-dura", label: "Resolver una Duda", flow: "resolver-dura" },
  ],
};

export const useCoengineStore = create<CoengineState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isMinimized: false,
      isHidden: false,
      messages: [WELCOME_MESSAGE],
      unreadCount: 0,

      toggleOpen: () => {
        const next = !get().isOpen;
        set({ isOpen: next, isMinimized: false, unreadCount: next ? 0 : get().unreadCount });
      },

      setOpen: (v: boolean) => set({ isOpen: v, isMinimized: false, unreadCount: v ? 0 : get().unreadCount }),

      setMinimized: (v: boolean) => set({ isMinimized: v }),

      toggleHidden: () => set({ isHidden: !get().isHidden }),

      addUserMessage: (text: string) => {
        const msg: ChatMessage = { id: nextId(), text, sender: "user", timestamp: Date.now() };
        set((s) => ({ messages: [...s.messages, msg] }));
      },

      addBotMessage: (text: string, quickReplies?: QuickReplyOption[]) => {
        const msg: ChatMessage = {
          id: nextId(),
          text,
          sender: "bot",
          timestamp: Date.now(),
          quickReplies,
        };
        set((s) => ({
          messages: [...s.messages, msg],
          unreadCount: s.isOpen ? s.unreadCount : s.unreadCount + 1,
        }));
      },

      handleQuickReply: (qrId: string, qrLabel: string) => {
        const state = get();
        state.addUserMessage(qrLabel);

        state.dismissQuickReplies();

        const match = findFlowByQuickReplyId(qrId);
        if (match) {
          const { flow, stepIndex } = match;
          const nextStepIndex = stepIndex + 1;
          if (nextStepIndex < flow.steps.length) {
            const nextStep = flow.steps[nextStepIndex];
            state.addBotMessage(nextStep.botMessage, nextStep.quickReplies);
          } else {
            state.addBotMessage("Flujo completado. ¿Hay algo más en lo que pueda ayudarte?", [
              { id: "crear-ticket", label: "Crear un Ticket", flow: "crear-ticket" },
              { id: "soporte-tecnico", label: "Soporte Técnico", flow: "soporte-tecnico" },
              { id: "reportar-falla", label: "Reportar Falla en Interfaz", flow: "reportar-falla" },
              { id: "resolver-dura", label: "Resolver una Duda", flow: "resolver-dura" },
            ]);
          }
        } else {
          state.addBotMessage("No entendí esa opción. ¿Puedes intentar de nuevo?", [
            { id: "crear-ticket", label: "Crear un Ticket", flow: "crear-ticket" },
            { id: "soporte-tecnico", label: "Soporte Técnico", flow: "soporte-tecnico" },
            { id: "reportar-falla", label: "Reportar Falla en Interfaz", flow: "reportar-falla" },
            { id: "resolver-dura", label: "Resolver una Duda", flow: "resolver-dura" },
          ]);
        }
      },

      dismissQuickReplies: () => {
        set((s) => {
          const lastIdx = s.messages.findLastIndex((m) => m.sender === "bot" && m.quickReplies && m.quickReplies.length > 0);
          if (lastIdx === -1) return s;
          const updated = [...s.messages];
          updated[lastIdx] = { ...updated[lastIdx], quickReplies: undefined };
          return { messages: updated };
        });
      },

      markAllRead: () => set({ unreadCount: 0 }),

      reset: () => set({ messages: [WELCOME_MESSAGE], unreadCount: 0 }),
    }),
    {
      name: "coe-coengine",
      partialize: (state) => ({
        messages: state.messages,
        isHidden: state.isHidden,
      }),
    }
  )
);
