import { Router } from 'express';
import { seasonController } from '../controllers/season.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Seasons are created/listed under a SERIES
router.get('/series/:seriesId/seasons', seasonController.listBySeries);
router.post('/series/:seriesId/seasons', requireAdmin, seasonController.create);

// Direct season CRUD by season id
router.get('/seasons/:id', seasonController.getById);
router.put('/seasons/:id', requireAdmin, seasonController.update);
router.delete('/seasons/:id', requireAdmin, seasonController.delete);

export default router;
