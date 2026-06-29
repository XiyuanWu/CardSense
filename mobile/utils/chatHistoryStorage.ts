import { Platform } from "react-native";
import type { ChatMessage } from "./api/chat";

/** Keep chat history for 7 days (web); native keeps until app process ends. */
export const CHAT_HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const STORAGE_KEY = "@CardSense:chatHistory";

export const CHAT_WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! Ask about your cards, rewards, or saving money. Answers use your wallet via Gemini.",
};

interface StoredChatHistory {
  savedAt: number;
  messages: ChatMessage[];
}

let sessionCache: StoredChatHistory | null = null;

function isValidMessage(msg: unknown): msg is ChatMessage {
  if (!msg || typeof msg !== "object") return false;
  const m = msg as ChatMessage;
  return (
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    m.content.trim().length > 0
  );
}

function readWeb(): StoredChatHistory | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredChatHistory;
  } catch {
    return null;
  }
}

function writeWeb(payload: StoredChatHistory): void {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function loadChatHistory(): ChatMessage[] {
  const stored = readWeb() ?? sessionCache;
  if (!stored?.savedAt || !Array.isArray(stored.messages)) {
    return [CHAT_WELCOME_MESSAGE];
  }

  if (Date.now() - stored.savedAt > CHAT_HISTORY_TTL_MS) {
    sessionCache = null;
    if (Platform.OS === "web") {
      try {
        window.localStorage?.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    return [CHAT_WELCOME_MESSAGE];
  }

  const messages = stored.messages.filter(isValidMessage);
  return messages.length > 0 ? messages : [CHAT_WELCOME_MESSAGE];
}

export function saveChatHistory(messages: ChatMessage[]): void {
  const valid = messages.filter(isValidMessage);
  if (valid.length === 0) return;

  const payload: StoredChatHistory = {
    savedAt: Date.now(),
    messages: valid,
  };

  sessionCache = payload;
  writeWeb(payload);
}
