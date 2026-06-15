/**
 * Centralized API client
 *
 * Security: JWT is stored exclusively in httpOnly cookies managed by the
 * backend. This file never reads or writes tokens. The browser forwards
 * cookies automatically on every credentialed request.
 *
 * Refresh flow:
 *   Any 401 response → POST /auth/refresh (silent, once) → replay request.
 *   If /refresh also fails → emit global "auth:logout" event so AuthContext
 *   can clear state and redirect the user to /login.
 */

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

// ─── Refresh-race guard ───────────────────────────────────────────────────────
// If multiple concurrent requests all 401 at the same time we only want ONE
// refresh call in flight. All other callers wait on the same promise.
let refreshPromise: Promise<boolean> | null = null;

// ─── CSRF token reader ────────────────────────────────────────────────────────
// The server sets a non-httpOnly "csrfToken" cookie on every login / token
// rotation. We read it here and send it as X-CSRF-Token on state-changing
// requests so the backend Double Submit Cookie check passes.

/** HTTP methods that mutate state and therefore require a CSRF token. */
const CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Parse the csrfToken value from document.cookie.
 * Returns an empty string if the cookie isn't present (e.g. SSR context or
 * before first login).
 */
function getCsrfToken(): string {
  if (typeof document === "undefined") return ""; // SSR guard
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrfToken="));
  return match ? match.split("=")[1] ?? "" : "";
}

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${AUTH_BASE_URL}/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

type FetchOptions = RequestInit & { _isRetry?: boolean };

export async function apiCall<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { _isRetry = false, headers: customHeaders = {}, method = "GET", ...rest } = options;

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  });

  // Automatically inject CSRF token for state-changing requests.
  // The server set a non-httpOnly "csrfToken" cookie on login — we read it
  // here and mirror it in the X-CSRF-Token header (Double Submit Cookie pattern).
  if (CSRF_METHODS.has(method.toUpperCase())) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include", // always send httpOnly cookies
    ...rest,
  });

  // ── 401 → try silent refresh, then replay ──────────────────────────────────
  if (response.status === 401 && !_isRetry) {
    const refreshed = await attemptRefresh();

    if (refreshed) {
      // Replay the original request (with retry flag to prevent loops)
      return apiCall<T>(endpoint, { ...options, _isRetry: true });
    }

    // Refresh also failed — session is truly expired
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    throw new ApiError(401, "Session expired. Please log in again.", "SESSION_EXPIRED");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || response.statusText,
      errorData.code
    );
  }

  return response.json() as Promise<T>;
}

// ─── ApiError ─────────────────────────────────────────────────────────────────

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

// ─── Typed HTTP helpers ───────────────────────────────────────────────────────

export async function get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return apiCall<T>(endpoint, { ...options, method: "GET" });
}

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

export async function deleteRequest<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  return apiCall<T>(endpoint, { ...options, method: "DELETE" });
}

// ─── Deprecated stubs (kept to avoid breaking imports) ───────────────────────

/** @deprecated Token is managed server-side via httpOnly cookies. */
export function setAuthToken(_token: string): void {}

/** @deprecated Token is cleared server-side via POST /auth/logout. */
export function clearAuthToken(): void {}

// ─── Error message helper ─────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400: return "Invalid request. Please check your input.";
      case 401: return "Session expired. Please log in again.";
      case 403: return "You don't have permission to do this.";
      case 404: return "Resource not found.";
      case 409: return "Conflict. This resource already exists.";
      case 429: return "Too many requests. Please try again later.";
      case 500: return "Server error. Please try again later.";
      case 503: return "Service unavailable. Please try again later.";
      default:  return error.message || "An error occurred";
    }
  }
  if (error instanceof TypeError) return "Network error. Please check your connection.";
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}
