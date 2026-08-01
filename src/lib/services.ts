import api, { post, get, put, del, setToken } from "./api";
import type {
  Company,
  Customer,
  CustomerProfileData,
  DailyDispatch,
  DashboardData,
  GstB2BRow,
  GstRow,
  Gstr1B2BRow,
  Gstr3bSummary,
  Invoice,
  InvoiceItem,
  LedgerEntry,
  Product,
  Purchase,
  PurchaseItem,
  SalesReport,
  StockRow,
} from "./types";

/* ---------------- Admin / Auth  ->  /admin ---------------- */
export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: { id: string; username: string };
}

export async function loginApi(username: string, password: string) {
  const res = await api.post<LoginResponse>("/admin/login", { username, password });
  if (res.data?.token) setToken(res.data.token);
  return res.data;
}

/* ---------------- Products  ->  /products ---------------- */
export const productsApi = {
  list: (search?: string) => get<Product[]>("/products/get-all", search ? { search } : undefined),
  getById: (id: string) => get<Product>(`/products/get/${id}`),
  create: (data: Partial<Product>) => post<Product>("/products/create", data),
  update: (id: string, data: Partial<Product>) => put<Product>(`/products/update/${id}`, data),
  remove: (id: string) => del<Product>(`/products/delete/${id}`),
};

/* ---------------- Customers  ->  /customers ---------------- */
export const customersApi = {
  list: (search?: string) => get<Customer[]>("/customers", search ? { search } : undefined),
  profile: (id: string) => get<CustomerProfileData>(`/customers/${id}`),
  create: (data: Partial<Customer>) => post<Customer>("/customers", data),
  update: (id: string, data: Partial<Customer>) => put<Customer>(`/customers/${id}`, data),
  /** Permanent delete — DELETE /customers/delete/:id (auth protected) */
  remove: (id: string) => del<Customer>(`/customers/delete/${id}`),
  deactivate: (id: string) => put<Customer>(`/customers/${id}`, { status: "inactive" }),
};

/* ---------------- Company  ->  /company ---------------- */
export const companyApi = {
  get: () => get<Company | null>("/company"),
  create: (data: Partial<Company>) => post<Company>("/company", data),
  update: (id: string, data: Partial<Company>) => put<Company>(`/company/${id}`, data),
  remove: (id: string) => del<Company>(`/company/${id}`),
};

/* ---------------- Purchases  ->  /purchases ---------------- */
export interface PurchasePayload extends Partial<Purchase> {
  items: Partial<PurchaseItem>[];
}

export const purchasesApi = {
  list: () => get<Purchase[]>("/purchases/get-all"),
  getById: (id: string) => get<{ purchase: Purchase; items: PurchaseItem[] }>(`/purchases/get/${id}`),
  create: (data: PurchasePayload) => post<Purchase>("/purchases/create", data),
  update: (id: string, data: PurchasePayload) => put<Purchase>(`/purchases/update/${id}`, data),
  remove: (id: string) => del<Purchase>(`/purchases/delete/${id}`),
};

/* ---------------- Invoices  ->  /invoice ---------------- */
export interface InvoicePayload extends Partial<Invoice> {
  items: Partial<InvoiceItem>[];
}

export const invoicesApi = {
  list: () => get<Invoice[]>("/invoice/all"),
  getById: (id: string) => get<{ invoice: Invoice; items: InvoiceItem[] }>(`/invoice/view/${id}`),
  create: (data: InvoicePayload) => post<Invoice>("/invoice/create", data),
  update: (id: string, data: InvoicePayload) => put<Invoice>(`/invoice/update/${id}`, data),
  cancel: (id: string) => put<Invoice>(`/invoice/cancel/${id}`, {}),
  remove: (id: string) => del<Invoice>(`/invoice/delete/${id}`),
};

/* ---------------- Stock  ->  /stock ---------------- */
export const stockApi = {
  list: () => get<StockRow[]>("/stock"),
  adjust: (data: { productId: string; boxes: number; pieces: number; note?: string }) =>
    post<LedgerEntry>("/stock/adjust", data),
  ledger: (productId: string) => get<LedgerEntry[]>(`/stock/ledger/${productId}`),
};

/* ---------------- Reports ---------------- */
export const reportsApi = {
  dashboard: () => get<DashboardData>("/dashboard"),
  sales: (from: string, to: string) => get<SalesReport>("/sales-report", { from, to }),
  daily: (date: string) => get<DailyDispatch>("/daily-dispatch", { date }),
  gst: (from: string, to: string) => get<GstRow[]>("/gst-report", { from, to }),
  gstr3b: () => get<Gstr3bSummary>("/gstr3b"),
  gstr1B2B: () => get<Gstr1B2BRow[]>("/gstr1-b2b"),
  gstB2B: () => get<GstB2BRow[]>("/gst-b2b-report"),
};
