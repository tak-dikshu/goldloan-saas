import { db } from '../database';
import { Customer, CreateCustomerRequest } from '../types';

export class CustomerService {
  static create(shopId: number, data: CreateCustomerRequest): Customer {
    const result = db
      .prepare(`
        INSERT INTO customers (
          shop_id, name, mobile, email, address, city, state, pincode,
          id_proof_type, id_proof_number, photo_url, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        shopId,
        data.name,
        data.mobile,
        data.email || null,
        data.address || null,
        data.city || null,
        data.state || null,
        data.pincode || null,
        data.id_proof_type || null,
        data.id_proof_number || null,
        data.photo_url || null,
        data.notes || null
      );

    return db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid) as Customer;
  }

  static getAll(shopId: number): Customer[] {
    return db
      .prepare('SELECT * FROM customers WHERE shop_id = ? AND is_active = 1 ORDER BY created_at DESC')
      .all(shopId) as Customer[];
  }

  static getById(shopId: number, customerId: number): Customer | undefined {
    return db
      .prepare('SELECT * FROM customers WHERE id = ? AND shop_id = ? AND is_active = 1')
      .get(customerId, shopId) as Customer | undefined;
  }

  static update(shopId: number, customerId: number, data: Partial<CreateCustomerRequest>): Customer {
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('updated_at = strftime("%s", "now")');
    values.push(customerId, shopId);

    db.prepare(`UPDATE customers SET ${updates.join(', ')} WHERE id = ? AND shop_id = ?`).run(...values);

    return this.getById(shopId, customerId)!;
  }

  static delete(shopId: number, customerId: number): void {
    // Check if customer has any loans
    const loanCount = db
      .prepare('SELECT COUNT(*) as count FROM loans WHERE customer_id = ? AND shop_id = ?')
      .get(customerId, shopId) as { count: number };

    if (loanCount.count > 0) {
      throw new Error('Cannot delete customer with existing loans');
    }

    db.prepare('UPDATE customers SET is_active = 0, updated_at = strftime("%s", "now") WHERE id = ? AND shop_id = ?').run(
      customerId,
      shopId
    );
  }

  static search(shopId: number, query: string): Customer[] {
    const searchPattern = `%${query}%`;
    return db
      .prepare(`
        SELECT * FROM customers 
        WHERE shop_id = ? AND is_active = 1
        AND (name LIKE ? OR mobile LIKE ? OR email LIKE ?)
        ORDER BY created_at DESC
        LIMIT 50
      `)
      .all(shopId, searchPattern, searchPattern, searchPattern) as Customer[];
  }
}
