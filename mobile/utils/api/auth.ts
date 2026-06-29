import { apiRequest } from "./client";
import type { ApiResponse } from "./types";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
}

function parseUserPayload(result: any): UserProfile | null {
  if (!result || typeof result !== "object") return null;
  if (result.user && typeof result.user === "object") return result.user as UserProfile;
  if (result.email && result.id) return result as UserProfile;
  if (result.data?.user) return result.data.user as UserProfile;
  if (result.data?.email) return result.data as UserProfile;
  return null;
}

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

export async function checkAuth(): Promise<ApiResponse<{ user: UserProfile }>> {
  try {
    const response = await apiRequest("/auth/me/", { method: "GET" });
    const result = await response.json().catch(() => null);
    if (response.ok) {
      const user = parseUserPayload(result);
      if (user) return { success: true, data: { user } };
      return {
        success: false,
        error: { code: "INVALID_RESPONSE", message: "Invalid user response" },
      };
    }
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

export async function getUserProfile(): Promise<ApiResponse<UserProfile>> {
  const res = await checkAuth();
  if (res.success && res.data?.user) {
    return { success: true, data: res.data.user };
  }
  return {
    success: false,
    error:
      "error" in res
        ? res.error
        : { code: "UNAUTHORIZED", message: "Not authenticated" },
  };
}

export async function updateUserProfile(data: {
  first_name?: string;
  last_name?: string;
  email?: string;
}): Promise<ApiResponse<UserProfile>> {
  try {
    const response = await apiRequest("/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const details = result?.error?.details || result;
      const fieldError =
        typeof details === "object" && details !== null
          ? Object.entries(details)
              .map(([key, val]) => {
                const msg = Array.isArray(val) ? val.join(", ") : String(val);
                return `${key}: ${msg}`;
              })
              .join("; ")
          : null;

      return {
        success: false,
        error: {
          code: response.status === 400 ? "VALIDATION_ERROR" : "API_ERROR",
          message:
            fieldError ||
            result?.message ||
            result?.detail ||
            `Failed to update profile (${response.status})`,
          details: result || undefined,
        },
      };
    }

    const user = parseUserPayload(result);
    if (user) {
      return {
        success: true,
        data: user,
        message: result?.message || "Profile updated successfully",
      };
    }

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

export async function logoutUser(): Promise<ApiResponse<null>> {
  try {
    const response = await apiRequest("/auth/logout/", { method: "POST" });
    if (response.ok) return { success: true, data: null };
    const result = await response.json().catch(() => null);
    return {
      success: false,
      error: {
        code: "API_ERROR",
        message: result?.message || `Logout failed (${response.status})`,
      },
    };
  } catch (e: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: e?.message || "Network error" },
    };
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await apiRequest("/auth/password/reset/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: "API_ERROR",
          message:
            result?.message ||
            result?.detail ||
            `Password reset failed (${response.status})`,
          details: result || undefined,
        },
      };
    }

    return {
      success: true,
      data: {
        message:
          result?.message ||
          "If that email exists, a password reset link has been sent.",
      },
    };
  } catch (e: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: e?.message || "Network error" },
    };
  }
}
