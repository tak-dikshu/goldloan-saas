import { db } from '../database';
import { Loan, LoanWithCustomer, CreateLoanRequest, Customer } from '../types';
import {
  calculateNetWeight,
  calculateGoldValue,
  calculateDueDate,
  calculateAccruedInterest,
  generateLoanNumber,
  rupeesToPaise,
  dateToTimestamp,
  timestampToDate,
} from '../utils/calculations';

export class LoanService {
  static create(shopId: number, data: CreateLoanRequest): Loan {
    // Validate customer exists
    const customer = db
      .prepare('SELECT * FROM customers WHERE id = ? AND shop_id = ?')
      .get(data.customer_id, shopId);

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Calculate net weight
    const netWeightGrams = calculateNetWeight(data.gross_weight_grams, data.stone_weight_grams);

    if (netWeightGrams <= 0) {
      throw new Error('Net weight must be positive');
    }

    // Calculate gold value
    const goldValuePaise = calculateGoldValue(netWeightGrams, data.gold_rate_per_gram);

    // Convert principal to paise
    const principalPaise = rupeesToPaise(data.principal_amount);

    // Validate principal doesn't exceed gold value
    if (principalPaise > goldValuePaise) {
      throw new Error('Loan amount cannot exceed gold value');
    }

    // Parse dates
    const startDate = new Date(data.start_date);
    const dueDate = calculateDueDate(startDate, data.tenure_months);

    // Generate unique loan number
    let loanNumber = generateLoanNumber();
    let attempts = 0;
    while (db.prepare('SELECT id FROM loans WHERE loan_number = ?').get(loanNumber) && attempts < 10) {
      loanNumber = generateLoanNumber();
      attempts++;
    }

    // Insert loan
    const result = db
      .prepare(`
        INSERT INTO loans (
          shop_id, customer_id, loan_number,
          ornament_type, gross_weight_grams, stone_weight_grams, net_weight_grams,
          purity, gold_rate_per_gram, gold_value_paise,
          principal_amount_paise, interest_rate_percent, tenure_months,
          start_date, due_date,
          outstanding_principal_paise, outstanding_interest_paise,
          total_interest_paid_paise, total_principal_paid_paise,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        shopId,
        data.customer_id,
        loanNumber,
        data.ornament_type,
        data.gross_weight_grams,
        data.stone_weight_grams,
        netWeightGrams,
        data.purity,
        data.gold_rate_per_gram,
        goldValuePaise,
        principalPaise,
        data.interest_rate_percent,
        data.tenure_months,
        dateToTimestamp(startDate),
        dateToTimestamp(dueDate),
        principalPaise,
        0,
        0,
        0,
        'active'
      );

    return db.prepare('SELECT * FROM loans WHERE id = ?').get(result.lastInsertRowid) as Loan;
  }

  static getAll(shopId: number, status?: string): LoanWithCustomer[] {
    let query = `
      SELECT 
        l.*,
        c.id as customer_id,
        c.name as customer_name,
        c.mobile as customer_mobile,
        c.email as customer_email,
        c.address as customer_address,
        c.photo_url as customer_photo_url
      FROM loans l
      INNER JOIN customers c ON l.customer_id = c.id
      WHERE l.shop_id = ?
    `;

    const params: any[] = [shopId];

    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    query += ' ORDER BY l.created_at DESC';

    const loans = db.prepare(query).all(...params) as any[];

    return loans.map((row) => {
      const {
        customer_id,
        customer_name,
        customer_mobile,
        customer_email,
        customer_address,
        customer_photo_url,
        ...loanData
      } = row;

      return {
        ...loanData,
        customer: {
          id: customer_id,
          name: customer_name,
          mobile: customer_mobile,
          email: customer_email,
          address: customer_address,
          photo_url: customer_photo_url,
        } as Customer,
      } as LoanWithCustomer;
    });
  }

  static getById(shopId: number, loanId: number): LoanWithCustomer | undefined {
    const row = db
      .prepare(`
        SELECT 
          l.*,
          c.*
        FROM loans l
        INNER JOIN customers c ON l.customer_id = c.id
        WHERE l.id = ? AND l.shop_id = ?
      `)
      .get(loanId, shopId) as any;

    if (!row) {
      return undefined;
    }

    // Separate loan and customer data
    const loan: Loan = {
      id: row.id,
      shop_id: row.shop_id,
      customer_id: row.customer_id,
      loan_number: row.loan_number,
      ornament_type: row.ornament_type,
      gross_weight_grams: row.gross_weight_grams,
      stone_weight_grams: row.stone_weight_grams,
      net_weight_grams: row.net_weight_grams,
      purity: row.purity,
      gold_rate_per_gram: row.gold_rate_per_gram,
      gold_value_paise: row.gold_value_paise,
      principal_amount_paise: row.principal_amount_paise,
      interest_rate_percent: row.interest_rate_percent,
      tenure_months: row.tenure_months,
      start_date: row.start_date,
      due_date: row.due_date,
      outstanding_principal_paise: row.outstanding_principal_paise,
      outstanding_interest_paise: row.outstanding_interest_paise,
      total_interest_paid_paise: row.total_interest_paid_paise,
      total_principal_paid_paise: row.total_principal_paid_paise,
      status: row.status,
      closed_at: row.closed_at,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    const customer: Customer = db
      .prepare('SELECT * FROM customers WHERE id = ?')
      .get(row.customer_id) as Customer;

    return {
      ...loan,
      customer,
    };
  }

  static calculateCurrentInterest(loan: Loan): number {
    // Calculate interest from start date to now
    const startDate = timestampToDate(loan.start_date);
    const currentDate = new Date();

    return calculateAccruedInterest(
      loan.outstanding_principal_paise,
      loan.interest_rate_percent,
      startDate,
      currentDate
    );
  }

  static getByCustomer(shopId: number, customerId: number): Loan[] {
    return db
      .prepare(`
        SELECT * FROM loans 
        WHERE shop_id = ? AND customer_id = ?
        ORDER BY created_at DESC
      `)
      .all(shopId, customerId) as Loan[];
  }

  static getOverdueLoans(shopId: number): LoanWithCustomer[] {
    const currentTimestamp = dateToTimestamp(new Date());

    const loans = db
      .prepare(`
        SELECT 
          l.*,
          c.*
        FROM loans l
        INNER JOIN customers c ON l.customer_id = c.id
        WHERE l.shop_id = ? AND l.status = 'active' AND l.due_date < ?
        ORDER BY l.due_date ASC
      `)
      .all(shopId, currentTimestamp) as any[];

    return loans.map((row) => {
      const loan: Loan = {
        id: row.id,
        shop_id: row.shop_id,
        customer_id: row.customer_id,
        loan_number: row.loan_number,
        ornament_type: row.ornament_type,
        gross_weight_grams: row.gross_weight_grams,
        stone_weight_grams: row.stone_weight_grams,
        net_weight_grams: row.net_weight_grams,
        purity: row.purity,
        gold_rate_per_gram: row.gold_rate_per_gram,
        gold_value_paise: row.gold_value_paise,
        principal_amount_paise: row.principal_amount_paise,
        interest_rate_percent: row.interest_rate_percent,
        tenure_months: row.tenure_months,
        start_date: row.start_date,
        due_date: row.due_date,
        outstanding_principal_paise: row.outstanding_principal_paise,
        outstanding_interest_paise: row.outstanding_interest_paise,
        total_interest_paid_paise: row.total_interest_paid_paise,
        total_principal_paid_paise: row.total_principal_paid_paise,
        status: row.status,
        closed_at: row.closed_at,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };

      const customer: Customer = db
        .prepare('SELECT * FROM customers WHERE id = ?')
        .get(row.customer_id) as Customer;

      return {
        ...loan,
        customer,
      };
    });
  }

  static closeLoan(shopId: number, loanId: number): Loan {
    const loan = db.prepare('SELECT * FROM loans WHERE id = ? AND shop_id = ?').get(loanId, shopId) as
      | Loan
      | undefined;

    if (!loan) {
      throw new Error('Loan not found');
    }

    if (loan.status === 'closed') {
      throw new Error('Loan already closed');
    }

    if (loan.outstanding_principal_paise > 0 || loan.outstanding_interest_paise > 0) {
      throw new Error('Cannot close loan with outstanding balance');
    }

    const currentTimestamp = dateToTimestamp(new Date());

    db.prepare(`
      UPDATE loans 
      SET status = 'closed', closed_at = ?, updated_at = strftime('%s', 'now')
      WHERE id = ? AND shop_id = ?
    `).run(currentTimestamp, loanId, shopId);

    return db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId) as Loan;
  }
}
