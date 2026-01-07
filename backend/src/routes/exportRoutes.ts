import { Router } from 'express';
import { ExportController } from '../controllers/exportController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/loans', ExportController.exportLoans);
router.get('/payments', ExportController.exportPayments);
router.get('/customers', ExportController.exportCustomers);
router.get('/dashboard', ExportController.exportDashboard);

export default router;
