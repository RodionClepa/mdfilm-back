import { prisma } from '../../lib/prisma.js';

export class HomepageService {
  async getFeaturedMediaPublic() {
    const items = await prisma.homepageFeaturedMedia.findMany({
      where: { enabled: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      include: {
        media: {
          include: {
            type: true,
            movieInfo: true,
            seriesInfo: true,
            directors: { include: { director: true } },
          },
        },
      },
    });

    return items.map((i) => i.media);
  }

  async getFeaturedMediaAdmin() {
    return prisma.homepageFeaturedMedia.findMany({
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      include: {
        media: {
          include: {
            type: true,
            movieInfo: true,
            seriesInfo: true,
          },
        },
      },
    });
  }

  async replaceFeaturedMediaAdmin(
    items: Array<{ mediaId: number; position: number; enabled?: boolean }>,
  ) {
    if (!Array.isArray(items)) throw new Error('items must be an array');

    const normalized = items
      .map((i) => ({
        mediaId: Number(i.mediaId),
        position: Number(i.position),
        enabled: i.enabled !== undefined ? Boolean(i.enabled) : true,
      }))
      .filter((i) => i.mediaId && Number.isFinite(i.position));

    const mediaIds = Array.from(new Set(normalized.map((i) => i.mediaId)));

    const existingMedia = mediaIds.length
      ? await prisma.media.findMany({ where: { id: { in: mediaIds } }, select: { id: true } })
      : [];

    const existingIds = new Set(existingMedia.map((m) => m.id));
    const missing = mediaIds.filter((id) => !existingIds.has(id));
    if (missing.length) {
      throw new Error(`Media not found: ${missing.join(', ')}`);
    }

    await prisma.$transaction([
      prisma.homepageFeaturedMedia.deleteMany({}),
      ...(normalized.length
        ? [
            prisma.homepageFeaturedMedia.createMany({
              data: normalized.map((i) => ({
                mediaId: i.mediaId,
                position: i.position,
                enabled: i.enabled,
              })),
            }),
          ]
        : []),
    ]);

    return this.getFeaturedMediaAdmin();
  }

  async getLatestMovies() {
    return prisma.media.findMany({
      where: {
        type: { name: 'MOVIE' },
        releaseDate: { lte: new Date() },
      },
      orderBy: { releaseDate: 'desc' },
      include: {
        type: true,
        movieInfo: true,
        directors: { include: { director: true } },
      },
    });
  }

  async getLatestSeries() {
    return prisma.media.findMany({
      where: {
        type: { name: 'SERIES' },
        releaseDate: { lte: new Date() },
      },
      orderBy: { releaseDate: 'desc' },
      include: {
        type: true,
        seriesInfo: true,
        directors: { include: { director: true } },
      },
    });
  }

  async getUpcomingMovies() {
    return prisma.media.findMany({
      where: {
        type: { name: 'MOVIE' },
        releaseDate: { gt: new Date() },
      },
      orderBy: { releaseDate: 'asc' },
      include: {
        type: true,
        movieInfo: true,
        directors: { include: { director: true } },
      },
    });
  }

  async getUpcomingSeries() {
    return prisma.media.findMany({
      where: {
        type: { name: 'SERIES' },
        releaseDate: { gt: new Date() },
      },
      orderBy: { releaseDate: 'asc' },
      include: {
        type: true,
        seriesInfo: true,
        directors: { include: { director: true } },
      },
    });
  }
}

export const homepageService = new HomepageService();
