import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dayflow',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function initDatabase(): Promise<void> {
  const db = getPool();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      logo LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id VARCHAR(50) UNIQUE NOT NULL,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'hr', 'employee') DEFAULT 'employee',
      avatar LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      check_in DATETIME,
      check_out DATETIME,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);
}

// Helper to run queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const db = getPool();
  const [rows] = await db.execute(sql, params);
  return rows as T[];
}

// Helper to run single-result queries
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

// Helper to run insert/update/delete
export async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  const db = getPool();
  const [result] = await db.execute(sql, params);
  return result as mysql.ResultSetHeader;
}
