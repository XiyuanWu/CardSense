import { apiRequest } from "./client";
import type { ApiResponse } from "./types";

export interface DashboardSummaryData {
  summary: {
    total_spent_this_month: number;
    total_rewards_this_month: number;
    active_budgets: number;
    budget_alerts: number;
  };
  budget_status: any[];
  recent_transactions: any[];
}

export async function getDashboardSummary(): Promise<
  ApiResponse<DashboardSummaryData>
> {
  try {
    const response = await apiRequest("/analytics/dashboard/", {
      method: "GET",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 401 ? "UNAUTHORIZED" : "API_ERROR",
          message:
            result?.error?.message ||
            result?.message ||
            result?.detail ||
            `Failed to fetch dashboard (${response.status})`,
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
