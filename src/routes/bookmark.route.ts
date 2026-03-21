import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmark.controller.js';
import { requireUser } from '../middleware/auth.js';

const router = Router();

router.get('/', requireUser, bookmarkController.list.bind(bookmarkController));
router.get('/status', requireUser, bookmarkController.status.bind(bookmarkController));
router.post('/', requireUser, bookmarkController.add.bind(bookmarkController));
router.delete('/:mediaId', requireUser, bookmarkController.remove.bind(bookmarkController));

export default router;
