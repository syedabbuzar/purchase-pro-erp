export type Status = "active" | "inactive";

export interface Product {
  _id: string;
  name: string;
  hsn: string;
  description?: string;
  mrp: number;
  rate: number;
  gstPct: number;
  unit: string;
  barcode?: string;
  boxSize: number;
  minStockAlert: number;
  status: Status;
  createdAt?: string;
}

export interface Customer {
  _id: string;
  name: string;
  shopName?: string;
  mobile: string;
  altMobile?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  email?: string;
  creditLimit?: number;
  openingBalance?: number;
  status: Status;
  createdAt?: string;
}

export interface Company {
  _id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  phone: string;
  gstin: string;
  pan: string;
  fssai: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  invoicePrefix: string;
  footer: string;
  terms: string;
}

export interface PurchaseItem {
  _id?: string;
  purchaseId?: string;
  productId: string;
  name: string;
  hsn?: string;
  batch?: string;
  expiry?: string | null;
  gstPct: number;
  boxes: number;
  pieces: number;
  boxSize: number;
  rate: number;
  discount?: number;
  taxable: number;
  gstAmount: number;
  amount: number;
}

export interface Purchase {
  _id: string;
  supplier: string;
  supplierGstin?: string;
  supplierState?: string;
  placeOfSupply?: string;
  invoiceNo: string;
  date: string;
  referenceNo?: string;
  lrNo?: string;
  transport?: string;
  vehicleNo?: string;
  driver?: string;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstAmount: number;
  discount?: number;
  total: number;
  narration?: string;
  remarks?: string;
  note?: string;
  createdAt?: string;
}

export interface InvoiceItem {
  _id?: string;
  invoiceId?: string;
  productId: string;
  name: string;
  hsn?: string;
  batch?: string;
  expiry?: string | null;
  gstPct: number;
  boxes: number;
  pieces: number;
  boxSize: number;
  rate: number;
  taxable: number;
  gstAmount: number;
  amount: number;
}

export interface Invoice {
  _id: string;
  number: string;
  customerId: string;
  date: string;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: "active" | "cancelled" | "deleted";
  createdAt?: string;
}

export interface StockRow {
  productId: string;
  productName: string;
  hsn?: string;
  boxSize: number;
  purchased: number;
  sold: number;
  remainingPieces: number;
  remainingBoxes: number;
  loosePieces: number;
  minStockAlert: number;
  lowStock: boolean;
}

export interface LedgerEntry {
  _id: string;
  productId: string;
  ts: string;
  type: "purchase" | "sale" | "adjustment";
  boxes: number;
  pieces: number;
  note?: string;
}

export interface DashboardData {
  todaySales: number;
  todayBills: number;
  todayCollection: number;
  pending: number;
  customers: number;
  products: number;
  lowStock: number;
  todayBoxes: number;
  todayPieces: number;
  monthly: { month: string; sales: number }[];
  top: { name: string; amt: number }[];
  recent: Invoice[];
  customersById: Customer[];
}

export interface SalesReport {
  invoices: Invoice[];
  total: number;
  daily: { day: string; sales: number }[];
  topProducts: { name: string; amt: number }[];
  topCustomers: { name: string; amt: number }[];
}

export interface DailyDispatch {
  invoiceCount: number;
  rows: { name: string; boxes: number; pieces: number; invoices: number; amount: number }[];
}

export interface GstRow {
  gstPct: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

export interface Gstr3bSummary {
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  invoiceValue: number;
  totalInvoices: number;
}

export interface Gstr1B2BRow {
  gstin: string;
  customerName: string;
  invoiceNumber?: string;
  invoiceDate: string;
  invoiceValue: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
}

export interface GstB2BRow {
  invoiceNo?: string;
  invoiceDate: string;
  customerName: string;
  gstin: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  invoiceValue: number;
}

export interface CustomerProfileData {
  customer: Customer;
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  totalSales: number;
  outstanding: number;
  lastPurchase: string | null;
  months: { month: string; sales: number }[];
}