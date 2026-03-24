import { prisma } from '../../lib/prisma.js';
import { Locale, pickTranslation } from '../i18n/locale.js';

export class HomepageService {
  async getFeaturedMediaPublic(locale: Locale) {
    const items = await prisma.homepageFeaturedMedia.findMany({
      where: { enabled: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      include: {
        media: {
          include: {
            translations: { where: { locale: { in: [locale, 'en'] } } },
            type: true,
            movieInfo: true,
            seriesInfo: true,
            directors: {
              include: {
                director: {
                  include: {
                    translations: { where: { locale: { in: [locale, 'en'] } } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return items.map((i) => {
      const m: any = i.media;
      const mt = pickTranslation(m.translations, locale);
      const localizedDirectors = Array.isArray(m.directors)
        ? m.directors.map((md: any) => {
            const d: any = md.director;
            const dt = pickTranslation(d?.translations, locale);
            return {
              ...md,
              director: {
                ...d,
                name: dt?.name ?? d?.name,
                biography: dt?.biography ?? d?.biography,
              },
            };
          })
        : m.directors;

      return {
        ...m,
        title: mt?.title ?? m.title,
        synopsis: mt?.synopsis ?? m.synopsis,
        directors: localizedDirectors,
      };
    });
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

  async getLatestMovies(locale: Locale) {
    return prisma.media.findMany({
      where: {
        type: { name: 'MOVIE' },
        releaseDate: { lte: new Date() },
      },
      orderBy: { releaseDate: 'desc' },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        type: true,
        movieInfo: true,
        directors: {
          include: {
            director: {
              include: {
                translations: { where: { locale: { in: [locale, 'en'] } } },
              },
            },
          },
        },
      },
    }).then((rows: any[]) =>
      rows.map((m: any) => {
        const mt = pickTranslation(m.translations, locale);
        const localizedDirectors = Array.isArray(m.directors)
          ? m.directors.map((md: any) => {
              const d: any = md.director;
              const dt = pickTranslation(d?.translations, locale);
              return {
                ...md,
                director: {
                  ...d,
                  name: dt?.name ?? d?.name,
                  biography: dt?.biography ?? d?.biography,
                },
              };
            })
          : m.directors;
        return {
          ...m,
          title: mt?.title ?? m.title,
          synopsis: mt?.synopsis ?? m.synopsis,
          directors: localizedDirectors,
        };
      }),
    );
  }

  async getLatestSeries(locale: Locale) {
    return prisma.media.findMany({
      where: {
        type: { name: 'SERIES' },
        releaseDate: { lte: new Date() },
      },
      orderBy: { releaseDate: 'desc' },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        type: true,
        seriesInfo: true,
        directors: {
          include: {
            director: {
              include: {
                translations: { where: { locale: { in: [locale, 'en'] } } },
              },
            },
          },
        },
      },
    }).then((rows: any[]) =>
      rows.map((m: any) => {
        const mt = pickTranslation(m.translations, locale);
        const localizedDirectors = Array.isArray(m.directors)
          ? m.directors.map((md: any) => {
              const d: any = md.director;
              const dt = pickTranslation(d?.translations, locale);
              return {
                ...md,
                director: {
                  ...d,
                  name: dt?.name ?? d?.name,
                  biography: dt?.biography ?? d?.biography,
                },
              };
            })
          : m.directors;
        return {
          ...m,
          title: mt?.title ?? m.title,
          synopsis: mt?.synopsis ?? m.synopsis,
          directors: localizedDirectors,
        };
      }),
    );
  }

  async getUpcomingMovies(locale: Locale) {
    return prisma.media.findMany({
      where: {
        type: { name: 'MOVIE' },
        releaseDate: { gt: new Date() },
      },
      orderBy: { releaseDate: 'asc' },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        type: true,
        movieInfo: true,
        directors: {
          include: {
            director: {
              include: {
                translations: { where: { locale: { in: [locale, 'en'] } } },
              },
            },
          },
        },
      },
    }).then((rows: any[]) =>
      rows.map((m: any) => {
        const mt = pickTranslation(m.translations, locale);
        const localizedDirectors = Array.isArray(m.directors)
          ? m.directors.map((md: any) => {
              const d: any = md.director;
              const dt = pickTranslation(d?.translations, locale);
              return {
                ...md,
                director: {
                  ...d,
                  name: dt?.name ?? d?.name,
                  biography: dt?.biography ?? d?.biography,
                },
              };
            })
          : m.directors;
        return {
          ...m,
          title: mt?.title ?? m.title,
          synopsis: mt?.synopsis ?? m.synopsis,
          directors: localizedDirectors,
        };
      }),
    );
  }

  async getUpcomingSeries(locale: Locale) {
    return prisma.media.findMany({
      where: {
        type: { name: 'SERIES' },
        releaseDate: { gt: new Date() },
      },
      orderBy: { releaseDate: 'asc' },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        type: true,
        seriesInfo: true,
        directors: {
          include: {
            director: {
              include: {
                translations: { where: { locale: { in: [locale, 'en'] } } },
              },
            },
          },
        },
      },
    }).then((rows: any[]) =>
      rows.map((m: any) => {
        const mt = pickTranslation(m.translations, locale);
        const localizedDirectors = Array.isArray(m.directors)
          ? m.directors.map((md: any) => {
              const d: any = md.director;
              const dt = pickTranslation(d?.translations, locale);
              return {
                ...md,
                director: {
                  ...d,
                  name: dt?.name ?? d?.name,
                  biography: dt?.biography ?? d?.biography,
                },
              };
            })
          : m.directors;
        return {
          ...m,
          title: mt?.title ?? m.title,
          synopsis: mt?.synopsis ?? m.synopsis,
          directors: localizedDirectors,
        };
      }),
    );
  }
}

export const homepageService = new HomepageService();
