/** One phone number per contact, stored as E.164. */
export function normalizeE164(input: string, defaultDialCode?: string): string | null {
  let s = input.trim().replace(/[\s().-]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (!s.startsWith("+")) {
    if (!defaultDialCode) return null;
    const dial = defaultDialCode.replace(/\D/g, "");
    s = "+" + dial + s.replace(/^0+/, "");
  }
  if (!/^\+[1-9]\d{7,14}$/.test(s)) return null;
  return s;
}

/** Partly hidden for UIs, admin views and logs: keeps the country prefix and the last two digits. */
export function maskPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  if (digits.length < 7) return "••••";
  return `+${digits.slice(0, 2)} •• •• •• ${digits.slice(-2)}`;
}

export function maskEmail(email: string): string {
  const [u = "", d = ""] = email.split("@");
  return `${u.slice(0, 1)}••••@${d}`;
}
