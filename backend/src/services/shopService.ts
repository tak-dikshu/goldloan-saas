import { db } from '../database';
import { Shop } from '../types';

export class ShopService {
  static getById(shopId: number): Shop | undefined {
    return db.prepare('SELECT * FROM shops WHERE id = ? AND is_active = 1').get(shopId) as
      | Shop
      | undefined;
  }

  static update(shopId: number, data: Partial<Shop>): Shop {
    const updates: string[] = [];
    const values: any[] = [];

    // Allowed fields to update
    const allowedFields = [
      'name',
      'phone',
      'address',
      'gst_number',
      'logo_url',
      'default_interest_rate',
      'default_tenure_months',
      'legal_disclaimer',
    ];

    Object.entries(data).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('updated_at = strftime("%s", "now")');
    values.push(shopId);

    db.prepare(`UPDATE shops SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    return this.getById(shopId)!;
  }

  static getPublicProfile(shopId: number): Omit<Shop, 'password_hash' | 'email'> | undefined {
    const shop = this.getById(shopId);
    if (!shop) return undefined;

    const { password_hash, email, ...publicProfile } = shop;
    return publicProfile;
  }
}
