import type { ChatMessage } from '../services/chat.service';
import { authService } from '../services/auth.service';

/** Keep chat history for 7 days, then reset to welcome message. */
export const CHAT_HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const STORAGE_PREFIX = 'cardsense_chat_history';

export const CHAT_WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Hi! Ask about your cards, rewards, or how to save money. I use your wallet data via Gemini — general questions welcome.',
};

interface StoredChatHistory {
  savedAt: number;
  messages: ChatMessage[];
}

function storageKey(): string {
  const user = authService.getCurrentUser();
  const id = user?.id ?? user?.email ?? 'guest';
  return `${STORAGE_PREFIX}_${id}`;
}

function isValidMessage(msg: unknown): msg is ChatMessage {
  if (!msg || typeof msg !== 'object') return false;
  const m = msg as ChatMessage;
  return (
    (m.role === 'user' || m.role === 'assistant') &&
    typeof m.content === 'string' &&
    m.content.trim().length > 0
  );
}

export function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [CHAT_WELCOME_MESSAGE];

    const parsed = JSON.parse(raw) as StoredChatHistory;
    if (!parsed?.savedAt || !Array.isArray(parsed.messages)) {
      return [CHAT_WELCOME_MESSAGE];
    }

    if (Date.now() - parsed.savedAt > CHAT_HISTORY_TTL_MS) {
      localStorage.removeItem(storageKey());
      return [CHAT_WELCOME_MESSAGE];
    }

    const messages = parsed.messages.filter(isValidMessage);
    return messages.length > 0 ? messages : [CHAT_WELCOME_MESSAGE];
  } catch {
    return [CHAT_WELCOME_MESSAGE];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    const valid = messages.filter(isValidMessage);
    if (valid.length === 0) return;

    const payload: StoredChatHistory = {
      savedAt: Date.now(),
      messages: valid,
    };
    localStorage.setItem(storageKey(), JSON.stringify(payload));
  } catch {
    // ignore quota / private mode errors
  }
}

export function clearChatHistory(): void {
  try {
    localStorage.removeItem(storageKey());
  } catch {
    // ignore
  }
}
