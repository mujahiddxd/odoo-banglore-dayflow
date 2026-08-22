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
      working_minutes INT DEFAULT 0,
      break_minutes INT DEFAULT 0,
      extra_minutes INT DEFAULT 0,
      status ENUM('NOT_CHECKED_IN','CHECKED_IN','CHECKED_OUT','PRESENT','ABSENT','ON_LEAVE','HALF_DAY') DEFAULT 'NOT_CHECKED_IN',
      ip_address VARCHAR(45),
      network_id INT,
      office_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      UNIQUE KEY unique_employee_date (employee_id, date)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS offices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS approved_networks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      office_id INT,
      network_name VARCHAR(255) NOT NULL,
      ipv4 VARCHAR(45),
      cidr VARCHAR(50),
      ipv6 VARCHAR(45),
      enabled BOOLEAN DEFAULT TRUE,
      valid_from DATE,
      valid_until DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS attendance_audit (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      action ENUM('CHECK_IN_SUCCESS','CHECK_IN_FAILED','CHECK_OUT_SUCCESS','CHECK_OUT_FAILED','INVALID_NETWORK','ALREADY_CHECKED_IN','ALREADY_CHECKED_OUT') NOT NULL,
      timestamp DATETIME NOT NULL,
      ip_address VARCHAR(45),
      network_id INT,
      office_id INT,
      success BOOLEAN DEFAULT FALSE,
      failure_reason TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS time_off_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      is_paid BOOLEAN DEFAULT TRUE,
      allocation_required BOOLEAN DEFAULT TRUE,
      max_allocation INT DEFAULT 30,
      allow_negative_balance BOOLEAN DEFAULT FALSE,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS time_off_allocations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      type_id INT NOT NULL,
      year INT NOT NULL,
      allocated_days DECIMAL(5,2) DEFAULT 0,
      used_days DECIMAL(5,2) DEFAULT 0,
      pending_days DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (type_id) REFERENCES time_off_types(id) ON DELETE CASCADE,
      UNIQUE KEY unique_employee_type_year (employee_id, type_id, year)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS time_off_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      type_id INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days DECIMAL(5,2) NOT NULL,
      reason TEXT,
      status ENUM('PENDING','APPROVED','REJECTED','CANCELLED') DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (type_id) REFERENCES time_off_types(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS time_off_approval_audit (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      action ENUM('APPROVED','REJECTED','CANCELLED') NOT NULL,
      performed_by INT NOT NULL,
      timestamp DATETIME NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES time_off_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (performed_by) REFERENCES employees(id) ON DELETE CASCADE
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
