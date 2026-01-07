import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode').optional().or(z.literal('')),
  id_proof_type: z.string().optional(),
  id_proof_number: z.string().optional(),
  photo_url: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createLoanSchema = z.object({
  customer_id: z.number().int().positive('Customer ID is required'),
  ornament_type: z.string().min(1, 'Ornament type is required'),
  gross_weight_grams: z.number().positive('Gross weight must be positive'),
  stone_weight_grams: z.number().min(0, 'Stone weight cannot be negative').default(0),
  purity: z.enum(['18K', '22K', '24K', '916', '750'], {
    errorMap: () => ({ message: 'Invalid purity value' }),
  }),
  gold_rate_per_gram: z.number().positive('Gold rate must be positive'),
  principal_amount: z.number().positive('Loan amount must be positive'),
  interest_rate_percent: z.number().positive('Interest rate must be positive'),
  tenure_months: z.number().int().positive('Tenure must be positive'),
  start_date: z.string().datetime({ message: 'Invalid start date format' }),
});

export const createPaymentSchema = z.object({
  loan_id: z.number().int().positive('Loan ID is required'),
  amount: z.number().positive('Payment amount must be positive'),
  payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']),
  payment_reference: z.string().optional(),
  payment_date: z.string().datetime({ message: 'Invalid payment date format' }),
  notes: z.string().optional(),
});

export const updateShopSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gst_number: z.string().optional(),
  logo_url: z.string().optional(),
  default_interest_rate: z.number().positive().optional(),
  default_tenure_months: z.number().int().positive().optional(),
  legal_disclaimer: z.string().optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
});
