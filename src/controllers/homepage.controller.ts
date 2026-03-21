import { Request, Response } from 'express';
import { homepageService } from '../services/homepage.service.js';

class HomepageController {
  async getFeatured(req: Request, res: Response) {
    try {
      const items = await homepageService.getFeaturedMediaPublic();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error?.message ?? 'Failed to fetch featured media' });
    }
  }

  async getFeaturedAdmin(req: Request, res: Response) {
    try {
      const items = await homepageService.getFeaturedMediaAdmin();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error?.message ?? 'Failed to fetch featured media' });
    }
  }

  async replaceFeaturedAdmin(req: Request, res: Response) {
    try {
      const items = Array.isArray(req.body) ? req.body : req.body?.items;
      const updated = await homepageService.replaceFeaturedMediaAdmin(items ?? []);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error?.message ?? 'Failed to update featured media' });
    }
  }

  async getLatestMovies(req: Request, res: Response) {
    try {
      const items = await homepageService.getLatestMovies();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error?.message ?? 'Failed to fetch latest movies' });
    }
  }

  async getLatestSeries(req: Request, res: Response) {
    try {
      const items = await homepageService.getLatestSeries();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error?.message ?? 'Failed to fetch latest series' });
    }
  }

  async getUpcomingMovies(req: Request, res: Response) {
    try {
      const items = await homepageService.getUpcomingMovies();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error?.message ?? 'Failed to fetch upcoming movies' });
    }
  }

  async getUpcomingSeries(req: Request, res: Response) {
    try {
      const items = await homepageService.getUpcomingSeries();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error?.message ?? 'Failed to fetch upcoming series' });
    }
  }
}

export const homepageController = new HomepageController();
