
/**
 * Axios API Instance
 * Configured with backend base URL from environment variables
 */

import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.error?.message || error?.message || 'Unknown error';
    console.error('API Error:', status, message);
    return Promise.reject(error);
  }
);

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Simple in-memory request cache to avoid duplicate simultaneous requests
const requestCache = new Map<string, { promise: Promise<any>; expires: number }>();

const getCacheKey = (config: AxiosRequestConfig): string => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

export const requestWithRetry = async <T = any>(
  config: AxiosRequestConfig,
  maxRetries = 1 // Reduced from 3 to 1
): Promise<T> => {
  const cacheKey = getCacheKey(config);
  const now = Date.now();

  // Return existing in-flight request if still valid (within 5 seconds)
  const cached = requestCache.get(cacheKey);
  if (cached && cached.expires > now) {
    console.log('Returning in-flight request for', cacheKey);
    return cached.promise;
  }

  const requestPromise = (async () => {
    let attempt = 0;

    while (true) {
      try {
        const resp = await apiClient.request<T>(config);
        // Unwrap nested data payloads if backend wraps responses
        const payload: any = (resp as any)?.data?.data ?? resp.data;
        return payload as T;
      } catch (err: any) {
        attempt += 1;
        const status = err?.response?.status;
        const errorMsg = err?.response?.data?.error?.message || err?.message || 'Network error';

        if (attempt > maxRetries) {
          console.error('API Error: exceeded retries', status, errorMsg);
          throw err;
        }

        const retryAfterHeader = err?.response?.headers?.['retry-after'];
        const retryAfterSec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;

        // Retry on 502 (Bad Gateway - backend timeout) and 503 (Service Unavailable)
        if (status === 429 || status === 502 || status === 503) {
          const waitMs = !Number.isNaN(retryAfterSec)
            ? retryAfterSec * 1000
            : Math.min(2000 * Math.pow(2, attempt), 15000); // Start at 2s, max 15s
          const reason = status === 429 ? 'Rate limited' : status === 502 ? 'Backend timeout' : 'Service unavailable';
          console.warn(`${reason} (${status}). Retrying in ${waitMs}ms (attempt ${attempt}/${maxRetries})`);
          await wait(waitMs);
          continue;
        }

        if (!err.response) {
          // Network error - use longer backoff
          const waitMs = Math.min(2000 * Math.pow(2, attempt), 15000); // Start at 2s, max 15s
          console.warn(`Network error. Retrying in ${waitMs}ms (attempt ${attempt}/${maxRetries})`);
          await wait(waitMs);
          continue;
        }

        throw err;
      }
    }
  })();

  // Cache the in-flight request for 5 seconds
  requestCache.set(cacheKey, {
    promise: requestPromise,
    expires: now + 5000,
  });

  return requestPromise;
};

export default apiClient;

