import { Router } from 'express';
import { homepageController } from '../controllers/homepage.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/featured', homepageController.getFeatured.bind(homepageController));
router.get('/latest/movies', homepageController.getLatestMovies.bind(homepageController));
router.get('/latest/series', homepageController.getLatestSeries.bind(homepageController));
router.get('/upcoming/movies', homepageController.getUpcomingMovies.bind(homepageController));
router.get('/upcoming/series', homepageController.getUpcomingSeries.bind(homepageController));

router.get('/admin/featured', requireAdmin, homepageController.getFeaturedAdmin.bind(homepageController));
router.put('/admin/featured', requireAdmin, homepageController.replaceFeaturedAdmin.bind(homepageController));

export default router;
