import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

/**
 * SINGLE PLACE where the hosted backend URL is configured.
 * Every API call in the frontend goes through this axios instance.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://star-enterprises.vercel.app";

export const TOKEN_KEY = "star-erp-token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErrorMessage(error: unknown): string {
  const err = error as AxiosError<{ message?: string; error?: string }>;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.message) return err.message;
  return "Something went wrong";
}

/** Backend envelope: { success, message, data } */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  token?: string;
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await api.request<ApiEnvelope<T>>(config);
  return res.data?.data as T;
}

export const get = <T,>(url: string, params?: Record<string, unknown>) =>
  request<T>({ method: "GET", url, params });

export const post = <T,>(url: string, data?: unknown) =>
  request<T>({ method: "POST", url, data });

export const put = <T,>(url: string, data?: unknown) =>
  request<T>({ method: "PUT", url, data });

export const del = <T,>(url: string) => request<T>({ method: "DELETE", url });

export default api;