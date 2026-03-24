import { prisma } from '../../lib/prisma.js';
import { Locale, parseLocaleStrict, pickTranslation } from '../i18n/locale.js';

export class MovieService {
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
      directors: localizedDirectors,
    };
  }

  /**
   * Helper method to verify a movie exists and is actually a MOVIE
   */
  private async _ensureMovieExists(id: number, locale: Locale) {
    const movie = await prisma.media.findFirst({
      where: {
        id,
        type: { name: 'MOVIE' }
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
          },
          create: {
            mediaId,
            locale,
            title: String(t.title),
            synopsis:
              t?.synopsis != null && String(t.synopsis).trim() !== ''
                ? String(t.synopsis)
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
    if (!id) throw new Error("ID is required.");

    // Using our helper to ensure existence and type safety
    const movie = await this._ensureMovieExists(id, locale);

    return movie;
  }

  async create(data: any) {
    // 1. Basic field validation
    if (!data.title) throw new Error("Title is required.");

    // 2. Lookup Type ID
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
        synopsis: data?.synopsis != null && String(data.synopsis).trim() !== '' ? String(data.synopsis) : null,
      },
      create: {
        mediaId: created.id,
        locale: 'en',
        title: String(data.title),
        synopsis: data?.synopsis != null && String(data.synopsis).trim() !== '' ? String(data.synopsis) : null,
      },
    });

    if (data?.translations) {
      await this._upsertMediaTranslations(created.id, data.translations);
    }

    return this.getById(created.id, 'en');
  }

  async update(id: number, data: any) {
    if (!id) throw new Error("ID is required.");

    // Ensure the record exists and is a movie before updating
    await this._ensureMovieExists(id, 'en');

    const updated = await prisma.media.update({
      where: { id },
      data: {
        title: data.title,
        synopsis: data.synopsis,
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
      include: { movieInfo: true }
    });

    await prisma.mediaI18n.upsert({
      where: { mediaId_locale: { mediaId: id, locale: 'en' } },
      update: {
        title: String(data.title),
        synopsis: data?.synopsis != null && String(data.synopsis).trim() !== '' ? String(data.synopsis) : null,
      },
      create: {
        mediaId: id,
        locale: 'en',
        title: String(data.title),
        synopsis: data?.synopsis != null && String(data.synopsis).trim() !== '' ? String(data.synopsis) : null,
      },
    });

    if (data?.translations) {
      await this._upsertMediaTranslations(id, data.translations);
    }

    return this.getById(updated.id, 'en');
  }

  async delete(id: number) {
    if (!id) throw new Error("ID is required.");

    // Ensure it exists and is a movie
    await this._ensureMovieExists(id, 'en');

    // Prisma will delete the related MovieInfo automatically 
    // if you set onDelete: Cascade in schema, otherwise it handles it here.
    return prisma.media.delete({
      where: { id }
    });
  }
}

export const movieService = new MovieService();