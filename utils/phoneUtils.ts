export function formatE164(phoneRaw: string, country?: string): string | null {
  if (!phoneRaw) return null;
  const digits = phoneRaw.replace(/[^0-9+]/g, '');
  // If already looks like E.164
  if (/^\+\d{7,15}$/.test(digits)) return digits;

  const cc = (country || '').toUpperCase();
  // Minimal country handling; extend as needed
  switch (cc) {
    case 'GH': // Ghana
      // Ghana local numbers often start with 0 and are 10 digits (0XXXXXXXXX)
      // E.164 is +233XXXXXXXXX (drop leading 0)
      if (/^0\d{9}$/.test(digits)) return `+233${digits.slice(1)}`;
      if (/^\d{9}$/.test(digits)) return `+233${digits}`;
      break;
    case 'US':
    case 'CA':
      // North America 10 digits
      if (/^\d{10}$/.test(digits)) return `+1${digits}`;
      if (/^1\d{10}$/.test(digits)) return `+${digits}`;
      break;
    default:
      // Try to infer by leading 0: assume dropping leading 0 and prepend unknown country code is not safe
      break;
  }
  // As a last resort, attempt if it begins with country code without +
  if (/^\d{7,15}$/.test(digits)) return `+${digits}`;
  return null;
}

export function isPossiblePhone(phoneRaw: string): boolean {
  const digits = phoneRaw.replace(/[^0-9+]/g, '');
  return /^\+?\d{7,15}$/.test(digits);
}