import { Request, Response } from 'express';
import { bookmarkService } from '../services/bookmark.service.js';

function showError(e: unknown) {
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

class BookmarkController {
  async list(req: Request, res: Response) {
    try {
      const user = (req as any).user as { id: number } | undefined;
      if (!user?.id) return res.status(401).json({ error: 'Unauthorized' });

      const typeRaw = typeof req.query.type === 'string' ? req.query.type : undefined;
      const type = typeRaw === 'MOVIE' || typeRaw === 'SERIES' ? typeRaw : undefined;

      const q = typeof req.query.q === 'string' ? req.query.q : undefined;

      const sortRaw = typeof req.query.sort === 'string' ? req.query.sort : undefined;
      const sort =
        sortRaw === 'createdAt_desc' ||
        sortRaw === 'createdAt_asc' ||
        sortRaw === 'title_asc' ||
        sortRaw === 'title_desc'
          ? sortRaw
          : undefined;

      const rows = await bookmarkService.list(user.id, { type, q, sort });
      res.json(rows);
    } catch (e) {
      res.status(400).json({ error: showError(e) });
    }
  }

  async status(req: Request, res: Response) {
    try {
      const user = (req as any).user as { id: number } | undefined;
      if (!user?.id) return res.status(401).json({ error: 'Unauthorized' });

      const mediaIdsRaw = typeof req.query.mediaIds === 'string' ? req.query.mediaIds : '';
      const mediaIds = mediaIdsRaw
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);

      const result = await bookmarkService.status(user.id, mediaIds);
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: showError(e) });
    }
  }

  async add(req: Request, res: Response) {
    try {
      const user = (req as any).user as { id: number } | undefined;
      if (!user?.id) return res.status(401).json({ error: 'Unauthorized' });

      const mediaId = Number(req.body?.mediaId);
      if (!Number.isFinite(mediaId) || mediaId <= 0) {
        return res.status(400).json({ error: 'mediaId is required' });
      }

      const row = await bookmarkService.add(user.id, mediaId);
      res.status(201).json(row);
    } catch (e) {
      res.status(400).json({ error: showError(e) });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const user = (req as any).user as { id: number } | undefined;
      if (!user?.id) return res.status(401).json({ error: 'Unauthorized' });

      const mediaId = Number(req.params.mediaId);
      if (!Number.isFinite(mediaId) || mediaId <= 0) {
        return res.status(400).json({ error: 'mediaId is required' });
      }

      await bookmarkService.remove(user.id, mediaId);
      res.status(204).send();
    } catch (e) {
      res.status(400).json({ error: showError(e) });
    }
  }
}

export const bookmarkController = new BookmarkController();
