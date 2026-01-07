import { stringify } from 'csv-stringify/sync';
import { Loan, LoanWithCustomer, Payment, Customer } from '../types';
import {
  formatDateIndian,
  paiseToRupees,
  timestampToDate,
  formatCurrency,
} from '../utils/calculations';

export class ExportService {
  /**
   * Export loans to CSV
   */
  static exportLoansToCSV(loans: LoanWithCustomer[]): string {
    const records = loans.map((loan) => ({
      'Loan Number': loan.loan_number,
      'Customer Name': loan.customer.name,
      'Customer Mobile': loan.customer.mobile,
      'Ornament Type': loan.ornament_type,
      'Net Weight (g)': loan.net_weight_grams.toFixed(3),
      'Purity': loan.purity,
      'Gold Rate': loan.gold_rate_per_gram,
      'Gold Value': paiseToRupees(loan.gold_value_paise).toFixed(2),
      'Principal Amount': paiseToRupees(loan.principal_amount_paise).toFixed(2),
      'Interest Rate (%)': loan.interest_rate_percent,
      'Tenure (months)': loan.tenure_months,
      'Start Date': formatDateIndian(timestampToDate(loan.start_date)),
      'Due Date': formatDateIndian(timestampToDate(loan.due_date)),
      'Outstanding Principal': paiseToRupees(loan.outstanding_principal_paise).toFixed(2),
      'Outstanding Interest': paiseToRupees(loan.outstanding_interest_paise).toFixed(2),
      'Total Interest Paid': paiseToRupees(loan.total_interest_paid_paise).toFixed(2),
      'Total Principal Paid': paiseToRupees(loan.total_principal_paid_paise).toFixed(2),
      'Status': loan.status.toUpperCase(),
      'Created Date': formatDateIndian(timestampToDate(loan.created_at)),
    }));

    return stringify(records, {
      header: true,
      quoted: true,
    });
  }

  /**
   * Export payments to CSV
   */
  static exportPaymentsToCSV(payments: Payment[], loans: Map<number, Loan>, customers: Map<number, Customer>): string {
    const records = payments.map((payment) => {
      const loan = loans.get(payment.loan_id);
      const customer = loan ? customers.get(loan.customer_id) : undefined;

      return {
        'Payment Number': payment.payment_number,
        'Loan Number': loan?.loan_number || 'N/A',
        'Customer Name': customer?.name || 'N/A',
        'Customer Mobile': customer?.mobile || 'N/A',
        'Amount': paiseToRupees(payment.amount_paise).toFixed(2),
        'Interest Paid': paiseToRupees(payment.interest_paid_paise).toFixed(2),
        'Principal Paid': paiseToRupees(payment.principal_paid_paise).toFixed(2),
        'Payment Mode': payment.payment_mode.toUpperCase(),
        'Payment Reference': payment.payment_reference || '',
        'Payment Date': formatDateIndian(timestampToDate(payment.payment_date)),
        'Outstanding Principal After': paiseToRupees(payment.outstanding_principal_after_paise).toFixed(2),
        'Outstanding Interest After': paiseToRupees(payment.outstanding_interest_after_paise).toFixed(2),
        'Notes': payment.notes || '',
      };
    });

    return stringify(records, {
      header: true,
      quoted: true,
    });
  }

  /**
   * Export customers to CSV
   */
  static exportCustomersToCSV(customers: Customer[]): string {
    const records = customers.map((customer) => ({
      'Name': customer.name,
      'Mobile': customer.mobile,
      'Email': customer.email || '',
      'Address': customer.address || '',
      'City': customer.city || '',
      'State': customer.state || '',
      'Pincode': customer.pincode || '',
      'ID Proof Type': customer.id_proof_type || '',
      'ID Proof Number': customer.id_proof_number || '',
      'Notes': customer.notes || '',
      'Created Date': formatDateIndian(timestampToDate(customer.created_at)),
    }));

    return stringify(records, {
      header: true,
      quoted: true,
    });
  }

  /**
   * Export dashboard summary to CSV
   */
  static exportDashboardSummaryToCSV(stats: any): string {
    const records = [
      { 'Metric': 'Total Active Loans', 'Value': stats.total_active_loans },
      { 'Metric': 'Total Loan Amount', 'Value': formatCurrency(stats.total_loan_amount) },
      { 'Metric': 'Total Gold Weight (g)', 'Value': stats.total_gold_weight.toFixed(3) },
      { 'Metric': 'Overdue Loans', 'Value': stats.overdue_loans },
      { 'Metric': "Today's Collections", 'Value': formatCurrency(stats.today_collections) },
      { 'Metric': 'Total Customers', 'Value': stats.total_customers },
      { 'Metric': 'Total Interest Earned', 'Value': formatCurrency(stats.total_interest_earned) },
    ];

    return stringify(records, {
      header: true,
      quoted: true,
    });
  }
}
