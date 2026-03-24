import { Request, Response } from 'express';
import { seriesService } from '../services/series.service.js';
import { getReqLocale } from '../i18n/locale.js';

class SeriesController {
  async getSeries(req: Request, res: Response) {
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
        q?.status !== undefined ||
        q?.page !== undefined ||
        q?.pageSize !== undefined;

      if (!hasBrowseParams) {
        const series = await seriesService.getAll(locale);
        res.json(series);
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
      const status = q?.status != null ? String(q.status) : undefined;

      const result = await seriesService.browse(locale, {
        az,
        yearFrom,
        yearTo,
        dateFrom,
        dateTo,
        sort,
        status,
        page,
        pageSize,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch series' });
    }
  }

  async getSeriesById(req: Request, res: Response) {
    try {
      const locale = getReqLocale(req);
      const series = await seriesService.getById(Number(req.params.id), locale);
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

