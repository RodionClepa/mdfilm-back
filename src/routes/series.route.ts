import { Router } from 'express';
import { seriesController } from '../controllers/series.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', seriesController.getSeries);
router.get('/:id', seriesController.getSeriesById);
router.post('/', requireAdmin, seriesController.createSeries);
router.put('/:id', requireAdmin, seriesController.updateSeries);
router.delete('/:id', requireAdmin, seriesController.deleteSeries);

export default router;

