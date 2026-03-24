import { Request, Response } from 'express';
import { directorService } from '../services/director.service.js';
import { getReqLocale } from '../i18n/locale.js';

class DirectorController {
  async getDirectors(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const directors = await directorService.getAll(locale);
      res.json(directors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch directors' });
    }
  }

  async getDirector(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const director = await directorService.getById(Number(req.params.id), locale);
      res.json(director);
    } catch (error: any) {
      res.status(404).json({ error: error.message ?? 'Director not found' });
    }
  }

  async createDirector(req: Request, res: Response) {
    try {
      const director = await directorService.create(req.body);
      res.status(201).json(director);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateDirector(req: Request, res: Response) {
    try {
      const director = await directorService.update(Number(req.params.id), req.body);
      res.json(director);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Update failed' });
    }
  }

  async deleteDirector(req: Request, res: Response) {
    try {
      await directorService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Delete failed' });
    }
  }

  async getDirectorFilmography(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const media = await directorService.getFilmography(Number(req.params.id), locale);
      res.json(media);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Failed to fetch filmography' });
    }
  }
}

export const directorController = new DirectorController();

