import { Router } from 'express';
import { personController } from '../controllers/person.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', personController.getPeople);
router.get('/:id', personController.getPerson);
router.get('/:id/filmography', personController.getPersonFilmography.bind(personController));
router.post('/', requireAdmin, personController.createPerson);
router.put('/:id', requireAdmin, personController.updatePerson.bind(personController));
router.delete('/:id', requireAdmin, personController.deletePerson.bind(personController));

export default router;

