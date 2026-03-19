import { Request, Response } from 'express';
import { seriesService } from '../services/series.service.js';

class SeriesController {
  async getSeries(req: Request, res: Response) {
    try {
      const series = await seriesService.getAll();
      res.json(series);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch series' });
    }
  }

  async getSeriesById(req: Request, res: Response) {
    try {
      const series = await seriesService.getById(Number(req.params.id));
      res.json(series);
    } catch (error: any) {
      res.status(404).json({ error: error.message ?? 'Series not found' });
    }
  }

  async createSeries(req: Request, res: Response) {
    try {
      const series = await seriesService.create(req.body);
      res.status(201).json(series);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateSeries(req: Request, res: Response) {
    try {
      const series = await seriesService.update(Number(req.params.id), req.body);
      res.json(series);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Update failed' });
    }
  }

  async deleteSeries(req: Request, res: Response) {
    try {
      await seriesService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Delete failed' });
    }
  }
}

export const seriesController = new SeriesController();

