import { Router } from 'express';
import { newsController } from '../controllers/news.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Admin (must be before public /:slug)
router.get('/admin', requireAdmin, newsController.adminList.bind(newsController));
router.get('/admin/:id', requireAdmin, newsController.adminGetById.bind(newsController));
router.post('/admin', requireAdmin, newsController.adminCreate.bind(newsController));
router.put('/admin/:id', requireAdmin, newsController.adminUpdate.bind(newsController));
router.delete('/admin/:id', requireAdmin, newsController.adminDelete.bind(newsController));

// Public
router.get('/', newsController.listPublic.bind(newsController));
router.get('/:slug', newsController.getPublic.bind(newsController));

export default router;
