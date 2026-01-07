import { Response } from 'express';
import { ShopService } from '../services/shopService';
import { AuthRequest } from '../middleware/auth';
import { updateShopSchema } from '../utils/validation';

export class ShopController {
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
      res.status(500).json({ error: error.message || 'Failed to fetch profile' });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validated = updateShopSchema.parse(req.body);
      const shop = ShopService.update(req.shopId, validated);

      const { password_hash, ...shopWithoutPassword } = shop;
      res.json(shopWithoutPassword);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message || 'Failed to update profile' });
    }
  }
}
