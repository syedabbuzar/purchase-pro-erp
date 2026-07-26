// Centralized mock data store for the admin panel.
// All data is seeded into localStorage so the admin panel and user-facing
// pages share the same source of truth. When you connect a real backend,
// replace these functions with API calls — the component layer stays the same.

export interface Application {
  id: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  college: string;
  education: string;
  duration: "2_months" | "6_months";
  course: string;
  registrationFee: number;
  paymentScreenshot: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface UserRecord {
  id: string;
  email: string;
  registrationDate: string;
  applicationsSubmitted: number;
  lastLogin: string;
  status: "active" | "inactive";
}

export interface SuccessContent {
  title: string;
  description: string;
  whatsappNumber: string;
  whatsappGroupLink: string;
  address: string;
  additionalNotes: string;
}

export interface QrCode {
  id: string;
  url: string;
  uploadedAt: string;
  label: string;
}

export interface AdminUser {
  email: string;
  password: string;
  name: string;
  role: "admin";
}

export interface ContactEnquiry {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: string;
  status: "new" | "read" | "replied" | "closed";
}

// ─── Keys ───
const K = {
  APPS: "mm_admin_applications",
  USERS: "mm_admin_users",
  SUCCESS: "mm_admin_success_content",
  QR: "mm_admin_qr_codes",
  ENQUIRIES: "mm_admin_enquiries",
  ADMIN_SESSION: "mm_admin_session",
  ADMIN_USER: "mm_admin_user",
};

// ─── Admin credentials (hardcoded for frontend demo) ───
const ADMIN: AdminUser = {
  email: "syedabbuzar0777@gmail.com",
  password: "123456",
  name: "Syed Abu Zar",
  role: "admin",
};

// ─── Seed data ───
const SEED_APPLICATIONS: Application[] = [
  {
    id: "APP-001", userId: "user1@example.com", name: "Aarav Sharma",
    email: "user1@example.com", mobile: "9876543210", college: "MIT College", education: "B.Tech", duration: "6_months",
    course: "MERN Full Stack", registrationFee: 5000,
    paymentScreenshot: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&w=300",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: "pending",
  },
  {
    id: "APP-002", userId: "user2@example.com", name: "Priya Patel",
    email: "user2@example.com", mobile: "9876543211", college: "VIT College", education: "MCA", duration: "2_months",
    course: "Frontend", registrationFee: 500,
    paymentScreenshot: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&w=300",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), status: "approved",
  },
  {
    id: "APP-003", userId: "user3@example.com", name: "Rohan Verma",
    email: "user3@example.com", mobile: "9876543212", college: "COEP Pune", education: "B.Sc", duration: "6_months",
    course: "Python Full Stack", registrationFee: 5000,
    paymentScreenshot: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&w=300",
    createdAt: new Date().toISOString(), status: "pending",
  },
  {
    id: "APP-004", userId: "user4@example.com", name: "Sneha Reddy",
    email: "user4@example.com", mobile: "9876543213", college: "Symbiosis", education: "BCA", duration: "2_months",
    course: "Python & AI", registrationFee: 500,
    paymentScreenshot: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&w=300",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), status: "rejected",
  },
  {
    id: "APP-005", userId: "user5@example.com", name: "Karan Mehta",
    email: "user5@example.com", mobile: "9876543214", college: "PICT Pune", education: "B.E.", duration: "6_months",
    course: "Java Full Stack", registrationFee: 5000,
    paymentScreenshot: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&w=300",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), status: "approved",
  },
  {
    id: "APP-006", userId: "user6@example.com", name: "Ananya Iyer",
    email: "user6@example.com", mobile: "9876543215", college: "Fergusson College", education: "BBA", duration: "2_months",
    course: "Linux & Shell Scripting", registrationFee: 500,
    paymentScreenshot: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&w=300",
    createdAt: new Date().toISOString(), status: "pending",
  },
  {
    id: "APP-007", userId: "user7@example.com", name: "Vikram Singh",
    email: "user7@example.com", mobile: "9876543216", college: "Wadia College", education: "Diploma", duration: "6_months",
    course: "MERN Full Stack", registrationFee: 5000,
    paymentScreenshot: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&w=300",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), status: "pending",
  },
  {
    id: "APP-008", userId: "user8@example.com", name: "Diya Joshi",
    email: "user8@example.com", mobile: "9876543217", college: "Modern College", education: "M.Sc", duration: "2_months",
    course: "Backend", registrationFee: 500,
    paymentScreenshot: "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&w=300",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), status: "approved",
  },
];

const SEED_USERS: UserRecord[] = [
  { id: "U1", email: "user1@example.com", registrationDate: new Date(Date.now() - 86400000 * 2).toISOString(), applicationsSubmitted: 1, lastLogin: new Date(Date.now() - 3600000).toISOString(), status: "active" },
  { id: "U2", email: "user2@example.com", registrationDate: new Date(Date.now() - 86400000 * 5).toISOString(), applicationsSubmitted: 1, lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), status: "active" },
  { id: "U3", email: "user3@example.com", registrationDate: new Date().toISOString(), applicationsSubmitted: 1, lastLogin: new Date().toISOString(), status: "active" },
  { id: "U4", email: "user4@example.com", registrationDate: new Date(Date.now() - 86400000 * 10).toISOString(), applicationsSubmitted: 1, lastLogin: new Date(Date.now() - 86400000 * 8).toISOString(), status: "inactive" },
  { id: "U5", email: "user5@example.com", registrationDate: new Date(Date.now() - 86400000 * 1).toISOString(), applicationsSubmitted: 1, lastLogin: new Date(Date.now() - 7200000).toISOString(), status: "active" },
  { id: "U6", email: "user6@example.com", registrationDate: new Date().toISOString(), applicationsSubmitted: 1, lastLogin: new Date().toISOString(), status: "active" },
  { id: "U7", email: "user7@example.com", registrationDate: new Date(Date.now() - 86400000 * 3).toISOString(), applicationsSubmitted: 1, lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(), status: "active" },
  { id: "U8", email: "user8@example.com", registrationDate: new Date(Date.now() - 86400000 * 7).toISOString(), applicationsSubmitted: 1, lastLogin: new Date(Date.now() - 86400000 * 4).toISOString(), status: "active" },
];

const DEFAULT_SUCCESS_CONTENT: SuccessContent = {
  title: "Registration Submitted!",
  description: "Your internship application has been received. We'll review it and get back to you soon.",
  whatsappNumber: "+91 98765 43210",
  whatsappGroupLink: "https://chat.whatsapp.com/your-group-link",
  address: "MellowMoon SoftTech Pvt. Ltd., IT Park, Nagpur, Maharashtra 440001",
  additionalNotes: "Please join the WhatsApp group within 48 hours to receive further instructions.",
};

const DEFAULT_QR: QrCode = {
  id: "qr-default",
  url: "https://images.pexels.com/photos/278430/pexels-photo-278430.jpeg?auto=compress&w=400",
  uploadedAt: new Date().toISOString(),
  label: "Default UPI QR",
};

// ─── Init ───
export function initStore() {
  if (!localStorage.getItem(K.APPS)) localStorage.setItem(K.APPS, JSON.stringify(SEED_APPLICATIONS));
  if (!localStorage.getItem(K.USERS)) localStorage.setItem(K.USERS, JSON.stringify(SEED_USERS));
  if (!localStorage.getItem(K.SUCCESS)) localStorage.setItem(K.SUCCESS, JSON.stringify(DEFAULT_SUCCESS_CONTENT));
  if (!localStorage.getItem(K.QR)) localStorage.setItem(K.QR, JSON.stringify([DEFAULT_QR]));
}

// ─── Applications ───
export function getApplications(): Application[] {
  try { return JSON.parse(localStorage.getItem(K.APPS) || "[]"); } catch { return []; }
}
export function saveApplications(apps: Application[]) {
  localStorage.setItem(K.APPS, JSON.stringify(apps));
}
export function addApplication(app: Application) {
  const apps = getApplications();
  apps.push(app);
  saveApplications(apps);
}
export function updateApplicationStatus(id: string, status: Application["status"]) {
  const apps = getApplications().map((a) => (a.id === id ? { ...a, status } : a));
  saveApplications(apps);
  return apps;
}

// ─── Users ───
export function getUsers(): UserRecord[] {
  try { return JSON.parse(localStorage.getItem(K.USERS) || "[]"); } catch { return []; }
}
export function saveUsers(users: UserRecord[]) {
  localStorage.setItem(K.USERS, JSON.stringify(users));
}

// ─── Success Content ───
export function getSuccessContent(): SuccessContent {
  try { return JSON.parse(localStorage.getItem(K.SUCCESS) || "null") || DEFAULT_SUCCESS_CONTENT; } catch { return DEFAULT_SUCCESS_CONTENT; }
}
export function saveSuccessContent(content: SuccessContent) {
  localStorage.setItem(K.SUCCESS, JSON.stringify(content));
}

// ─── QR Codes ───
export function getQrCodes(): QrCode[] {
  try { return JSON.parse(localStorage.getItem(K.QR) || "[]"); } catch { return []; }
}
export function getCurrentQr(): QrCode | null {
  const codes = getQrCodes();
  return codes.length > 0 ? codes[codes.length - 1] : null;
}
export function addQrCode(qr: QrCode) {
  const codes = getQrCodes();
  codes.push(qr);
  localStorage.setItem(K.QR, JSON.stringify(codes));
}
export function deleteQrCode(id: string) {
  const codes = getQrCodes().filter((q) => q.id !== id);
  localStorage.setItem(K.QR, JSON.stringify(codes));
}

// ─── Admin Auth ───
export function adminLogin(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === ADMIN.email && password === ADMIN.password) {
    localStorage.setItem(K.ADMIN_SESSION, "true");
    localStorage.setItem(K.ADMIN_USER, JSON.stringify({ email: ADMIN.email, name: ADMIN.name, role: ADMIN.role }));
    return true;
  }
  return false;
}
export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(K.ADMIN_SESSION) === "true";
}
export function getAdminUser(): { email: string; name: string; role: string } | null {
  try { return JSON.parse(localStorage.getItem(K.ADMIN_USER) || "null"); } catch { return null; }
}
export function adminLogout() {
  localStorage.removeItem(K.ADMIN_SESSION);
  localStorage.removeItem(K.ADMIN_USER);
}

// ─── Contact Enquiries ───
const SEED_ENQUIRIES: ContactEnquiry[] = [
  { id: "ENQ-1001", name: "Rahul Sharma", company: "TechVista Solutions", email: "rahul@techvista.com", phone: "+91 9822012345", service: "Web application", message: "We need a custom web application for managing our internal inventory and orders. Looking for a quote and timeline.", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: "new" },
  { id: "ENQ-1002", name: "Priya Patil", company: "GreenLeaf Organics", email: "priya@greenleaf.in", phone: "+91 9876543201", service: "Business website", message: "Want a professional website for our organic products brand with e-commerce capability.", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), status: "read" },
  { id: "ENQ-1003", name: "Amit Deshmukh", company: "", email: "amit.d@gmail.com", phone: "+91 9970011223", service: "Mobile app", message: "Looking for a mobile app developer for a food delivery startup. Need both Android and iOS.", createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), status: "new" },
  { id: "ENQ-1004", name: "Sneha Kulkarni", company: "EduFirst Academy", email: "sneha@edufirst.com", phone: "+91 9812345678", service: "CRM / Inventory", message: "Need a CRM system to manage student enrollments, fees, and course schedules.", createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), status: "replied" },
  { id: "ENQ-1005", name: "Vikram Nair", company: "Nair & Associates", email: "vikram@nairassoc.in", phone: "+91 9900112233", service: "Partnership", message: "Interested in a strategic partnership for joint software development projects.", createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), status: "closed" },
  { id: "ENQ-1006", name: "Anjali Mehta", company: "Mehta Textiles", email: "anjali@mehtatextiles.com", phone: "+91 9876509876", service: "Agentic AI", message: "Exploring AI solutions for automating customer support and order processing.", createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), status: "read" },
  { id: "ENQ-1007", name: "Karan Singh", company: "Singh Motors", email: "karan@singhmotors.in", phone: "+91 9988776655", service: "New project", message: "Need a complete digital transformation — website, CRM, and mobile app for our automobile dealership.", createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), status: "new" },
];

export function getEnquiries(): ContactEnquiry[] {
  const raw = localStorage.getItem(K.ENQUIRIES);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  localStorage.setItem(K.ENQUIRIES, JSON.stringify(SEED_ENQUIRIES));
  return [...SEED_ENQUIRIES];
}

export function addEnquiry(enquiry: Omit<ContactEnquiry, "id" | "createdAt" | "status">): ContactEnquiry[] {
  const all = getEnquiries();
  const newEnquiry: ContactEnquiry = {
    ...enquiry,
    id: `ENQ-${String(Date.now()).slice(-6)}`,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const updated = [newEnquiry, ...all];
  localStorage.setItem(K.ENQUIRIES, JSON.stringify(updated));
  return updated;
}

export function updateEnquiryStatus(id: string, status: ContactEnquiry["status"]): ContactEnquiry[] {
  const all = getEnquiries();
  const updated = all.map((e) => (e.id === id ? { ...e, status } : e));
  localStorage.setItem(K.ENQUIRIES, JSON.stringify(updated));
  return updated;
}

export function deleteEnquiry(id: string): ContactEnquiry[] {
  const all = getEnquiries();
  const updated = all.filter((e) => e.id !== id);
  localStorage.setItem(K.ENQUIRIES, JSON.stringify(updated));
  return updated;
}
