import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';

const router = Router();

router.get('/', mediaController.getMedia.bind(mediaController));
router.get('/:id', mediaController.getMediaById.bind(mediaController));
router.post('/', mediaController.createMedia.bind(mediaController));
router.put('/:id', mediaController.updateMedia.bind(mediaController));
router.delete('/:id', mediaController.deleteMedia.bind(mediaController));

// Directors are attached AFTER media creation (many-to-many)
router.get('/:id/directors', mediaController.getMediaDirectors.bind(mediaController));
router.post('/:id/directors', mediaController.addMediaDirectors.bind(mediaController));
router.put('/:id/directors', mediaController.replaceMediaDirectors.bind(mediaController));
router.delete(
  '/:id/directors/:directorId',
  mediaController.removeMediaDirector.bind(mediaController),
);

// Cast is attached AFTER media creation (many-to-many)
router.get('/:id/cast', mediaController.getMediaCast.bind(mediaController));
router.post('/:id/cast', mediaController.addMediaCast.bind(mediaController));
router.put('/:id/cast', mediaController.replaceMediaCast.bind(mediaController));
router.delete(
  '/:id/cast/:personId',
  mediaController.removeMediaCastMember.bind(mediaController),
);

export default router;

