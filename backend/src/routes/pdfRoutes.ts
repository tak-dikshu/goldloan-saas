import { Router } from 'express';
import { PDFController } from '../controllers/pdfController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/loan/:loanId', PDFController.generateLoanSanction);
router.get('/payment/:paymentId', PDFController.generatePaymentReceipt);

export default router;
