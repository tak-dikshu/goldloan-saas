import { Response } from 'express';
import { ExportService } from '../services/exportService';
import { LoanService } from '../services/loanService';
import { PaymentService } from '../services/paymentService';
import { CustomerService } from '../services/customerService';
import { DashboardService } from '../services/dashboardService';
import { AuthRequest } from '../middleware/auth';
import { db } from '../database';
import { Loan, Customer } from '../types';

export class ExportController {
  static async exportLoans(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const status = req.query.status as string | undefined;
      const loans = LoanService.getAll(req.shopId, status);
      const csv = ExportService.exportLoansToCSV(loans);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="loans-export.csv"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to export loans' });
    }
  }

  static async exportPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 1000;
      const payments = PaymentService.getAll(req.shopId, limit);

      // Get related loans and customers
      const loanIds = [...new Set(payments.map((p) => p.loan_id))];
      const loans = new Map<number, Loan>();
      const customers = new Map<number, Customer>();

      loanIds.forEach((loanId) => {
        const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId) as Loan;
        if (loan) {
          loans.set(loan.id, loan);
          const customer = db
            .prepare('SELECT * FROM customers WHERE id = ?')
            .get(loan.customer_id) as Customer;
          if (customer) {
            customers.set(customer.id, customer);
          }
        }
      });

      const csv = ExportService.exportPaymentsToCSV(payments, loans, customers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="payments-export.csv"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to export payments' });
    }
  }

  static async exportCustomers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const customers = CustomerService.getAll(req.shopId);
      const csv = ExportService.exportCustomersToCSV(customers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="customers-export.csv"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to export customers' });
    }
  }

  static async exportDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stats = DashboardService.getStats(req.shopId);
      const csv = ExportService.exportDashboardSummaryToCSV(stats);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="dashboard-summary.csv"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to export dashboard' });
    }
  }
}
