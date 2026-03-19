import { Router } from 'express';
import { seriesController } from '../controllers/series.controller.js';

const router = Router();

router.get('/', seriesController.getSeries);
router.get('/:id', seriesController.getSeriesById);
router.post('/', seriesController.createSeries);
router.put('/:id', seriesController.updateSeries);
router.delete('/:id', seriesController.deleteSeries);

export default router;

