import { apiRequest } from "./client";
import type { ApiResponse } from "./types";

export interface CardData {
  id: number;
  issuer: string;
  name: string;
  annual_fee: string;
  ftf: boolean;
  reward_rules?: any[];
  benefits?: any[];
}

export interface UserCardData {
  id: number;
  card: number;
  card_id: number;
  card_name: string;
  is_active: boolean;
  notes?: string;
  card_details?: CardData;
}

export async function getAvailableCards(): Promise<ApiResponse<CardData[]>> {
  try {
    const response = await apiRequest("/cards/cards/", { method: "GET" });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : "API_ERROR",
          message:
            result?.message ||
            result?.detail ||
            `Failed to fetch cards (${response.status})`,
          details: result || undefined,
        },
      };
    }
    if (result?.success && Array.isArray(result.data))
      return { success: true, data: result.data };
    if (Array.isArray(result)) return { success: true, data: result };
    if (Array.isArray(result?.data))
      return { success: true, data: result.data };
    return {
      success: false,
      error: {
        code: "INVALID_RESPONSE",
        message: "Unexpected response format from server",
      },
    };
  } catch (e: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: e?.message || "Network error" },
    };
  }
}

export async function getUserCards(): Promise<ApiResponse<UserCardData[]>> {
  try {
    const response = await apiRequest("/cards/user-cards/", { method: "GET" });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : "API_ERROR",
          message:
            result?.message ||
            result?.detail ||
            `Failed to fetch user cards (${response.status})`,
          details: result || undefined,
        },
      };
    }
    if (result?.success && Array.isArray(result.data))
      return { success: true, data: result.data };
    if (Array.isArray(result)) return { success: true, data: result };
    if (Array.isArray(result?.data))
      return { success: true, data: result.data };
    return {
      success: false,
      error: {
        code: "INVALID_RESPONSE",
        message: "Unexpected response format from server",
      },
    };
  } catch (e: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: e?.message || "Network error" },
    };
  }
}

export async function addUserCard(cardId: number): Promise<ApiResponse<any>> {
  try {
    const response = await apiRequest("/cards/user-cards/", {
      method: "POST",
      body: JSON.stringify({ card: cardId, is_active: true }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      let msg: string =
        result?.detail ||
        result?.message ||
        `Failed to add card (${response.status})`;

      if (
        !result?.detail &&
        !result?.message &&
        result &&
        typeof result === "object"
      ) {
        const firstVal = Object.values(result as Record<string, any>)[0];
        if (Array.isArray(firstVal) && firstVal.length) {
          msg = String(firstVal[0]);
        }
      }
      return {
        success: false,
        error: {
          code: "API_ERROR",
          message: msg,
          details: result || undefined,
        },
      };
    }
    if (result?.success) return result;
    return { success: true, data: result };
  } catch (e: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: e?.message || "Network error" },
    };
  }
}

export async function deleteUserCard(
  userCardId: number,
): Promise<ApiResponse<any>> {
  try {
    const response = await apiRequest(`/cards/user-cards/${userCardId}/`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        success: false,
        error: {
          code: "API_ERROR",
          message: text || `Failed to delete card (${response.status})`,
        },
      };
    }
    return { success: true, data: null };
  } catch (e: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: e?.message || "Network error" },
    };
  }
}
