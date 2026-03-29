import { prisma } from '../../lib/prisma.js';
import { Locale, parseLocaleStrict, pickTranslation } from '../i18n/locale.js';

export class MovieService {
  async browse(
    locale: Locale,
    params: {
      az?: string;
      yearFrom?: number;
      yearTo?: number;
      dateFrom?: string;
      dateTo?: string;
      sort?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const pageSizeRaw = params.pageSize ?? 24;
    const pageRaw = params.page ?? 1;
    const pageSize = Number.isFinite(pageSizeRaw)
      ? Math.max(1, Math.min(100, Number(pageSizeRaw)))
      : 24;
    const page = Number.isFinite(pageRaw) ? Math.max(1, Number(pageRaw)) : 1;
    const skip = (page - 1) * pageSize;

    const az = typeof params.az === 'string' ? params.az.trim() : '';
    const azLetter = /^[a-z]$/i.test(az) ? az[0].toLowerCase() : undefined;

    const yearFrom =
      params.yearFrom != null && Number.isFinite(params.yearFrom)
        ? Number(params.yearFrom)
        : undefined;
    const yearTo =
      params.yearTo != null && Number.isFinite(params.yearTo)
        ? Number(params.yearTo)
        : undefined;

    const dateFromRaw = typeof params.dateFrom === 'string' ? params.dateFrom.trim() : '';
    const dateToRaw = typeof params.dateTo === 'string' ? params.dateTo.trim() : '';
    const dateFrom = dateFromRaw ? new Date(dateFromRaw) : undefined;
    const dateTo = dateToRaw ? new Date(dateToRaw) : undefined;

    const where: any = {
      type: { name: 'MOVIE' },
    };

    const and: any[] = [];

    if (yearFrom != null || yearTo != null) {
      const from = yearFrom != null ? new Date(Date.UTC(yearFrom, 0, 1)) : undefined;
      const to = yearTo != null
        ? new Date(Date.UTC(yearTo, 11, 31, 23, 59, 59, 999))
        : undefined;
      and.push({
        releaseDate: {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        },
      });
    }

    if (
      (dateFrom && !Number.isNaN(dateFrom.valueOf())) ||
      (dateTo && !Number.isNaN(dateTo.valueOf()))
    ) {
      and.push({
        releaseDate: {
          ...(dateFrom && !Number.isNaN(dateFrom.valueOf()) ? { gte: dateFrom } : {}),
          ...(dateTo && !Number.isNaN(dateTo.valueOf()) ? { lte: dateTo } : {}),
        },
      });
    }

    if (azLetter) {
      and.push({
        OR: [
          {
            translations: {
              some: {
                locale,
                title: { startsWith: azLetter, mode: 'insensitive' },
              },
            },
          },
          {
            AND: [
              { translations: { none: { locale } } },
              {
                translations: {
                  some: {
                    locale: 'en',
                    title: { startsWith: azLetter, mode: 'insensitive' },
                  },
                },
              },
            ],
          },
        ],
      });
    }

    if (and.length) where.AND = and;

    const orderBy: any[] = [];
    const sort = typeof params.sort === 'string' ? params.sort.trim() : '';
    if (sort === 'oldest') orderBy.push({ releaseDate: 'asc' });
    else if (sort === 'title_asc') orderBy.push({ title: 'asc' });
    else if (sort === 'title_desc') orderBy.push({ title: 'desc' });
    else orderBy.push({ releaseDate: 'desc' });

    const [total, rows] = await Promise.all([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          translations: { where: { locale: { in: [locale, 'en'] } } },
          movieInfo: true,
          type: true,
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
      }),
    ]);

    return {
      items: rows.map((m: any) => this._localizeMedia(m, locale)),
      page,
      pageSize,
      total,
    };
  }

  private _localizeDirectorRow(row: any, locale: Locale) {
    const d: any = row?.director;
    const dt = pickTranslation(d?.translations, locale);
    return {
      ...row,
      director: {
        ...d,
        name: dt?.name ?? d?.name,
        biography: dt?.biography ?? d?.biography,
      },
    };
  }

  private _localizeMedia(m: any, locale: Locale) {
    const mt = pickTranslation(m?.translations, locale);
    const localizedDirectors = Array.isArray(m?.directors)
      ? m.directors.map((md: any) => this._localizeDirectorRow(md, locale))
      : m?.directors;

    return {
      ...m,
      title: mt?.title ?? m?.title,
      synopsis: mt?.synopsis ?? m?.synopsis,
      productionNotes: mt?.productionNotes ?? m?.productionNotes,
      directors: localizedDirectors,
    };
  }

  private async _ensureMovieExists(id: number, locale: Locale) {
    const movie = await prisma.media.findFirst({
      where: {
        id,
        type: { name: 'MOVIE' },
      },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        movieInfo: true,
        type: true,
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
    });

    if (!movie) {
      throw new Error(`Movie with ID ${id} not found.`);
    }

    return this._localizeMedia(movie, locale);
  }

  private async _upsertMediaTranslations(mediaId: number, translations: any) {
    if (!Array.isArray(translations) || translations.length === 0) return;

    await prisma.$transaction(
      translations.map((t: any) => {
        const locale = parseLocaleStrict(t?.locale);
        if (!locale) throw new Error(`Unsupported locale '${t?.locale}'`);
        if (!t?.title) throw new Error(`Translation title is required for locale '${locale}'`);
        return prisma.mediaI18n.upsert({
          where: { mediaId_locale: { mediaId, locale } },
          update: {
            title: String(t.title),
            synopsis:
              t?.synopsis != null && String(t.synopsis).trim() !== ''
                ? String(t.synopsis)
                : null,
            productionNotes:
              t?.productionNotes != null && String(t.productionNotes).trim() !== ''
                ? String(t.productionNotes)
                : null,
          },
          create: {
            mediaId,
            locale,
            title: String(t.title),
            synopsis:
              t?.synopsis != null && String(t.synopsis).trim() !== ''
                ? String(t.synopsis)
                : null,
            productionNotes:
              t?.productionNotes != null && String(t.productionNotes).trim() !== ''
                ? String(t.productionNotes)
                : null,
          },
        });
      }),
    );
  }

  async getAll(locale: Locale) {
    return prisma.media.findMany({
      where: { type: { name: 'MOVIE' } },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        movieInfo: true,
        type: true,
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
    }).then((rows: any[]) => rows.map((m: any) => this._localizeMedia(m, locale)));
  }

  async getById(id: number, locale: Locale) {
    if (!id) throw new Error('ID is required.');
    return this._ensureMovieExists(id, locale);
  }

  async create(data: any) {
    if (!data?.title) throw new Error('Title is required.');
    if (!data?.releaseDate) throw new Error('releaseDate is required.');

    const movieType = await prisma.mediaType.findUnique({
      where: { name: 'MOVIE' },
    });

    if (!movieType) {
      throw new Error("MediaType 'MOVIE' not found. Please seed your database.");
    }

    const created = await prisma.media.create({
      data: {
        title: data.title,
        releaseDate: new Date(data.releaseDate),
        synopsis: data.synopsis,
        productionNotes: data.productionNotes,
        country: data.country,
        posterImage: data.posterImage,
        typeId: movieType.id,
        movieInfo: {
          create: {
            duration: data.duration,
            budget: data.budget,
          },
        },
      },
      include: { movieInfo: true },
    });

    await prisma.mediaI18n.upsert({
      where: { mediaId_locale: { mediaId: created.id, locale: 'en' } },
      update: {
        title: String(data.title),
        synopsis:
          data?.synopsis != null && String(data.synopsis).trim() !== ''
            ? String(data.synopsis)
            : null,
        productionNotes:
          data?.productionNotes != null && String(data.productionNotes).trim() !== ''
            ? String(data.productionNotes)
            : null,
      },
      create: {
        mediaId: created.id,
        locale: 'en',
        title: String(data.title),
        synopsis:
          data?.synopsis != null && String(data.synopsis).trim() !== ''
            ? String(data.synopsis)
            : null,
        productionNotes:
          data?.productionNotes != null && String(data.productionNotes).trim() !== ''
            ? String(data.productionNotes)
            : null,
      },
    });

    if (data?.translations) {
      await this._upsertMediaTranslations(created.id, data.translations);
    }

    return this.getById(created.id, 'en');
  }

  async update(id: number, data: any) {
    if (!id) throw new Error('ID is required.');

    await this._ensureMovieExists(id, 'en');

    const updated = await prisma.media.update({
      where: { id },
      data: {
        title: data.title,
        synopsis: data.synopsis,
        productionNotes: data.productionNotes,
        country: data.country,
        posterImage: data.posterImage,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
        movieInfo: {
          update: {
            duration: data.duration,
            budget: data.budget,
          },
        },
      },
      include: { movieInfo: true },
    });

    await prisma.mediaI18n.upsert({
      where: { mediaId_locale: { mediaId: id, locale: 'en' } },
      update: {
        title: String(data.title),
        synopsis:
          data?.synopsis != null && String(data.synopsis).trim() !== ''
            ? String(data.synopsis)
            : null,
        productionNotes:
          data?.productionNotes != null && String(data.productionNotes).trim() !== ''
            ? String(data.productionNotes)
            : null,
      },
      create: {
        mediaId: id,
        locale: 'en',
        title: String(data.title),
        synopsis:
          data?.synopsis != null && String(data.synopsis).trim() !== ''
            ? String(data.synopsis)
            : null,
        productionNotes:
          data?.productionNotes != null && String(data.productionNotes).trim() !== ''
            ? String(data.productionNotes)
            : null,
      },
    });

    if (data?.translations) {
      await this._upsertMediaTranslations(id, data.translations);
    }

    return this.getById(updated.id, 'en');
  }

  async delete(id: number) {
    if (!id) throw new Error('ID is required.');

    await this._ensureMovieExists(id, 'en');

    return prisma.media.delete({
      where: { id },
    });
  }
}

export const movieService = new MovieService();