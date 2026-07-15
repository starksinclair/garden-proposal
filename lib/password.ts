/**
 * Her birthday: September 25, 2005.
 * We normalize whatever she types (lowercase, strip spaces/dots/dashes/slashes)
 * and accept every reasonable way a person writes that date.
 */
const ACCEPTED = new Set([
  // numeric — US order (MMDDYYYY / MMDDYY)
  "09252005",
  "9252005",
  "092505",
  "92505",
  // numeric — day-first (DDMMYYYY / DDMMYY) — common Nigerian/intl format
  "25092005",
  "2592005",
  "250905",
  // ISO
  "20050925",
  // month spelled out
  "sep252005",
  "sept252005",
  "september252005",
  "25sep2005",
  "25sept2005",
  "25september2005",
  "sep25",
  "sept25",
  "september25",
  "sep2505",
  "sept2505",
]);

export function checkPassword(input: string): boolean {
  const normalized = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  return ACCEPTED.has(normalized);
}
