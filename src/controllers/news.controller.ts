import { Request, Response } from 'express';
import { getReqLocale } from '../i18n/locale.js';
import { newsService } from '../services/news.service.js';

class NewsController {
  async listPublic(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const rows = await newsService.getAll(locale);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error?.message ?? 'Failed to fetch news' });
    }
  }

  async getPublic(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const row = await newsService.getBySlug(String(req.params.slug), locale);
      res.json(row);
    } catch (error: any) {
      res.status(404).json({ error: error?.message ?? 'News not found' });
    }
  }

  // Admin

  async adminList(req: Request, res: Response) {
    try {
      const rows = await newsService.adminGetAll();
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error?.message ?? 'Failed to fetch news' });
    }
  }

  async adminGetById(req: Request, res: Response) {
    try {
      const row = await newsService.adminGetById(Number(req.params.id));
      res.json(row);
    } catch (error: any) {
      res.status(404).json({ error: error?.message ?? 'News not found' });
    }
  }

  async adminCreate(req: Request, res: Response) {
    try {
      const row = await newsService.create(req.body);
      res.status(201).json(row);
    } catch (error: any) {
      res.status(400).json({ error: error?.message ?? 'Create failed' });
    }
  }

  async adminUpdate(req: Request, res: Response) {
    try {
      const row = await newsService.update(Number(req.params.id), req.body);
      res.json(row);
    } catch (error: any) {
      res.status(400).json({ error: error?.message ?? 'Update failed' });
    }
  }

  async adminDelete(req: Request, res: Response) {
    try {
      await newsService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error?.message ?? 'Delete failed' });
    }
  }
}

export const newsController = new NewsController();
