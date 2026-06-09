/**
 * Centralized API client setup with interceptors
 * Handles authentication, error handling, and common configurations
 */

import { ApiResponse, ApiError } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Enhanced fetch wrapper with automatic error handling
 */
export async function apiCall<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    method = "GET",
    headers: customHeaders = {},
    skipAuth = false,
    ...rest
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  // Build headers
  const headers = new Headers({
    "Content-Type": "application/json",
    ...customHeaders,
  });

  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      ...rest,
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || response.statusText,
        errorData.code
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    // Re-throw if already an ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError(0, "Network error. Please check your connection.");
    }

    // Handle other errors
    throw new ApiError(500, "An unexpected error occurred");
  }
}

/**
 * Custom ApiError class for better error handling
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Get stored auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

/**
 * Store auth token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("authToken", token);
}

/**
 * Clear auth token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authToken");
}

/**
 * Typed GET request
 */
export async function get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return apiCall<T>(endpoint, { ...options, method: "GET" });
}

/**
 * Typed POST request
 */
export async function post<T>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Typed PUT request
 */
export async function put<T>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Typed PATCH request
 */
export async function patch<T>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Typed DELETE request
 */
export async function deleteRequest<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  return apiCall<T>(endpoint, { ...options, method: "DELETE" });
}
