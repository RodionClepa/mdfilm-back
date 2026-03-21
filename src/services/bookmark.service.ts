import { prisma } from '../../lib/prisma.js';

type BookmarkSort = 'createdAt_desc' | 'createdAt_asc' | 'title_asc' | 'title_desc';

type BookmarkListFilters = {
  type?: 'MOVIE' | 'SERIES';
  q?: string;
  sort?: BookmarkSort;
};

export class BookmarkService {
  async list(userId: number, filters: BookmarkListFilters) {
    const sort: BookmarkSort =
      filters.sort === 'createdAt_asc' ||
      filters.sort === 'title_asc' ||
      filters.sort === 'title_desc' ||
      filters.sort === 'createdAt_desc'
        ? filters.sort
        : 'createdAt_desc';

    const orderBy =
      sort === 'createdAt_asc'
        ? [{ createdAt: 'asc' as const }]
        : sort === 'createdAt_desc'
          ? [{ createdAt: 'desc' as const }]
          : sort === 'title_asc'
            ? [{ media: { title: 'asc' as const } }]
            : [{ media: { title: 'desc' as const } }];

    const q = typeof filters.q === 'string' ? filters.q.trim() : '';
    const type = filters.type === 'MOVIE' || filters.type === 'SERIES' ? filters.type : undefined;

    const mediaWhere: any = {
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
      ...(type ? { type: { name: type } } : {}),
    };

    return prisma.bookmark.findMany({
      where: {
        userId,
        ...(Object.keys(mediaWhere).length ? { media: mediaWhere } : {}),
      },
      include: {
        media: {
          include: {
            type: true,
          },
        },
      },
      orderBy,
    });
  }

  async status(userId: number, mediaIds: number[]) {
    const uniqueIds = Array.from(new Set(mediaIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)));
    if (!uniqueIds.length) return { bookmarked: [] as number[] };

    const rows = await prisma.bookmark.findMany({
      where: {
        userId,
        mediaId: { in: uniqueIds },
      },
      select: { mediaId: true },
    });

    return { bookmarked: rows.map((r: { mediaId: number }) => r.mediaId) };
  }

  async add(userId: number, mediaId: number) {
    if (!mediaId) throw new Error('mediaId is required');

    return prisma.bookmark.upsert({
      where: { userId_mediaId: { userId, mediaId } },
      update: {},
      create: { userId, mediaId },
      include: {
        media: {
          include: { type: true },
        },
      },
    });
  }

  async remove(userId: number, mediaId: number) {
    if (!mediaId) throw new Error('mediaId is required');

    await prisma.bookmark.deleteMany({
      where: { userId, mediaId },
    });
  }
}

export const bookmarkService = new BookmarkService();
