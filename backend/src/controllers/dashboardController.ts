import { Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { AuthRequest } from '../middleware/auth';

export class DashboardController {
  static async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stats = DashboardService.getStats(req.shopId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch dashboard stats' });
    }
  }

  static async getRecentLoans(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const loans = DashboardService.getRecentLoans(req.shopId, limit);
      res.json(loans);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch recent loans' });
    }
  }

  static async getRecentPayments(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const payments = DashboardService.getRecentPayments(req.shopId, limit);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch recent payments' });
    }
  }
}
