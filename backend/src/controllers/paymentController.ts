import { Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { AuthRequest } from '../middleware/auth';
import { createPaymentSchema } from '../utils/validation';

export class PaymentController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validated = createPaymentSchema.parse(req.body);
      const payment = PaymentService.create(req.shopId, validated);
      res.status(201).json(payment);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message || 'Failed to create payment' });
    }
  }

  static async getByLoan(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const loanId = parseInt(req.params.loanId);
      const payments = PaymentService.getByLoan(req.shopId, loanId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch payments' });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const paymentId = parseInt(req.params.id);
      const payment = PaymentService.getById(req.shopId, paymentId);

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch payment' });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const payments = PaymentService.getAll(req.shopId, limit);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch payments' });
    }
  }

  static async getTodayPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const payments = PaymentService.getTodayPayments(req.shopId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch today payments' });
    }
  }
}
