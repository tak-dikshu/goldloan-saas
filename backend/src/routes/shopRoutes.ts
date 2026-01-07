import { Router } from 'express';
import { ShopController } from '../controllers/shopController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', ShopController.getProfile);
router.put('/profile', ShopController.update);

export default router;
