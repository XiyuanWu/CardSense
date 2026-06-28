import { apiRequest } from "./client";
import type { ApiResponse } from "./types";

export async function registerUser(data: {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
}): Promise<ApiResponse<{ user: any }>> {
  try {
    const response = await apiRequest("/auth/register/", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        first_name: data.first_name,
        last_name: data.last_name,
      }),
    });

    const result = await response.json().catch(() => null);

    if (response.ok) {
      if (result?.success && result?.data) return result;
      return {
        success: true,
        data: { user: result?.data?.user || result?.user || result },
      };
    }

    const message =
      result?.error?.message ||
      result?.detail ||
      result?.message ||
      `Registration failed (${response.status})`;

    return {
      success: false,
      error: {
        code:
          response.status === 400
            ? "VALIDATION_ERROR"
            : response.status === 403
              ? "FORBIDDEN"
              : response.status === 401
                ? "UNAUTHORIZED"
                : "API_ERROR",
        message,
        details: result?.error?.details || result?.error || result || undefined,
      },
    };
  } catch (e: any) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: e?.message || "Network error",
      },
    };
  }
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<ApiResponse<{ user: any }>> {
  try {
    const response = await apiRequest("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status === 401 ? "AUTHENTICATION_FAILED" : "API_ERROR",
          message:
            result?.detail ||
            result?.message ||
            `Login failed (${response.status})`,
          details: result || undefined,
        },
      };
    }

    if (result?.success && result?.data) return result;
    return {
      success: true,
      data: { user: result?.data?.user || result?.user || result },
    };
  } catch (e: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: e?.message || "Network error" },
    };
  }
}

export async function checkAuth(): Promise<ApiResponse<{ user: any }>> {
  try {
    const response = await apiRequest("/auth/me/", { method: "GET" });
    const result = await response.json().catch(() => null);
    if (response.ok) return { success: true, data: { user: result } };
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    };
  } catch {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Failed to check authentication",
      },
    };
  }
}
