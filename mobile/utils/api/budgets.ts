import { apiRequest } from "./client";
import type { ApiResponse } from "./types";

export interface BudgetListItem {
  id: number;
  year_month: string; // YYYY-MM
  amount: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  thresholds?: any;
  fired_flags?: any;
}

export async function getBudgets(): Promise<ApiResponse<BudgetListItem[]>> {
  try {
    const response = await apiRequest("/budgets/", { method: "GET" });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : "API_ERROR",
          message:
            result?.message ||
            result?.detail ||
            `Failed to fetch budgets (${response.status})`,
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

export async function createBudget(data: {
  amount: number;
  year_month?: string;
}): Promise<ApiResponse<any>> {
  try {
    const response = await apiRequest("/budgets/", {
      method: "POST",
      body: JSON.stringify({
        amount: data.amount,
        year_month: data.year_month || "",
      }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 400 ? "VALIDATION_ERROR" : "API_ERROR",
          message:
            result?.error?.message ||
            result?.message ||
            result?.detail ||
            `Failed to create budget (${response.status})`,
          details: result || undefined,
        },
      };
    }
    if (result?.success)
      return { success: true, data: result.data, message: result.message };
    return { success: true, data: result };
  } catch (e: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: e?.message || "Network error" },
    };
  }
}

export async function deleteBudget(
  year_month: string,
): Promise<ApiResponse<any>> {
  try {
    const response = await apiRequest(
      `/budgets/?year_month=${encodeURIComponent(year_month)}`,
      {
        method: "DELETE",
      },
    );
    const text = await response.text().catch(() => "");
    const json = text ? JSON.parse(text) : null;
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 404 ? "NOT_FOUND" : "API_ERROR",
          message:
            json?.error?.message ||
            json?.message ||
            json?.detail ||
            `Failed to delete budget (${response.status})`,
          details: json || undefined,
        },
      };
    }
    return {
      success: true,
      data: json?.data ?? null,
      message: json?.message || "Budget deleted successfully",
    };
  } catch (e: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: e?.message || "Network error" },
    };
  }
}
