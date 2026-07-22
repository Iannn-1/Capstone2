import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

/**
 * Auth routes
 *
 * POST /login    — public, returns JWT
 * POST /register — protected (existing admin only), creates a new user
 */
const router = Router();

router.post('/login', login);
router.post('/register', authMiddleware, register);

export default router;
