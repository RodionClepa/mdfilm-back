import { Router } from 'express';
import { personController } from '../controllers/person.controller.js';

const router = Router();

router.get('/', personController.getPeople);
router.get('/:id', personController.getPerson);
router.post('/', personController.createPerson);

export default router;

