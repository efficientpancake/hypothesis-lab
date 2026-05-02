import { create } from "zustand";
import type { PersonaFields } from "./prompts";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface AppState {
  brief: string;
  setBrief: (v: string) => void;

  hypothesisOutput: string;
  setHypothesisOutput: (v: string) => void;
  appendHypothesisOutput: (chunk: string) => void;

  hypothesisDone: boolean;
  setHypothesisDone: (v: boolean) => void;

  hypothesisChat: ChatMessage[];
  appendHypothesisChatMessage: (m: ChatMessage) => void;
  appendHypothesisAssistantChunk: (chunk: string) => void;
  resetHypothesisChat: () => void;

  persona: PersonaFields | null;
  setPersona: (p: PersonaFields | null) => void;

  chatHistory: ChatMessage[];
  appendChatMessage: (m: ChatMessage) => void;
  appendAssistantChunk: (chunk: string) => void;
  resetChat: () => void;

  learningOutput: string;
  setLearningOutput: (v: string) => void;
  appendLearningOutput: (chunk: string) => void;

  learningDone: boolean;
  setLearningDone: (v: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  brief: "",
  setBrief: (v) => set({ brief: v }),

  hypothesisOutput: "",
  setHypothesisOutput: (v) => set({ hypothesisOutput: v }),
  appendHypothesisOutput: (chunk) =>
    set((s) => ({ hypothesisOutput: s.hypothesisOutput + chunk })),

  hypothesisDone: false,
  setHypothesisDone: (v) => set({ hypothesisDone: v }),

  hypothesisChat: [],
  appendHypothesisChatMessage: (m) =>
    set((s) => ({ hypothesisChat: [...s.hypothesisChat, m] })),
  appendHypothesisAssistantChunk: (chunk) =>
    set((s) => {
      const h = s.hypothesisChat;
      const last = h[h.length - 1];
      if (last && last.role === "assistant") {
        return {
          hypothesisChat: [
            ...h.slice(0, -1),
            { ...last, content: last.content + chunk },
          ],
        };
      }
      return {
        hypothesisChat: [...h, { role: "assistant", content: chunk }],
      };
    }),
  resetHypothesisChat: () => set({ hypothesisChat: [] }),

  persona: null,
  setPersona: (p) => set({ persona: p }),

  chatHistory: [],
  appendChatMessage: (m) =>
    set((s) => ({ chatHistory: [...s.chatHistory, m] })),
  appendAssistantChunk: (chunk) =>
    set((s) => {
      const h = s.chatHistory;
      const last = h[h.length - 1];
      if (last && last.role === "assistant") {
        return {
          chatHistory: [
            ...h.slice(0, -1),
            { ...last, content: last.content + chunk },
          ],
        };
      }
      return {
        chatHistory: [...h, { role: "assistant", content: chunk }],
      };
    }),
  resetChat: () => set({ chatHistory: [] }),

  learningOutput: "",
  setLearningOutput: (v) => set({ learningOutput: v }),
  appendLearningOutput: (chunk) =>
    set((s) => ({ learningOutput: s.learningOutput + chunk })),

  learningDone: false,
  setLearningDone: (v) => set({ learningDone: v }),
}));
