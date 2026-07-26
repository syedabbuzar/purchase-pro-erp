import Dexie, { type Table } from "dexie";
import bcrypt from "bcryptjs";

export type Role = "admin" | "manager" | "billing";

export interface User {
  id?: number;
  name: string;
  username: string;
  passwordHash: string;
  role: Role;
  createdAt: number;
}

export interface Company {
  id?: number;
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
  logo?: string;
}

export interface Product {
  id?: number;
  name: string;
  description?: string;
  hsn: string;
  mrp: number;
  rate: number;
  gstPct: number;
  unit: string;
  boxSize: number; // pieces per box
  category?: string;
  minStockAlert: number;
  barcode?: string;
  status: "active" | "inactive";
  openingBoxes: number;
  openingPieces: number;
  createdAt: number;
}

export interface Customer {
  id?: number;
  name: string;
  shopName?: string;
  gstin?: string;
  pan?: string;
  mobile: string;
  altMobile?: string;
  address?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  email?: string;
  creditLimit?: number;
  openingBalance?: number;
  status: "active" | "inactive";
  createdAt: number;
}

export interface StockLedger {
  id?: number;
  productId: number;
  ts: number;
  type: "opening" | "purchase" | "sale" | "adjustment" | "cancel" | "return";
  boxes: number; // signed: +in, -out
  pieces: number;
  note?: string;
  refId?: number;
}

export interface InvoiceItem {
  id?: number;
  invoiceId: number;
  srNo: number;
  productId: number;
  hsn: string;
  description: string;
  mrp: number;
  rate: number;
  boxes: number;
  pieces: number;
  boxSize: number;
  free: number;
  scheme: number;
  discount: number;
  gstPct: number;
  taxable: number;
  gstAmount: number;
  netAmount: number;
}

export interface Invoice {
  id?: number;
  number: string;
  date: number;
  customerId: number;
  salesman?: string;
  placeOfSupply?: string;
  paymentMode?: string;
  transport?: string;
  remarks?: string;
  subtotal: number;
  totalDiscount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  total: number;
  amountInWords: string;
  status: "active" | "cancelled" | "deleted";
  createdBy?: number;
  createdAt: number;
}

export interface InvoiceReturn {
  id?: number;
  invoiceId: number;
  customerId: number;
  date: number;
  taxable: number;
  gstAmount: number;
  total: number;
  note?: string;
  createdAt: number;
}

export interface InvoiceReturnItem {
  id?: number;
  returnId: number;
  invoiceId: number;
  invoiceItemId: number;
  productId: number;
  hsn: string;
  description: string;
  boxes: number;
  pieces: number;
  boxSize: number;
  taxable: number;
  gstAmount: number;
  netAmount: number;
}

export interface Payment {
  id?: number;
  customerId: number;
  invoiceId?: number;
  amount: number;
  mode: string;
  ts: number;
  note?: string;
}

export interface Purchase {
  id?: number;
  invoiceNo: string;
  supplier: string;
  date: number;
  total: number;
  note?: string;
}
export interface PurchaseItem {
  id?: number;
  purchaseId: number;
  productId: number;
  // Snapshot at the time of purchase (permanent history)
  name?: string;
  hsn?: string;
  gstPct?: number;
  boxSize?: number; // pieces per box at time of purchase
  mrp?: number;
  boxes: number;
  pieces: number;
  rate: number; // per piece
  amount: number;
}

export interface AuditLog {
  id?: number;
  ts: number;
  userId?: number;
  action: string;
  entity: string;
  entityId?: number;
  note?: string;
}

class ErpDB extends Dexie {
  users!: Table<User, number>;
  company!: Table<Company, number>;
  products!: Table<Product, number>;
  customers!: Table<Customer, number>;
  stockLedger!: Table<StockLedger, number>;
  invoices!: Table<Invoice, number>;
  invoiceItems!: Table<InvoiceItem, number>;
  invoiceReturns!: Table<InvoiceReturn, number>;
  invoiceReturnItems!: Table<InvoiceReturnItem, number>;
  payments!: Table<Payment, number>;
  purchases!: Table<Purchase, number>;
  purchaseItems!: Table<PurchaseItem, number>;
  audit!: Table<AuditLog, number>;

  constructor() {
    super("star_erp");
    this.version(1).stores({
      users: "++id,&username,role",
      company: "++id",
      products: "++id,&hsn,&name,status,category",
      customers: "++id,name,mobile,gstin",
      stockLedger: "++id,productId,ts,type",
      invoices: "++id,&number,date,customerId,status",
      invoiceItems: "++id,invoiceId,productId",
      payments: "++id,customerId,invoiceId,ts",
      purchases: "++id,date,supplier",
      purchaseItems: "++id,purchaseId,productId",
      audit: "++id,ts,userId,entity",
    });
    this.version(2).stores({
      users: "++id,&username,role",
      company: "++id",
      products: "++id,&hsn,&name,status,category",
      customers: "++id,name,mobile,gstin",
      stockLedger: "++id,productId,ts,type,refId",
      invoices: "++id,&number,date,customerId,status",
      invoiceItems: "++id,invoiceId,productId",
      invoiceReturns: "++id,invoiceId,customerId,date",
      invoiceReturnItems: "++id,returnId,invoiceId,invoiceItemId,productId",
      payments: "++id,customerId,invoiceId,ts",
      purchases: "++id,date,supplier",
      purchaseItems: "++id,purchaseId,productId",
      audit: "++id,ts,userId,entity",
    });
    // v3: drop HSN uniqueness (HSN is now manually typed per purchase and
    // may repeat or be blank across products). Name remains unique.
    this.version(3).stores({
      products: "++id,hsn,&name,status,category",
    });
  }
}

export const db = new ErpDB();

export const DEFAULT_COMPANY: Company = {
  name: "STAR ENTERPRISES NANDED",
  address: "Near Masjid-e-Elahi, Opp. Famous Function Hall, Maltekdi Road, Degloor Naka, Nanded",
  city: "Nanded",
  state: "Maharashtra",
  stateCode: "27",
  phone: "8446966062",
  gstin: "27CZRPM3752R1Z9",
  pan: "CZRPM3752R",
  fssai: "11522048000432",
  bankName: "KOTAK BANK",
  accountNo: "8446966062",
  ifsc: "KKBK0002037",
  invoicePrefix: "SE",
  footer: "NO EXCHANGE NO RETURN | CHEQUE BOUNCE FEES 530/- RS EXTRA",
  terms:
    "Declaration:-Whether the tax is payable on reverse charge basis -No. Certified that the Particulars given above are true and correct. We hereby certify that food/s mentioned in this invoice is/are warranted to be of the nature, Substance and quality which it/these purport to be.",
};

export async function ensureSeed() {
  const companyCount = await db.company.count();
  if (companyCount === 0) {
    await db.company.add({ ...DEFAULT_COMPANY });
  }
  const userCount = await db.users.count();
  if (userCount === 0) {
    const passwordHash = await bcrypt.hash("admin", 8);
    await db.users.add({
      name: "Administrator",
      username: "admin",
      passwordHash,
      role: "admin",
      createdAt: Date.now(),
    });
  }
}

export async function currentStock(productId: number): Promise<{ boxes: number; pieces: number; totalPieces: number }> {
  const product = await db.products.get(productId);
  const boxSize = product?.boxSize || 1;
  const entries = await db.stockLedger.where("productId").equals(productId).toArray();
  let totalPieces = 0;
  for (const e of entries) {
    totalPieces += e.boxes * boxSize + e.pieces;
  }
  const boxes = Math.floor(totalPieces / boxSize);
  const pieces = totalPieces - boxes * boxSize;
  return { boxes, pieces, totalPieces };
}
