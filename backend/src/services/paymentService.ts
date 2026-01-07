import { db } from '../database';
import { Payment, CreatePaymentRequest, Loan } from '../types';
import {
  generatePaymentNumber,
  rupeesToPaise,
  dateToTimestamp,
  calculateAccruedInterest,
  timestampToDate,
} from '../utils/calculations';

export class PaymentService {
  static create(shopId: number, data: CreatePaymentRequest): Payment {
    // Get loan
    const loan = db.prepare('SELECT * FROM loans WHERE id = ? AND shop_id = ?').get(data.loan_id, shopId) as
      | Loan
      | undefined;

    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status === 'closed') {
      throw new Error('Cannot add payment to closed loan');
    }

    // Convert amount to paise
    const amountPaise = rupeesToPaise(data.amount);

    if (amountPaise <= 0) {
      throw new Error('Payment amount must be positive');
    }

    // Calculate accrued interest up to payment date
    const paymentDate = new Date(data.payment_date);
    const startDate = timestampToDate(loan.start_date);
    const accruedInterest = calculateAccruedInterest(
      loan.outstanding_principal_paise,
      loan.interest_rate_percent,
      startDate,
      paymentDate
    );

    // Calculate total outstanding (principal + accrued interest)
    const totalOutstanding = loan.outstanding_principal_paise + accruedInterest;

    if (amountPaise > totalOutstanding) {
      throw new Error('Payment amount exceeds outstanding balance');
    }

    // Payment allocation: Interest first, then principal
    let remainingAmount = amountPaise;
    let interestPaid = 0;
    let principalPaid = 0;

    // Pay interest first
    if (accruedInterest > 0) {
      interestPaid = Math.min(remainingAmount, accruedInterest);
      remainingAmount -= interestPaid;
    }

    // Pay principal with remaining amount
    if (remainingAmount > 0) {
      principalPaid = Math.min(remainingAmount, loan.outstanding_principal_paise);
    }

    // Calculate new balances
    const newOutstandingPrincipal = loan.outstanding_principal_paise - principalPaid;
    const newOutstandingInterest = accruedInterest - interestPaid;
    const newTotalInterestPaid = loan.total_interest_paid_paise + interestPaid;
    const newTotalPrincipalPaid = loan.total_principal_paid_paise + principalPaid;

    // Generate payment number
    let paymentNumber = generatePaymentNumber();
    let attempts = 0;
    while (
      db.prepare('SELECT id FROM payments WHERE payment_number = ?').get(paymentNumber) &&
      attempts < 10
    ) {
      paymentNumber = generatePaymentNumber();
      attempts++;
    }

    // Start transaction
    const insertPayment = db.prepare(`
      INSERT INTO payments (
        shop_id, loan_id, payment_number,
        amount_paise, interest_paid_paise, principal_paid_paise,
        payment_mode, payment_reference, payment_date,
        outstanding_principal_after_paise, outstanding_interest_after_paise,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateLoan = db.prepare(`
      UPDATE loans 
      SET 
        outstanding_principal_paise = ?,
        outstanding_interest_paise = ?,
        total_interest_paid_paise = ?,
        total_principal_paid_paise = ?,
        updated_at = strftime('%s', 'now')
      WHERE id = ? AND shop_id = ?
    `);

    const transaction = db.transaction(() => {
      // Insert payment
      const result = insertPayment.run(
        shopId,
        data.loan_id,
        paymentNumber,
        amountPaise,
        interestPaid,
        principalPaid,
        data.payment_mode,
        data.payment_reference || null,
        dateToTimestamp(paymentDate),
        newOutstandingPrincipal,
        newOutstandingInterest,
        data.notes || null
      );

      // Update loan balances
      updateLoan.run(
        newOutstandingPrincipal,
        newOutstandingInterest,
        newTotalInterestPaid,
        newTotalPrincipalPaid,
        data.loan_id,
        shopId
      );

      return result.lastInsertRowid;
    });

    const paymentId = transaction() as number;

    // Auto-close loan if fully paid
    if (newOutstandingPrincipal === 0 && newOutstandingInterest === 0) {
      db.prepare(`
        UPDATE loans 
        SET status = 'closed', closed_at = ?, updated_at = strftime('%s', 'now')
        WHERE id = ? AND shop_id = ?
      `).run(dateToTimestamp(new Date()), data.loan_id, shopId);
    }

    return db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId) as Payment;
  }

  static getByLoan(shopId: number, loanId: number): Payment[] {
    // Verify loan belongs to shop
    const loan = db.prepare('SELECT id FROM loans WHERE id = ? AND shop_id = ?').get(loanId, shopId);

    if (!loan) {
      throw new Error('Loan not found');
    }

    return db
      .prepare(`
        SELECT * FROM payments 
        WHERE loan_id = ? AND shop_id = ?
        ORDER BY payment_date DESC
      `)
      .all(loanId, shopId) as Payment[];
  }

  static getById(shopId: number, paymentId: number): Payment | undefined {
    return db
      .prepare('SELECT * FROM payments WHERE id = ? AND shop_id = ?')
      .get(paymentId, shopId) as Payment | undefined;
  }

  static getAll(shopId: number, limit: number = 100): Payment[] {
    return db
      .prepare(`
        SELECT * FROM payments 
        WHERE shop_id = ?
        ORDER BY payment_date DESC
        LIMIT ?
      `)
      .all(shopId, limit) as Payment[];
  }

  static getTodayPayments(shopId: number): Payment[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = dateToTimestamp(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = dateToTimestamp(tomorrow);

    return db
      .prepare(`
        SELECT * FROM payments 
        WHERE shop_id = ? AND payment_date >= ? AND payment_date < ?
        ORDER BY payment_date DESC
      `)
      .all(shopId, todayTimestamp, tomorrowTimestamp) as Payment[];
  }

  static getTotalCollections(shopId: number, startDate?: Date, endDate?: Date): number {
    let query = 'SELECT SUM(amount_paise) as total FROM payments WHERE shop_id = ?';
    const params: any[] = [shopId];

    if (startDate) {
      query += ' AND payment_date >= ?';
      params.push(dateToTimestamp(startDate));
    }

    if (endDate) {
      query += ' AND payment_date <= ?';
      params.push(dateToTimestamp(endDate));
    }

    const result = db.prepare(query).get(...params) as { total: number | null };

    return result.total || 0;
  }
}
