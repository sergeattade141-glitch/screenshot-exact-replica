import { createPersistentStore } from "./store";
import { settingsStore } from "./settings";

export type MessageRole = "user" | "assistant" | "notice";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const conversationsStore = createPersistentStore<Conversation[]>("wilwol.conversations", []);
export const useConversations = conversationsStore.useStore;

/** Builds a short title from the first user message. */
export function deriveTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "Nouvelle conversation";
  return clean.length > 48 ? clean.slice(0, 47).trimEnd() + "…" : clean;
}

function persistAllowed() {
  return settingsStore.get().saveLocalHistory;
}

// In-memory fallback when the user disables local history.
let ephemeral: Conversation[] = [];

export function listConversations(): Conversation[] {
  const items = persistAllowed() ? conversationsStore.get() : ephemeral;
  return [...items].sort((a, b) => b.updatedAt - a.updatedAt);
}

function write(fn: (list: Conversation[]) => Conversation[]) {
  if (persistAllowed()) conversationsStore.set(fn);
  else {
    ephemeral = fn(ephemeral);
    conversationsStore.set((l) => [...l]); // notify subscribers
  }
}

export function getConversation(id: string): Conversation | undefined {
  const items = persistAllowed() ? conversationsStore.get() : ephemeral;
  return items.find((c) => c.id === id);
}

export function createConversation(firstMessage?: string): Conversation {
  const now = Date.now();
  const conv: Conversation = {
    id: uid(),
    title: deriveTitle(firstMessage ?? ""),
    createdAt: now,
    updatedAt: now,
    messages: firstMessage
      ? [{ id: uid(), role: "user", content: firstMessage.trim(), createdAt: now }]
      : [],
  };
  write((l) => [conv, ...l]);
  return conv;
}

export function addMessage(convId: string, msg: Omit<Message, "id" | "createdAt">): Message {
  const full: Message = { ...msg, id: uid(), createdAt: Date.now() };
  write((l) =>
    l.map((c) => {
      if (c.id !== convId) return c;
      const isFirstUser = msg.role === "user" && !c.messages.some((m) => m.role === "user");
      return {
        ...c,
        title: isFirstUser ? deriveTitle(msg.content) : c.title,
        updatedAt: full.createdAt,
        messages: [...c.messages, full],
      };
    }),
  );
  return full;
}

export function removeMessage(convId: string, messageId: string) {
  write((l) =>
    l.map((c) =>
      c.id === convId ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) } : c,
    ),
  );
}

export function renameConversation(id: string, title: string) {
  const t = title.trim();
  if (!t) return;
  write((l) => l.map((c) => (c.id === id ? { ...c, title: t.slice(0, 80) } : c)));
}

export function deleteConversation(id: string) {
  write((l) => l.filter((c) => c.id !== id));
}

export function clearAllConversations() {
  ephemeral = [];
  conversationsStore.reset();
}

import { useMemo } from "react";
import { useSettings } from "./settings";

/** Hydration-safe sorted list of conversations. */
export function useConversationList(): Conversation[] {
  const raw = useConversations();
  const { saveLocalHistory } = useSettings();
  return useMemo(
    () => [...(saveLocalHistory ? raw : ephemeral)].sort((a, b) => b.updatedAt - a.updatedAt),
    [raw, saveLocalHistory],
  );
}
