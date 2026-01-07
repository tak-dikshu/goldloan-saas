import Database from 'better-sqlite3';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

// Ensure data directory exists
const dataDir = path.dirname(config.databasePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
export const db: Database.Database = new Database(config.databasePath, {
  verbose: config.nodeEnv === 'development' ? console.log : undefined,
});

// Enable foreign keys and WAL mode for better concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Database schema
const schema = `
-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  gst_number TEXT,
  logo_url TEXT,
  default_interest_rate REAL DEFAULT 2.0,
  default_tenure_months INTEGER DEFAULT 12,
  legal_disclaimer TEXT DEFAULT 'This is a private gold loan. Not an NBFC.',
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Users table (for multi-user support per shop)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  UNIQUE(shop_id, email)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  id_proof_type TEXT,
  id_proof_number TEXT,
  photo_url TEXT,
  notes TEXT,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  loan_number TEXT UNIQUE NOT NULL,
  
  -- Gold details
  ornament_type TEXT NOT NULL,
  gross_weight_grams REAL NOT NULL,
  stone_weight_grams REAL DEFAULT 0,
  net_weight_grams REAL NOT NULL,
  purity TEXT NOT NULL,
  gold_rate_per_gram INTEGER NOT NULL,
  gold_value_paise INTEGER NOT NULL,
  
  -- Loan details
  principal_amount_paise INTEGER NOT NULL,
  interest_rate_percent REAL NOT NULL,
  tenure_months INTEGER NOT NULL,
  start_date INTEGER NOT NULL,
  due_date INTEGER NOT NULL,
  
  -- Balances (in paise)
  outstanding_principal_paise INTEGER NOT NULL,
  outstanding_interest_paise INTEGER DEFAULT 0,
  total_interest_paid_paise INTEGER DEFAULT 0,
  total_principal_paid_paise INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active',
  closed_at INTEGER,
  
  -- Audit
  created_by INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,
  loan_id INTEGER NOT NULL,
  payment_number TEXT UNIQUE NOT NULL,
  
  -- Payment details
  amount_paise INTEGER NOT NULL,
  interest_paid_paise INTEGER DEFAULT 0,
  principal_paid_paise INTEGER DEFAULT 0,
  payment_mode TEXT DEFAULT 'cash',
  payment_reference TEXT,
  payment_date INTEGER NOT NULL,
  
  -- Balances after payment
  outstanding_principal_after_paise INTEGER NOT NULL,
  outstanding_interest_after_paise INTEGER NOT NULL,
  
  notes TEXT,
  created_by INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,
  user_id INTEGER,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shops_email ON shops(email);
CREATE INDEX IF NOT EXISTS idx_users_shop_id ON users(shop_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_loans_shop_id ON loans(shop_id);
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_loan_number ON loans(loan_number);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_payments_shop_id ON payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_number ON payments(payment_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_shop_id ON audit_logs(shop_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
`;

// Initialize schema
export function initializeDatabase() {
  try {
    db.exec(schema);
    console.log('✓ Database schema initialized');
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    throw error;
  }
}

// Helper function to run migrations
export function runMigrations() {
  initializeDatabase();
}

// Close database connection
export function closeDatabase() {
  db.close();
}
