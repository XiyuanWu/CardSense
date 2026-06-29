import { apiRequest } from "./client";
import type { ApiResponse } from "./types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatReplyData {
  reply: string;
  hints: unknown[];
  used_fallback?: boolean;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
): Promise<ApiResponse<ChatReplyData>> {
  try {
    const response = await apiRequest("/chat/", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
    const json = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: json?.error || { message: "Chat request failed" },
      };
    }
    return json;
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Network error. Try again.",
      },
    };
  }
}
