import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { db } from '../database';
import { Shop } from '../types';

export interface AuthRequest extends Request {
  shop?: Shop;
  shopId?: number;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwtSecret) as { shopId: number };

    const shop = db
      .prepare('SELECT * FROM shops WHERE id = ? AND is_active = 1')
      .get(decoded.shopId) as Shop | undefined;

    if (!shop) {
      res.status(401).json({ error: 'Invalid token or shop not found' });
      return;
    }

    req.shop = shop;
    req.shopId = shop.id;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};
