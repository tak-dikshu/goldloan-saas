import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database';
import { config } from '../config';
import { Shop, RegisterRequest, AuthResponse } from '../types';

export class AuthService {
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    // Check if email already exists
    const existingShop = db
      .prepare('SELECT id FROM shops WHERE email = ?')
      .get(data.email);

    if (existingShop) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Insert shop
    const result = db
      .prepare(`
        INSERT INTO shops (name, email, password_hash, phone, address)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(data.name, data.email, passwordHash, data.phone || null, data.address || null);

    const shopId = result.lastInsertRowid as number;

    // Get created shop
    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopId) as Shop;

    // Generate token
    const token = jwt.sign({ shopId: shop.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);

    // Return shop without password
    const { password_hash, ...shopWithoutPassword } = shop;

    return {
      token,
      shop: shopWithoutPassword,
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find shop
    const shop = db.prepare('SELECT * FROM shops WHERE email = ? AND is_active = 1').get(email) as
      | Shop
      | undefined;

    if (!shop) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, shop.password_hash);

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = jwt.sign({ shopId: shop.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);

    // Return shop without password
    const { password_hash, ...shopWithoutPassword } = shop;

    return {
      token,
      shop: shopWithoutPassword,
    };
  }

  static async changePassword(
    shopId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get shop
    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopId) as Shop | undefined;

    if (!shop) {
      throw new Error('Shop not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, shop.password_hash);

    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    db.prepare('UPDATE shops SET password_hash = ?, updated_at = strftime("%s", "now") WHERE id = ?').run(
      newPasswordHash,
      shopId
    );
  }
}
