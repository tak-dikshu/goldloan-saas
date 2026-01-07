import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', PaymentController.create);
router.get('/', PaymentController.getAll);
router.get('/today', PaymentController.getTodayPayments);
router.get('/loan/:loanId', PaymentController.getByLoan);
router.get('/:id', PaymentController.getById);

export default router;
