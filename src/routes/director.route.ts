import { Router } from 'express';
import { directorController } from '../controllers/director.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', directorController.getDirectors);
router.get('/:id', directorController.getDirector);
router.get('/:id/filmography', directorController.getDirectorFilmography.bind(directorController));
router.post('/', requireAdmin, directorController.createDirector);
router.put('/:id', requireAdmin, directorController.updateDirector.bind(directorController));
router.delete('/:id', requireAdmin, directorController.deleteDirector.bind(directorController));

export default router;

