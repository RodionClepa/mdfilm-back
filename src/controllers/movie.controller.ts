import { Request, Response } from 'express';
import { movieService, MovieService } from '../services/movie.service.js';
import { Media } from "../../generated/prisma/client.js"
import { getReqLocale } from '../i18n/locale.js';

class MovieController {

  async getMovies(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const q: any = req.query as any;
      const hasBrowseParams =
        q?.az !== undefined ||
        q?.yearFrom !== undefined ||
        q?.yearTo !== undefined ||
        q?.dateFrom !== undefined ||
        q?.dateTo !== undefined ||
        q?.sort !== undefined ||
        q?.page !== undefined ||
        q?.pageSize !== undefined;

      if (!hasBrowseParams) {
        const movies = await movieService.getAll(locale);
        res.json(movies);
        return;
      }

      const page = q?.page != null ? Number(q.page) : undefined;
      const pageSize = q?.pageSize != null ? Number(q.pageSize) : undefined;
      const yearFrom = q?.yearFrom != null ? Number(q.yearFrom) : undefined;
      const yearTo = q?.yearTo != null ? Number(q.yearTo) : undefined;
      const dateFrom = q?.dateFrom != null ? String(q.dateFrom) : undefined;
      const dateTo = q?.dateTo != null ? String(q.dateTo) : undefined;
      const az = q?.az != null ? String(q.az) : undefined;
      const sort = q?.sort != null ? String(q.sort) : undefined;

      const result = await movieService.browse(locale, {
        az,
        yearFrom,
        yearTo,
        dateFrom,
        dateTo,
        sort,
        page,
        pageSize,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch movies' });
    }
  }

  async getMovie(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const movie = await movieService.getById(Number(req.params.id), locale);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.json(movie);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching movie' });
    }
  }

  async createMovie(req: Request, res: Response) {
    try {
      const movie = await movieService.create(req.body);
      res.status(201).json(movie);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMovie(req: Request, res: Response) {
    try {
      const movie = await movieService.update(
        Number(req.params.id),
        req.body
      );
      res.json(movie);
    } catch (error) {
      res.status(400).json({ error: 'Update failed' });
    }
  }

  async deleteMovie(req: Request, res: Response) {
    try {
      await movieService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Delete failed' });
    }
  }
}

export const movieController = new MovieController();
