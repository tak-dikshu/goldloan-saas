import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', DashboardController.getStats);
router.get('/recent-loans', DashboardController.getRecentLoans);
router.get('/recent-payments', DashboardController.getRecentPayments);

export default router;
