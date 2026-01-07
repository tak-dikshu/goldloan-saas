export interface Shop {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  address?: string;
  gst_number?: string;
  logo_url?: string;
  default_interest_rate: number;
  default_tenure_months: number;
  legal_disclaimer: string;
  is_active: number;
  created_at: number;
  updated_at: number;
}

export interface User {
  id: number;
  shop_id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'staff';
  is_active: number;
  created_at: number;
  updated_at: number;
}

export interface Customer {
  id: number;
  shop_id: number;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  photo_url?: string;
  notes?: string;
  is_active: number;
  created_at: number;
  updated_at: number;
}

export interface Loan {
  id: number;
  shop_id: number;
  customer_id: number;
  loan_number: string;
  
  // Gold details
  ornament_type: string;
  gross_weight_grams: number;
  stone_weight_grams: number;
  net_weight_grams: number;
  purity: string;
  gold_rate_per_gram: number;
  gold_value_paise: number;
  
  // Loan details
  principal_amount_paise: number;
  interest_rate_percent: number;
  tenure_months: number;
  start_date: number;
  due_date: number;
  
  // Balances (in paise)
  outstanding_principal_paise: number;
  outstanding_interest_paise: number;
  total_interest_paid_paise: number;
  total_principal_paid_paise: number;
  
  // Status
  status: 'active' | 'closed' | 'overdue';
  closed_at?: number;
  
  // Audit
  created_by?: number;
  created_at: number;
  updated_at: number;
}

export interface Payment {
  id: number;
  shop_id: number;
  loan_id: number;
  payment_number: string;
  
  amount_paise: number;
  interest_paid_paise: number;
  principal_paid_paise: number;
  payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  payment_reference?: string;
  payment_date: number;
  
  outstanding_principal_after_paise: number;
  outstanding_interest_after_paise: number;
  
  notes?: string;
  created_by?: number;
  created_at: number;
}

export interface AuditLog {
  id: number;
  shop_id: number;
  user_id?: number;
  entity_type: string;
  entity_id: number;
  action: string;
  old_values?: string;
  new_values?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: number;
}

// Request/Response Types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  shop: Omit<Shop, 'password_hash'>;
}

export interface CreateCustomerRequest {
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  photo_url?: string;
  notes?: string;
}

export interface CreateLoanRequest {
  customer_id: number;
  
  // Gold details
  ornament_type: string;
  gross_weight_grams: number;
  stone_weight_grams: number;
  purity: string;
  gold_rate_per_gram: number;
  
  // Loan details
  principal_amount: number; // In rupees (will be converted to paise)
  interest_rate_percent: number;
  tenure_months: number;
  start_date: string; // ISO date string
}

export interface CreatePaymentRequest {
  loan_id: number;
  amount: number; // In rupees (will be converted to paise)
  payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  payment_reference?: string;
  payment_date: string; // ISO date string
  notes?: string;
}

export interface LoanWithCustomer extends Loan {
  customer: Customer;
}

export interface PaymentWithLoan extends Payment {
  loan: Loan;
  customer: Customer;
}

export interface DashboardStats {
  total_active_loans: number;
  total_loan_amount: number; // In rupees
  total_gold_weight: number; // In grams
  overdue_loans: number;
  today_collections: number; // In rupees
  total_customers: number;
  total_interest_earned: number; // In rupees
}
