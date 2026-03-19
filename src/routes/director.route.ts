import { Router } from 'express';
import { directorController } from '../controllers/director.controller.js';

const router = Router();

router.get('/', directorController.getDirectors);
router.get('/:id', directorController.getDirector);
router.post('/', directorController.createDirector);

export default router;

