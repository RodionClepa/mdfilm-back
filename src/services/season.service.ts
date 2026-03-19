import { prisma } from '../../lib/prisma.js';

export class SeasonService {
  private async _ensureSeriesExists(mediaId: number) {
    const series = await prisma.media.findFirst({
      where: { id: mediaId, type: { name: 'SERIES' } },
      select: { id: true },
    });

    if (!series) {
      throw new Error(`Series with ID ${mediaId} not found.`);
    }

    return series;
  }

  private async _ensureSeasonExists(seasonId: number) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (!season) {
      throw new Error(`Season with ID ${seasonId} not found.`);
    }

    return season;
  }

  async getBySeriesId(seriesId: number) {
    if (!seriesId) throw new Error('seriesId is required.');
    await this._ensureSeriesExists(seriesId);

    return prisma.season.findMany({
      where: { mediaId: seriesId },
      orderBy: { seasonNumber: 'asc' },
      include: {
        episodes: { orderBy: { episodeNumber: 'asc' } },
      },
    });
  }

  async getById(seasonId: number) {
    if (!seasonId) throw new Error('ID is required.');

    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        media: { include: { type: true } },
        episodes: { orderBy: { episodeNumber: 'asc' } },
      },
    });

    if (!season) throw new Error(`Season with ID ${seasonId} not found.`);
    if (season.media.type.name !== 'SERIES') {
      throw new Error('Season does not belong to a SERIES media.');
    }

    return season;
  }

  async create(seriesId: number, data: any) {
    if (!seriesId) throw new Error('seriesId is required.');
    if (data.seasonNumber == null) throw new Error('seasonNumber is required.');
    if (data.releaseYear == null) throw new Error('releaseYear is required.');

    await this._ensureSeriesExists(seriesId);

    // Prevent duplicates within the same series (best-effort without DB constraint)
    const existing = await prisma.season.findFirst({
      where: { mediaId: seriesId, seasonNumber: Number(data.seasonNumber) },
      select: { id: true },
    });
    if (existing) {
      throw new Error(
        `Season ${Number(data.seasonNumber)} already exists for series ${seriesId}.`,
      );
    }

    return prisma.season.create({
      data: {
        mediaId: seriesId,
        seasonNumber: Number(data.seasonNumber),
        releaseYear: Number(data.releaseYear),
      },
      include: {
        episodes: true,
      },
    });
  }

  async update(seasonId: number, data: any) {
    if (!seasonId) throw new Error('ID is required.');

    const season = await this._ensureSeasonExists(seasonId);
    await this._ensureSeriesExists(season.mediaId);

    if (data.seasonNumber != null) {
      const duplicate = await prisma.season.findFirst({
        where: {
          mediaId: season.mediaId,
          seasonNumber: Number(data.seasonNumber),
          NOT: { id: seasonId },
        },
        select: { id: true },
      });
      if (duplicate) {
        throw new Error(
          `Season ${Number(data.seasonNumber)} already exists for series ${season.mediaId}.`,
        );
      }
    }

    return prisma.season.update({
      where: { id: seasonId },
      data: {
        seasonNumber:
          data.seasonNumber != null ? Number(data.seasonNumber) : undefined,
        releaseYear: data.releaseYear != null ? Number(data.releaseYear) : undefined,
      },
      include: {
        episodes: { orderBy: { episodeNumber: 'asc' } },
      },
    });
  }

  async delete(seasonId: number) {
    if (!seasonId) throw new Error('ID is required.');

    const season = await this._ensureSeasonExists(seasonId);
    await this._ensureSeriesExists(season.mediaId);

    return prisma.season.delete({
      where: { id: seasonId },
    });
  }
}

export const seasonService = new SeasonService();

