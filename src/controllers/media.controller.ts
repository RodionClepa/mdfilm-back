import { Request, Response } from 'express';
import { mediaService } from '../services/media.service.js';
import { getReqLocale } from '../i18n/locale.js';

class MediaController {
  async getMedia(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const media = await mediaService.getAll(locale);
      res.json(media);
    } catch (error: any) {
      // Surface underlying error to help debugging
      res
        .status(500)
        .json({ error: error?.message ?? 'Failed to fetch media' });
    }
  }

  async getMediaById(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const id = Number(req.params.id);
      const media = await mediaService.getById(id, locale);
      res.json(media);
    } catch (error: any) {
      res.status(404).json({ error: error.message ?? 'Media not found' });
    }
  }

  async createMedia(req: Request, res: Response) {
    try {
      const media = await mediaService.create(req.body);
      res.status(201).json(media);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMedia(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const media = await mediaService.update(id, req.body);
      res.json(media);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Update failed' });
    }
  }

  async deleteMedia(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await mediaService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Delete failed' });
    }
  }

  async getMediaDirectors(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const mediaId = Number(req.params.id);
      const directors = await mediaService.getDirectors(mediaId, locale);
      res.json(directors);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Failed to fetch directors' });
    }
  }

  async addMediaDirectors(req: Request, res: Response) {
    try {
      const mediaId = Number(req.params.id);
      const directorIds: number[] = Array.isArray(req.body?.directorIds)
        ? req.body.directorIds.map((x: any) => Number(x))
        : req.body?.directorId != null
          ? [Number(req.body.directorId)]
          : [];

      const media = await mediaService.addDirectors(mediaId, directorIds);
      res.status(200).json(media);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async replaceMediaDirectors(req: Request, res: Response) {
    try {
      const mediaId = Number(req.params.id);
      const directorIds: number[] = Array.isArray(req.body?.directorIds)
        ? req.body.directorIds.map((x: any) => Number(x))
        : [];

      const media = await mediaService.replaceDirectors(mediaId, directorIds);
      res.status(200).json(media);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeMediaDirector(req: Request, res: Response) {
    try {
      const mediaId = Number(req.params.id);
      const directorId = Number(req.params.directorId);
      const media = await mediaService.removeDirector(mediaId, directorId);
      res.status(200).json(media);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMediaCast(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const mediaId = Number(req.params.id);
      const cast = await mediaService.getCast(mediaId, locale);
      res.json(cast);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Failed to fetch cast' });
    }
  }

  async addMediaCast(req: Request, res: Response) {
    try {
      const mediaId = Number(req.params.id);
      const media = await mediaService.addCastMember(mediaId, {
        personId: Number(req.body?.personId),
        characterName: req.body?.characterName,
        translations: Array.isArray(req.body?.translations) ? req.body.translations : undefined,
        billingOrder:
          req.body?.billingOrder != null ? Number(req.body.billingOrder) : undefined,
      } as any);
      res.status(200).json(media);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async replaceMediaCast(req: Request, res: Response) {
    try {
      const mediaId = Number(req.params.id);
      const cast = Array.isArray(req.body?.cast) ? req.body.cast : req.body;
      const media = await mediaService.replaceCast(mediaId, cast);
      res.status(200).json(media);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeMediaCastMember(req: Request, res: Response) {
    try {
      const mediaId = Number(req.params.id);
      const personId = Number(req.params.personId);
      const media = await mediaService.removeCastMember(mediaId, personId);
      res.status(200).json(media);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const mediaController = new MediaController();

