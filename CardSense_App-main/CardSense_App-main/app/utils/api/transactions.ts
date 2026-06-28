import { apiRequest } from "./client";
import type { ApiResponse } from "./types";

export interface TransactionData {
  id: number;
  merchant: string;
  amount: string;
  category: string;
  card_actually_used?: number | null;
  card_actually_used_details?: {
    id: number;
    name: string;
    issuer: string;
  } | null;
  recommended_card?: number | null;
  recommended_card_details?: {
    id: number;
    name: string;
    issuer: string;
  } | null;
  notes?: string | null;
  actual_reward: string;
  optimal_reward: string;
  missed_reward: string;
  used_optimal_card: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardRecommendationData {
  category: string;
  amount: number;
  recommendation: {
    best_card: { card_id: number; card_name: string } | null;
    multiplier: number;
    rationale: string;
    top3: { card_id: number; card_name: string; multiplier: number }[];
  };
}

export async function createTransaction(data: {
  merchant: string;
  amount: number;
  category: string;
  card_actually_used?: number | null;
  notes?: string | null;
}): Promise<ApiResponse<TransactionData>> {
  try {
    const response = await apiRequest("/transactions/transactions/", {
      method: "POST",
      body: JSON.stringify({
        merchant: data.merchant,
        amount: data.amount,
        category: data.category,
        card_actually_used: data.card_actually_used || null,
        notes: data.notes || null,
      }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 400 ? "VALIDATION_ERROR" : "API_ERROR",
          message:
            result?.message ||
            result?.detail ||
            `Failed to create transaction (${response.status})`,
          details: result || undefined,
        },
      };
    }
    if (result?.success && result?.data)
      return { success: true, data: result.data, message: result.message };
    if (result?.data) return { success: true, data: result.data };
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

export async function getTransactions(): Promise<
  ApiResponse<TransactionData[]>
> {
  try {
    const response = await apiRequest("/transactions/transactions/", {
      method: "GET",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : "API_ERROR",
          message:
            result?.message ||
            result?.detail ||
            `Failed to fetch transactions (${response.status})`,
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

export async function getTransaction(
  transactionId: number | string,
): Promise<ApiResponse<TransactionData>> {
  try {
    const response = await apiRequest(
      `/transactions/transactions/${transactionId}/`,
      { method: "GET" },
    );
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 404 ? "NOT_FOUND" : "API_ERROR",
          message:
            result?.message ||
            result?.detail ||
            `Failed to fetch transaction (${response.status})`,
          details: result || undefined,
        },
      };
    }
    if (result?.success && result?.data)
      return { success: true, data: result.data };
    if (result?.id) return { success: true, data: result };
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

export async function deleteTransaction(
  transactionId: number | string,
): Promise<ApiResponse<any>> {
  try {
    const response = await apiRequest(
      `/transactions/transactions/${transactionId}/`,
      { method: "DELETE" },
    );
    const text = await response.text().catch(() => "");
    const json = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 404 ? "NOT_FOUND" : "API_ERROR",
          message:
            json?.message ||
            json?.detail ||
            `Failed to delete transaction (${response.status})`,
          details: json || undefined,
        },
      };
    }

    return {
      success: true,
      data: json?.data ?? null,
      message: json?.message || "Transaction deleted successfully",
    };
  } catch (e: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: e?.message || "Network error" },
    };
  }
}

export async function getCardRecommendation(data: {
  category: string;
  amount?: number;
}): Promise<ApiResponse<CardRecommendationData>> {
  try {
    const response = await apiRequest("/transactions/recommend-card/", {
      method: "POST",
      body: JSON.stringify({
        category: data.category,
        amount: data.amount || 0,
      }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : "API_ERROR",
          message:
            result?.error ||
            result?.message ||
            result?.detail ||
            `Failed to get recommendation (${response.status})`,
          details: result || undefined,
        },
      };
    }
    if (result?.success && result?.data)
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
