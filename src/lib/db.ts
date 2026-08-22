import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

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
      profile_picture LONGTEXT,

      -- Job details
      position VARCHAR(255) DEFAULT '',
      department VARCHAR(255) DEFAULT '',
      manager VARCHAR(255) DEFAULT '',
      location VARCHAR(255) DEFAULT '',

      -- Personal details
      date_of_birth DATE,
      address TEXT,
      gender ENUM('Male', 'Female', 'Other', '') DEFAULT '',
      marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed', '') DEFAULT '',
      nationality VARCHAR(100) DEFAULT '',
      personal_email VARCHAR(255) DEFAULT '',
      date_of_joining DATE,

      -- Documents / IDs
      pan_number VARCHAR(20) DEFAULT '',
      uan_number VARCHAR(20) DEFAULT '',
      bank_name VARCHAR(100) DEFAULT '',
      bank_account VARCHAR(30) DEFAULT '',
      ifsc_code VARCHAR(20) DEFAULT '',

      -- Profile / Resume
      about TEXT,
      skills JSON,
      certifications JSON,
      resume_text LONGTEXT,
      resume_entries JSON,
      education_entries JSON,

      -- Salary
      salary_monthly INT DEFAULT 0,
      salary_components JSON,

      -- Onboarding
      first_login BOOLEAN DEFAULT TRUE,

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

  // Seed default admin if no admin exists
  await seedDefaultAdmin(db);
}

async function seedDefaultAdmin(db: mysql.Pool): Promise<void> {
  const [rows] = await db.execute(
    "SELECT id FROM employees WHERE role = 'admin' LIMIT 1"
  );
  if ((rows as any[]).length > 0) return; // admin already exists

  // Create default company
  const [companyResult] = await db.execute(
    `INSERT INTO companies (name) VALUES (?)`,
    ['Odoo']
  );
  const companyId = (companyResult as any).insertId;

  // Create default admin
  const passwordHash = await bcrypt.hash('admin123', 10);
  await db.execute(
    `INSERT INTO employees (employee_id, company_id, name, email, password_hash, role, position, department, location, first_login)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'DFADMN20240001',
      companyId,
      'Admin',
      'admin@dayflow.in',
      passwordHash,
      'admin',
      'HR Manager',
      'Human Resources',
      'Bangalore, India',
      false,
    ]
  );
  console.log('✅ Seeded default admin: admin@dayflow.in / admin123');
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
