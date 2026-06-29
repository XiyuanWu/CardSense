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

export async function fetchChatHistory(): Promise<
  ApiResponse<{ messages: ChatMessage[] }>
> {
  try {
    const response = await apiRequest("/chat/history/");
    const json = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: json?.error || { message: "Could not load chat history" },
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

export async function sendChatMessage(
  message: string,
): Promise<ApiResponse<ChatReplyData>> {
  try {
    const response = await apiRequest("/chat/", {
      method: "POST",
      body: JSON.stringify({ message }),
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
