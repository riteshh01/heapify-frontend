/**
 * Generic hook for making API calls with loading, error, and data states
 */

import { useEffect, useState, useCallback } from "react";
import { ApiError, get, post, put, deleteRequest } from "@/services/api";

interface UseApiCallOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
  skip?: boolean; // Skip initial fetch
}

interface UseApiCallResult<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for GET requests (auto-fetch on mount)
 */
export function useApiCall<T>(
  endpoint: string,
  options: UseApiCallOptions = {}
): UseApiCallResult<T> {
  const { onSuccess, onError, skip = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await get<T>(endpoint);
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, "Unknown error");
      setError(apiError);
      onError?.(apiError);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, onSuccess, onError]);

  useEffect(() => {
    if (!skip) {
      refetch();
    }
  }, [endpoint, skip, refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Hook for POST/PUT/DELETE requests (no auto-call)
 */
export function useMutation<TRequest, TResponse>(
  method: "POST" | "PUT" | "DELETE",
  endpoint: string | ((data: TRequest) => string), // Support dynamic endpoints
  options: UseApiCallOptions = {}
): [
  (data?: TRequest) => Promise<TResponse>,
  { isLoading: boolean; error: ApiError | null; data: TResponse | null }
] {
  const { onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<TResponse | null>(null);

  const mutate = useCallback(
    async (requestData?: TRequest): Promise<TResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const finalEndpoint =
          typeof endpoint === "function" ? endpoint(requestData!) : endpoint;
        let result: TResponse;

        if (method === "POST") {
          result = await post<TResponse>(finalEndpoint, requestData);
        } else if (method === "PUT") {
          result = await put<TResponse>(finalEndpoint, requestData);
        } else {
          // DELETE
          result = await deleteRequest<TResponse>(finalEndpoint);
        }

        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError(500, "Unknown error");
        setError(apiError);
        onError?.(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, method, onSuccess, onError]
  );

  return [mutate, { isLoading, error, data }];
}

/**
 * Hook for POST requests specifically
 */
export function usePost<TRequest, TResponse = unknown>(
  endpoint: string | ((data: TRequest) => string),
  options?: UseApiCallOptions
) {
  return useMutation<TRequest, TResponse>("POST", endpoint, options);
}

/**
 * Hook for PUT requests specifically
 */
export function usePut<TRequest, TResponse = unknown>(
  endpoint: string | ((data: TRequest) => string),
  options?: UseApiCallOptions
) {
  return useMutation<TRequest, TResponse>("PUT", endpoint, options);
}

/**
 * Hook for DELETE requests specifically
 */
export function useDelete<TResponse = unknown>(
  endpoint: string,
  options?: UseApiCallOptions
) {
  return useMutation<undefined, TResponse>("DELETE", endpoint, options);
}
