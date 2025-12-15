import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.ts';
import userRoutes from './user.ts';
const router = Router();

// Secure Route Example
router.use(authMiddleware);

router.use('/user', userRoutes);
export default router;