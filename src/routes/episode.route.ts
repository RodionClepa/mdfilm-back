import { Router } from 'express';
import { episodeController } from '../controllers/episode.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Episodes are created/listed under a season
router.get('/seasons/:seasonId/episodes', episodeController.listBySeason);
router.post('/seasons/:seasonId/episodes', requireAdmin, episodeController.create);

// Direct episode CRUD by episode id
router.get('/episodes/:id', episodeController.getById);
router.put('/episodes/:id', requireAdmin, episodeController.update);
router.delete('/episodes/:id', requireAdmin, episodeController.delete);

export default router;
