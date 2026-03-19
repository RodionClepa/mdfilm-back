import { prisma } from '../../lib/prisma.js';

export class EpisodeService {
  private async _ensureSeasonExists(seasonId: number) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { media: { include: { type: true } } },
    });

    if (!season) {
      throw new Error(`Season with ID ${seasonId} not found.`);
    }
    if (season.media.type.name !== 'SERIES') {
      throw new Error('Season does not belong to a SERIES media.');
    }

    return season;
  }

  private async _ensureEpisodeExists(episodeId: number) {
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: { season: { include: { media: { include: { type: true } } } } },
    });

    if (!episode) {
      throw new Error(`Episode with ID ${episodeId} not found.`);
    }
    if (episode.season.media.type.name !== 'SERIES') {
      throw new Error('Episode does not belong to a SERIES media.');
    }

    return episode;
  }

  async getBySeasonId(seasonId: number) {
    if (!seasonId) throw new Error('seasonId is required.');
    await this._ensureSeasonExists(seasonId);

    return prisma.episode.findMany({
      where: { seasonId },
      orderBy: { episodeNumber: 'asc' },
      include: { watchLinks: true },
    });
  }

  async getById(episodeId: number) {
    if (!episodeId) throw new Error('ID is required.');

    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: true,
        watchLinks: true,
      },
    });

    if (!episode) throw new Error(`Episode with ID ${episodeId} not found.`);
    // Ensure it belongs to a SERIES (via season -> media)
    await this._ensureEpisodeExists(episodeId);

    return episode;
  }

  async create(seasonId: number, data: any) {
    if (!seasonId) throw new Error('seasonId is required.');
    if (data.episodeNumber == null) throw new Error('episodeNumber is required.');

    await this._ensureSeasonExists(seasonId);

    const existing = await prisma.episode.findFirst({
      where: { seasonId, episodeNumber: Number(data.episodeNumber) },
      select: { id: true },
    });
    if (existing) {
      throw new Error(
        `Episode ${Number(data.episodeNumber)} already exists for season ${seasonId}.`,
      );
    }

    return prisma.episode.create({
      data: {
        seasonId,
        episodeNumber: Number(data.episodeNumber),
        durationMinutes:
          data.durationMinutes != null ? Number(data.durationMinutes) : null,
        airDate: data.airDate ? new Date(data.airDate) : null,
      },
      include: { watchLinks: true },
    });
  }

  async update(episodeId: number, data: any) {
    if (!episodeId) throw new Error('ID is required.');

    const episode = await this._ensureEpisodeExists(episodeId);

    if (data.episodeNumber != null) {
      const dup = await prisma.episode.findFirst({
        where: {
          seasonId: episode.seasonId,
          episodeNumber: Number(data.episodeNumber),
          NOT: { id: episodeId },
        },
        select: { id: true },
      });
      if (dup) {
        throw new Error(
          `Episode ${Number(data.episodeNumber)} already exists for season ${episode.seasonId}.`,
        );
      }
    }

    return prisma.episode.update({
      where: { id: episodeId },
      data: {
        episodeNumber:
          data.episodeNumber != null ? Number(data.episodeNumber) : undefined,
        durationMinutes:
          data.durationMinutes != null ? Number(data.durationMinutes) : undefined,
        airDate:
          data.airDate !== undefined ? (data.airDate ? new Date(data.airDate) : null) : undefined,
      },
      include: { watchLinks: true },
    });
  }

  async delete(episodeId: number) {
    if (!episodeId) throw new Error('ID is required.');

    await this._ensureEpisodeExists(episodeId);

    return prisma.episode.delete({
      where: { id: episodeId },
    });
  }
}

export const episodeService = new EpisodeService();

