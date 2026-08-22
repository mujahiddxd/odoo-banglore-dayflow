import { execute } from './db';

export async function createNotification(
  employeeId: string,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  try {
    await execute(
      `INSERT INTO notifications (employee_id, title, message, link) 
       VALUES ((SELECT id FROM employees WHERE employee_id = ?), ?, ?, ?)`,
      [employeeId, title, message, link ?? null]
    );
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
