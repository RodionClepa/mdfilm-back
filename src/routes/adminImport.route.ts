import { Router } from 'express';
import { adminImportController } from '../controllers/adminImport.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/import', requireAdmin, adminImportController.import.bind(adminImportController));

export default router;
