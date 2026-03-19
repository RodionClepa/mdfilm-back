import { Request, Response } from 'express';
import { seasonService } from '../services/season.service.js';

class SeasonController {
  async listBySeries(req: Request, res: Response) {
    try {
      const seriesId = Number(req.params.seriesId);
      const seasons = await seasonService.getBySeriesId(seriesId);
      res.json(seasons);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Failed to fetch seasons' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const season = await seasonService.getById(Number(req.params.id));
      res.json(season);
    } catch (error: any) {
      res.status(404).json({ error: error.message ?? 'Season not found' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const seriesId = Number(req.params.seriesId);
      const season = await seasonService.create(seriesId, req.body);
      res.status(201).json(season);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const season = await seasonService.update(Number(req.params.id), req.body);
      res.json(season);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Update failed' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await seasonService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Delete failed' });
    }
  }
}

export const seasonController = new SeasonController();

