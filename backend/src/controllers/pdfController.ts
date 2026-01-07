import { Response } from 'express';
import { PDFService } from '../services/pdfService';
import { LoanService } from '../services/loanService';
import { PaymentService } from '../services/paymentService';
import { AuthRequest } from '../middleware/auth';

export class PDFController {
  static async generateLoanSanction(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId || !req.shop) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const loanId = parseInt(req.params.loanId);
      const loan = LoanService.getById(req.shopId, loanId);

      if (!loan) {
        res.status(404).json({ error: 'Loan not found' });
        return;
      }

      const pdfBuffer = await PDFService.generateLoanSanctionLetter(
        req.shop,
        loan,
        loan.customer
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="loan-${loan.loan_number}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to generate PDF' });
    }
  }

  static async generatePaymentReceipt(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId || !req.shop) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const paymentId = parseInt(req.params.paymentId);
      const payment = PaymentService.getById(req.shopId, paymentId);

      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      const loan = LoanService.getById(req.shopId, payment.loan_id);

      if (!loan) {
        res.status(404).json({ error: 'Loan not found' });
        return;
      }

      const pdfBuffer = await PDFService.generatePaymentReceipt(
        req.shop,
        payment,
        loan,
        loan.customer
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="receipt-${payment.payment_number}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to generate PDF' });
    }
  }
}
