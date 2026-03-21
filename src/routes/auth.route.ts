import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/google/start', (req, res) => authController.googleStart(req, res));
router.get('/google/callback', (req, res) => authController.googleCallback(req, res));
router.post('/admin/login', (req, res) => authController.adminLogin(req, res));
router.get('/me', requireAuth, (req, res) => authController.me(req, res));

export default router;
