import { apiService } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatHint {
  category: string;
  category_tag: string;
  best_card: { card_id: number; card_name: string } | null;
  multiplier: number;
  rationale: string;
  alternatives: { card_id: number; card_name: string; multiplier: number }[];
}

export interface ChatReplyData {
  reply: string;
  hints: ChatHint[];
  used_fallback?: boolean;
}

export interface ChatHistoryData {
  messages: ChatMessage[];
}

export const chatService = {
  async fetchHistory() {
    return apiService.get<ChatHistoryData>('/chat/history/');
  },

  async sendMessage(message: string) {
    return apiService.post<ChatReplyData>('/chat/', { message });
  },
};
