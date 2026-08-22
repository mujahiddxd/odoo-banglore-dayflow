import { query } from './db';

/**
 * Generates an employee ID in the format:
 * OI{First2LettersOfFirstName}{First2LettersOfLastName}{YearOfJoining}{SerialNumber}
 *
 * Example: OIJODO20220001
 *   OI = Odoo India (Company Name abbreviation)
 *   JO = First two letters of first name (John)
 *   DO = First two letters of last name (Doe)
 *   2022 = Year of joining
 *   0001 = Serial number for that year
 */
export async function generateEmployeeId(name: string): Promise<string> {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || 'XX';
  const lastName = parts.length > 1 ? parts[parts.length - 1] : 'XX';

  const fn = firstName.substring(0, 2).toUpperCase().padEnd(2, 'X');
  const ln = lastName.substring(0, 2).toUpperCase().padEnd(2, 'X');

  const year = new Date().getFullYear().toString();

  // Find the next serial number for this year
  const prefix = `OI${fn}${ln}${year}`;
  const existing = await query<{ employee_id: string }>(
    'SELECT employee_id FROM employees WHERE employee_id LIKE ? ORDER BY employee_id DESC LIMIT 1',
    [`${prefix}%`]
  );

  let serial = 1;
  if (existing.length > 0) {
    const lastSerial = parseInt(existing[0].employee_id.slice(-4), 10);
    serial = lastSerial + 1;
  }

  return `${prefix}${serial.toString().padStart(4, '0')}`;
}

/**
 * Generate a random password (8 chars, mix of letters and digits)
 */
export function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
