import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', mediaController.getMedia.bind(mediaController));
router.get('/:id', mediaController.getMediaById.bind(mediaController));
router.post('/', requireAdmin, mediaController.createMedia.bind(mediaController));
router.put('/:id', requireAdmin, mediaController.updateMedia.bind(mediaController));
router.delete('/:id', requireAdmin, mediaController.deleteMedia.bind(mediaController));

router.post(
  '/:id/poster',
  requireAdmin,
  upload.single('poster'),
  mediaController.uploadPoster.bind(mediaController),
);

// Directors are attached AFTER media creation (many-to-many)
router.get('/:id/directors', mediaController.getMediaDirectors.bind(mediaController));
router.post('/:id/directors', requireAdmin, mediaController.addMediaDirectors.bind(mediaController));
router.put('/:id/directors', requireAdmin, mediaController.replaceMediaDirectors.bind(mediaController));
router.delete(
  '/:id/directors/:directorId',
  requireAdmin,
  mediaController.removeMediaDirector.bind(mediaController),
);

// Cast is attached AFTER media creation (many-to-many)
router.get('/:id/cast', mediaController.getMediaCast.bind(mediaController));
router.post('/:id/cast', requireAdmin, mediaController.addMediaCast.bind(mediaController));
router.put('/:id/cast', requireAdmin, mediaController.replaceMediaCast.bind(mediaController));
router.delete(
  '/:id/cast/:personId',
  requireAdmin,
  mediaController.removeMediaCastMember.bind(mediaController),
);

export default router;

