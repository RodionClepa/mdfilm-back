import { Router } from 'express';
import { movieController } from '../controllers/movie.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', movieController.getMovies);
router.get('/:id', movieController.getMovie);
router.post('/', requireAdmin, movieController.createMovie);
router.put('/:id', requireAdmin, movieController.updateMovie);
router.delete('/:id', requireAdmin, movieController.deleteMovie);

export default router;
