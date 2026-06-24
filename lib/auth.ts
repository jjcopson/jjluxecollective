import crypto from "crypto";
export const COOKIE_NAME = "jj_luxe_session";

export function normalizePhone(phone: string) {
  let cleaned = String(phone || "").replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = `233${cleaned.slice(1)}`;
  if (!cleaned.startsWith("233")) cleaned = `233${cleaned}`;
  return cleaned;
}

export function formatPhoneForTwilio(phone: string) {
  return `+${normalizePhone(phone)}`;
}

export function normalizeIdentifier(identifier: string) {
  const value = String(identifier || "").trim().toLowerCase();
  return value.includes("@") ? value : normalizePhone(value);
}

export function isStrongPassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

export function signSession(customerId: string) {
  const secret = process.env.CUSTOMER_SESSION_SECRET || "dev-customer-secret";
  const payload = `${customerId}.${Date.now()}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifySession(token: string | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [customerId, timestamp, signature] = parts;
  const secret = process.env.CUSTOMER_SESSION_SECRET || "dev-customer-secret";
  const payload = `${customerId}.${timestamp}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return signature === expected ? customerId : null;
}
