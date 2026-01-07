import { Router } from 'express';
import { LoanController } from '../controllers/loanController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', LoanController.create);
router.get('/', LoanController.getAll);
router.get('/overdue', LoanController.getOverdue);
router.get('/customer/:customerId', LoanController.getByCustomer);
router.get('/:id', LoanController.getById);
router.post('/:id/close', LoanController.close);

export default router;
