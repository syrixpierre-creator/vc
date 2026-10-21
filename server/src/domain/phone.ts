import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

/** ISO country -> international dialing code, for onboarding (country names are rendered by the browser's Intl.DisplayNames). */
export const COUNTRIES: readonly { code: string; dial: string }[] = getCountries().map(c => ({ code: c, dial: `+${getCountryCallingCode(c)}` }));
const BY_CODE = new Set<string>(getCountries());
const FIRST_FOR_DIAL = new Map<string, CountryCode>();
// several countries share +1, +7, +44...: national numbers are parsed with the main country of the code
for (const c of ["US", "RU", "GB", "IT", "FR", "BR", "PT", "ES", "MA", "DZ", "TN", "SN", "CI", "CM", "SA", "AE", "EG"] as CountryCode[]) FIRST_FOR_DIAL.set(getCountryCallingCode(c), c);
for (const c of getCountries()) { const d = getCountryCallingCode(c); if (!FIRST_FOR_DIAL.has(d)) FIRST_FOR_DIAL.set(d, c); }

export function isCountryCode(c: unknown): c is string { return typeof c === "string" && BY_CODE.has(c); }
export function dialCodeFor(country: string): string | null { return BY_CODE.has(country) ? `+${getCountryCallingCode(country as CountryCode)}` : null; }

/**
 * Normalizes a phone number to E.164 with libphonenumber-js.
 * International input (+.. or 00..) is parsed as is; a national number needs the user's country (or dial code).
 * Returns null for anything that is not a possible phone number.
 */
export function normalizeE164(input: string, defaultDialCode?: string, country?: string): string | null {
  if (typeof input !== "string" || input.length > 40) return null;
  let s = input.trim();
  if (!/^[+\d\s().\-/]+$/.test(s)) return null;
  if (s.startsWith("00")) s = "+" + s.slice(2);
  let region: CountryCode | undefined;
  if (country && BY_CODE.has(country)) region = country as CountryCode;
  else if (defaultDialCode) region = FIRST_FOR_DIAL.get(defaultDialCode.replace(/\D/g, ""));
  if (!s.startsWith("+") && !region) return null;
  const p = parsePhoneNumberFromString(s, region);
  if (!p || !p.isPossible()) return null;
  const e164 = p.number as string;
  return /^\+[1-9]\d{6,14}$/.test(e164) ? e164 : null;
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
