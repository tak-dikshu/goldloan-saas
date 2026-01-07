import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ShopService } from '../services/shopService';
import { AuthRequest } from '../middleware/auth';
import { registerSchema, loginSchema, changePasswordSchema } from '../utils/validation';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.register(validated);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated.email, validated.password);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const shop = ShopService.getById(req.shopId);
      if (!shop) {
        res.status(404).json({ error: 'Shop not found' });
        return;
      }

      const { password_hash, ...shopWithoutPassword } = shop;
      res.json(shopWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get profile' });
    }
  }

  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validated = changePasswordSchema.parse(req.body);
      await AuthService.changePassword(
        req.shopId,
        validated.current_password,
        validated.new_password
      );

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message || 'Failed to change password' });
    }
  }
}
