import { Request, Response } from 'express';
import { directorService } from '../services/director.service.js';

class DirectorController {
  async getDirectors(req: Request, res: Response) {
    try {
      const directors = await directorService.getAll();
      res.json(directors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch directors' });
    }
  }

  async getDirector(req: Request, res: Response) {
    try {
      const director = await directorService.getById(Number(req.params.id));
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
}

export const directorController = new DirectorController();

