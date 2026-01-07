import { db } from '../database';
import { DashboardStats } from '../types';
import { paiseToRupees, dateToTimestamp } from '../utils/calculations';

export class DashboardService {
  static getStats(shopId: number): DashboardStats {
    // Total active loans and loan amount
    const activeLoans = db
      .prepare(`
        SELECT 
          COUNT(*) as count,
          SUM(outstanding_principal_paise) as total_principal,
          SUM(net_weight_grams) as total_weight
        FROM loans 
        WHERE shop_id = ? AND status = 'active'
      `)
      .get(shopId) as {
      count: number;
      total_principal: number | null;
      total_weight: number | null;
    };

    // Overdue loans
    const currentTimestamp = dateToTimestamp(new Date());
    const overdueLoans = db
      .prepare(`
        SELECT COUNT(*) as count
        FROM loans 
        WHERE shop_id = ? AND status = 'active' AND due_date < ?
      `)
      .get(shopId, currentTimestamp) as { count: number };

    // Today's collections
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = dateToTimestamp(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = dateToTimestamp(tomorrow);

    const todayCollections = db
      .prepare(`
        SELECT SUM(amount_paise) as total
        FROM payments 
        WHERE shop_id = ? AND payment_date >= ? AND payment_date < ?
      `)
      .get(shopId, todayTimestamp, tomorrowTimestamp) as { total: number | null };

    // Total customers
    const totalCustomers = db
      .prepare('SELECT COUNT(*) as count FROM customers WHERE shop_id = ? AND is_active = 1')
      .get(shopId) as { count: number };

    // Total interest earned
    const totalInterest = db
      .prepare(`
        SELECT SUM(total_interest_paid_paise) as total
        FROM loans 
        WHERE shop_id = ?
      `)
      .get(shopId) as { total: number | null };

    return {
      total_active_loans: activeLoans.count,
      total_loan_amount: paiseToRupees(activeLoans.total_principal || 0),
      total_gold_weight: activeLoans.total_weight || 0,
      overdue_loans: overdueLoans.count,
      today_collections: paiseToRupees(todayCollections.total || 0),
      total_customers: totalCustomers.count,
      total_interest_earned: paiseToRupees(totalInterest.total || 0),
    };
  }

  static getRecentLoans(shopId: number, limit: number = 10) {
    return db
      .prepare(`
        SELECT 
          l.*,
          c.name as customer_name,
          c.mobile as customer_mobile
        FROM loans l
        INNER JOIN customers c ON l.customer_id = c.id
        WHERE l.shop_id = ?
        ORDER BY l.created_at DESC
        LIMIT ?
      `)
      .all(shopId, limit);
  }

  static getRecentPayments(shopId: number, limit: number = 10) {
    return db
      .prepare(`
        SELECT 
          p.*,
          l.loan_number,
          c.name as customer_name
        FROM payments p
        INNER JOIN loans l ON p.loan_id = l.id
        INNER JOIN customers c ON l.customer_id = c.id
        WHERE p.shop_id = ?
        ORDER BY p.payment_date DESC
        LIMIT ?
      `)
      .all(shopId, limit);
  }
}
