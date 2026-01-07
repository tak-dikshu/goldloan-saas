import { Response } from 'express';
import { CustomerService } from '../services/customerService';
import { AuthRequest } from '../middleware/auth';
import { createCustomerSchema, updateCustomerSchema } from '../utils/validation';

export class CustomerController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validated = createCustomerSchema.parse(req.body);
      const customer = CustomerService.create(req.shopId, validated);
      res.status(201).json(customer);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message || 'Failed to create customer' });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const customers = CustomerService.getAll(req.shopId);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch customers' });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const customerId = parseInt(req.params.id);
      const customer = CustomerService.getById(req.shopId, customerId);

      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch customer' });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const customerId = parseInt(req.params.id);
      const validated = updateCustomerSchema.parse(req.body);
      const customer = CustomerService.update(req.shopId, customerId, validated);
      res.json(customer);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      res.status(400).json({ error: error.message || 'Failed to update customer' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const customerId = parseInt(req.params.id);
      CustomerService.delete(req.shopId, customerId);
      res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to delete customer' });
    }
  }

  static async search(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.shopId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const customers = CustomerService.search(req.shopId, query);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Search failed' });
    }
  }
}
