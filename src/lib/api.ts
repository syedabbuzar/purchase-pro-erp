import axios from "axios";

// ==============================
// Axios Instance
// ==============================

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

// ==============================
// Token helpers (only "token" stays in localStorage — required
// so that reloads don't log the user out and the auth header can
// be attached on every request).
// ==============================

const TOKEN_KEY = "token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ==============================
// Request Interceptor
// ==============================
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (config.method !== "get" && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// Response Interceptor
// ==============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) clearToken();
    return Promise.reject(error);
  }
);

// ==============================
// Contact APIs
// ==============================

export interface ContactPayload {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  interest: string;
  message: string;
}
export interface Contact extends ContactPayload {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export const createContact = (data: ContactPayload) =>
  api.post<{ success: boolean; message: string; data: Contact }>(
    "/contact/create-contact",
    data
  );

export const getAllContacts = () =>
  api.get<{ success: boolean; count: number; data: Contact[] }>(
    "/contact/get-all-contacts"
  );

export const getContactById = (id: string) =>
  api.get<{ success: boolean; data: Contact }>(`/contact/get-contact/${id}`);

export const deleteContact = (id: string) =>
  api.delete<{ success: boolean; message: string }>(
    `/contact/delete-contact/${id}`
  );

export const updateContactStatus = (id: string, status: string) =>
  api.patch<{ success: boolean; message: string }>(
    `/contact/update-status/${id}`,
    { status }
  );

// ==============================
// Auth APIs
// ==============================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export const authCheckEmail = (email: string) =>
  api.post<{ success: boolean; message: string }>("/api/auth/check-email", {
    email,
  });

export const authRegister = (data: {
  name: string;
  email: string;
  password: string;
}) =>
  api.post<{ success: boolean; message: string }>("/api/auth/register", data);

export const authVerifyOtp = (data: {
  name: string;
  email: string;
  password: string;
  otp: string;
}) =>
  api.post<{
    success: boolean;
    message: string;
    token: string;
    user: AuthUser;
  }>("/api/auth/verify-otp", data);

export const authResendOtp = (email: string) =>
  api.post<{ success: boolean; message: string }>("/api/auth/resend-otp", {
    email,
  });

export const authLogin = (data: { email: string; password: string }) =>
  api.post<{
    success: boolean;
    message: string;
    token: string;
    user: AuthUser;
  }>("/api/auth/login", data);

export const authProfile = () =>
  api.get<{ success: boolean; user: AuthUser }>("/api/auth/profile");

export const adminLogin = (data: { email: string; password: string }) =>
  api.post<{
    success: boolean;
    message: string;
    token: string;
    admin: AuthUser;
  }>("/api/admin/login", data);

// ==============================
// Application APIs
// ==============================

export interface ApplicationPayload {
  name: string;
  email: string;
  mobile: string;
  college: string;
  education: string;
  duration: "2_months" | "6_months";
  course: string;
  paymentScreenshot: string; // base64 data URL or hosted URL
}

export const submitApplication = (data: ApplicationPayload) =>
  api.post<{ success: boolean; message: string; data: any }>(
    "/api/applications/submit",
    data
  );

export default api;
