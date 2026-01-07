import { Response } from 'express';
import { LoanService } from '../services/loanService';
import { AuthRequest } from '../middleware/auth';
import { createLoanSchema } from '../utils/validation';

export class LoanController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validated = createLoanSchema.parse(req.body);
      const loan = LoanService.create(req.shopId, validated);
      res.status(201).json(loan);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message || 'Failed to create loan' });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const status = req.query.status as string | undefined;
      const loans = LoanService.getAll(req.shopId, status);
      res.json(loans);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch loans' });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const loanId = parseInt(req.params.id);
      const loan = LoanService.getById(req.shopId, loanId);

      if (!loan) {
        res.status(404).json({ error: 'Loan not found' });
        return;
      }

      res.json(loan);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch loan' });
    }
  }

  static async getByCustomer(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const customerId = parseInt(req.params.customerId);
      const loans = LoanService.getByCustomer(req.shopId, customerId);
      res.json(loans);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch customer loans' });
    }
  }

  static async getOverdue(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const loans = LoanService.getOverdueLoans(req.shopId);
      res.json(loans);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch overdue loans' });
    }
  }

  static async close(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const loanId = parseInt(req.params.id);
      const loan = LoanService.closeLoan(req.shopId, loanId);
      res.json(loan);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to close loan' });
    }
  }
}
