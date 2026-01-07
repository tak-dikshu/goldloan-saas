export interface Shop {
  id: number;
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  default_interest_rate: number;
  default_tenure_days: number;
  logo_url?: string;
  created_at: string;
}

export interface User {
  shopId: number;
  shop: Shop;
  token: string;
}

export interface Customer {
  id: number;
  shop_id: number;
  name: string;
  phone: string;
  address: string;
  email?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: number;
  loan_number: string;
  shop_id: number;
  customer_id: number;
  ornament_type: string;
  gross_weight: number;
  stone_weight: number;
  net_weight: number;
  purity: string;
  rate_per_gram: number;
  gold_value: number;
  loan_amount: number;
  interest_rate: number;
  tenure_days: number;
  start_date: string;
  due_date: string;
  status: 'active' | 'closed' | 'overdue';
  principal_paid: number;
  interest_paid: number;
  total_paid: number;
  principal_balance: number;
  interest_balance: number;
  total_balance: number;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanWithCustomer extends Loan {
  customer_name: string;
  customer_phone: string;
}

export interface Payment {
  id: number;
  payment_number: string;
  loan_id: number;
  shop_id: number;
  amount: number;
  principal_paid: number;
  interest_paid: number;
  payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  payment_date: string;
  notes?: string;
  created_at: string;
}

export interface DashboardStats {
  active_loans: number;
  total_loan_amount: number;
  total_gold_weight: number;
  overdue_loans: number;
  today_loans: number;
  today_collections: number;
  total_customers: number;
  total_interest_earned: number;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  address: string;
  email?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  photo_url?: string;
}

export interface CreateLoanRequest {
  customer_id: number;
  ornament_type: string;
  gross_weight: number;
  stone_weight: number;
  purity: string;
  rate_per_gram: number;
  loan_amount: number;
  interest_rate: number;
  tenure_days: number;
  start_date: string;
}

export interface CreatePaymentRequest {
  loan_id: number;
  amount: number;
  payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
  payment_date: string;
  notes?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  gstin?: string;
  default_interest_rate: number;
  default_tenure_days: number;
}
