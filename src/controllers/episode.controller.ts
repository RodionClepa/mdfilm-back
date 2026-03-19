import { Request, Response } from 'express';
import { episodeService } from '../services/episode.service.js';

class EpisodeController {
  async listBySeason(req: Request, res: Response) {
    try {
      const seasonId = Number(req.params.seasonId);
      const episodes = await episodeService.getBySeasonId(seasonId);
      res.json(episodes);
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message ?? 'Failed to fetch episodes' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const episode = await episodeService.getById(Number(req.params.id));
      res.json(episode);
    } catch (error: any) {
      res.status(404).json({ error: error.message ?? 'Episode not found' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const seasonId = Number(req.params.seasonId);
      const episode = await episodeService.create(seasonId, req.body);
      res.status(201).json(episode);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const episode = await episodeService.update(Number(req.params.id), req.body);
      res.json(episode);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Update failed' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await episodeService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Delete failed' });
    }
  }
}

export const episodeController = new EpisodeController();

