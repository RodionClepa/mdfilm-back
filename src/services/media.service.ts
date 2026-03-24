import { prisma } from '../../lib/prisma.js';
import { movieService } from './movie.service.js';
import { seriesService } from './series.service.js';
import { Locale, parseLocaleStrict, pickTranslation } from '../i18n/locale.js';

type MediaTypeName = 'MOVIE' | 'SERIES' | string;

interface BaseMediaCreateInput {
  title: string;
  releaseDate: string | Date;
  synopsis?: string;
  country?: string;
  posterImage?: string;
  directorId?: number;
}

interface MovieSpecificCreateInput {
  duration: number;
  budget?: number;
}

interface SeriesSpecificCreateInput {
  totalSeasons?: number;
  status?: string;
  firstAirDate: string | Date;
  lastAirDate?: string | Date;
}

export interface MediaCreateInput extends BaseMediaCreateInput {
  /**
   * Logical media type name from `MediaType` lookup table,
   * e.g. "MOVIE" or "SERIES".
   */
  typeName: MediaTypeName;

  /**
   * For MOVIE media, you can either pass these fields inline
   * or inside `movieInfo`.
   */
  duration?: number;
  budget?: number;
  movieInfo?: MovieSpecificCreateInput;

  /**
   * For SERIES media, you can either pass these fields inline
   * or inside `seriesInfo`.
   */
  totalSeasons?: number;
  status?: string;
  firstAirDate?: string | Date;
  lastAirDate?: string | Date;
  seriesInfo?: SeriesSpecificCreateInput;
}

export class MediaService {
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

  private _localizePersonRow(row: any, locale: Locale) {
    const p: any = row?.person;
    const pt = pickTranslation(p?.translations, locale);
    return {
      ...row,
      person: {
        ...p,
        name: pt?.name ?? p?.name,
        biography: pt?.biography ?? p?.biography,
      },
    };
  }

  private _localizeMedia(m: any, locale: Locale) {
    const mt = pickTranslation(m?.translations, locale);
    const directors = Array.isArray(m?.directors)
      ? m.directors.map((md: any) => this._localizeDirectorRow(md, locale))
      : m?.directors;
    const cast = Array.isArray(m?.cast)
      ? m.cast.map((mc: any) => this._localizePersonRow(mc, locale))
      : m?.cast;

    return {
      ...m,
      title: mt?.title ?? m?.title,
      synopsis: mt?.synopsis ?? m?.synopsis,
      directors,
      cast,
    };
  }

  private async _ensureMediaExists(id: number) {
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        type: true,
        movieInfo: true,
        seriesInfo: true,
      },
    });

    if (!media) {
      throw new Error(`Media with ID ${id} not found.`);
    }

    return media;
  }

  private async _ensureAllDirectorsExist(directorIds: number[]) {
    const uniqueIds = Array.from(new Set(directorIds));
    const found = await prisma.director.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    const foundIds = new Set(found.map((d) => d.id));
    const missing = uniqueIds.filter((id) => !foundIds.has(id));
    if (missing.length) {
      throw new Error(`Director(s) not found: ${missing.join(', ')}`);
    }
  }

  private async _ensureAllPeopleExist(personIds: number[]) {
    const uniqueIds = Array.from(new Set(personIds));
    const found = await prisma.person.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    const foundIds = new Set(found.map((p) => p.id));
    const missing = uniqueIds.filter((id) => !foundIds.has(id));
    if (missing.length) {
      throw new Error(`Person(s) not found: ${missing.join(', ')}`);
    }
  }

  async getAll(locale: Locale) {
    return prisma.media.findMany({
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        type: true,
        directors: { include: { director: { include: { translations: { where: { locale: { in: [locale, 'en'] } } } } } } },
        cast: { include: { person: { include: { translations: { where: { locale: { in: [locale, 'en'] } } } } } } },
        movieInfo: true,
        seriesInfo: true,
        seasons: {
          include: {
            episodes: true,
          },
        },
        watchLinks: true,
      },
    }).then((rows: any[]) => rows.map((m: any) => this._localizeMedia(m, locale)));
  }

  async getById(id: number, locale: Locale) {
    if (!id) throw new Error('ID is required.');

    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        type: true,
        directors: { include: { director: { include: { translations: { where: { locale: { in: [locale, 'en'] } } } } } } },
        cast: { include: { person: { include: { translations: { where: { locale: { in: [locale, 'en'] } } } } } } },
        movieInfo: true,
        seriesInfo: true,
        seasons: {
          include: {
            episodes: true,
          },
        },
        watchLinks: true,
      },
    });

    if (!media) {
      throw new Error(`Media with ID ${id} not found.`);
    }

    return this._localizeMedia(media as any, locale);
  }

  async getCast(mediaId: number, locale: Locale) {
    if (!mediaId) throw new Error('mediaId is required.');
    await this._ensureMediaExists(mediaId);

    return prisma.mediaCast.findMany({
      where: { mediaId },
      include: { person: { include: { translations: { where: { locale: { in: [locale, 'en'] } } } } } },
      orderBy: [{ billingOrder: 'asc' }, { createdAt: 'asc' }],
    }).then((rows: any[]) => rows.map((r: any) => this._localizePersonRow(r, locale)));
  }

  async addCastMember(
    mediaId: number,
    payload: { personId: number; characterName?: string; billingOrder?: number },
  ) {
    if (!mediaId) throw new Error('mediaId is required.');
    if (!payload?.personId) throw new Error('personId is required.');

    await this._ensureMediaExists(mediaId);
    await this._ensureAllPeopleExist([payload.personId]);

    await prisma.mediaCast.upsert({
      where: { mediaId_personId: { mediaId, personId: payload.personId } },
      update: {
        characterName: payload.characterName,
        billingOrder: payload.billingOrder ?? null,
      },
      create: {
        mediaId,
        personId: payload.personId,
        characterName: payload.characterName,
        billingOrder: payload.billingOrder ?? null,
      },
    });

    return this.getById(mediaId, 'en');
  }

  async replaceCast(
    mediaId: number,
    cast: Array<{ personId: number; characterName?: string; billingOrder?: number }>,
  ) {
    if (!mediaId) throw new Error('mediaId is required.');
    if (!Array.isArray(cast)) throw new Error('cast must be an array.');

    await this._ensureMediaExists(mediaId);

    const personIds = cast.map((c) => Number(c.personId)).filter(Boolean);
    if (personIds.length) {
      await this._ensureAllPeopleExist(personIds);
    }

    // last write wins for duplicates
    const byPerson = new Map<number, { personId: number; characterName?: string; billingOrder?: number }>();
    for (const c of cast) {
      const pid = Number(c.personId);
      if (!pid) continue;
      byPerson.set(pid, {
        personId: pid,
        characterName: c.characterName,
        billingOrder: c.billingOrder,
      });
    }

    const unique = Array.from(byPerson.values());

    await prisma.$transaction([
      prisma.mediaCast.deleteMany({ where: { mediaId } }),
      ...(unique.length
        ? [
            prisma.mediaCast.createMany({
              data: unique.map((c) => ({
                mediaId,
                personId: c.personId,
                characterName: c.characterName,
                billingOrder: c.billingOrder ?? null,
              })),
            }),
          ]
        : []),
    ]);

    return this.getById(mediaId, 'en');
  }

  async removeCastMember(mediaId: number, personId: number) {
    if (!mediaId) throw new Error('mediaId is required.');
    if (!personId) throw new Error('personId is required.');
    await this._ensureMediaExists(mediaId);

    await prisma.mediaCast.delete({
      where: { mediaId_personId: { mediaId, personId } },
    });

    return this.getById(mediaId, 'en');
  }

  async getDirectors(mediaId: number, locale: Locale) {
    if (!mediaId) throw new Error('mediaId is required.');
    await this._ensureMediaExists(mediaId);

    return prisma.mediaDirector.findMany({
      where: { mediaId },
      include: { director: { include: { translations: { where: { locale: { in: [locale, 'en'] } } } } } },
      orderBy: { createdAt: 'asc' },
    }).then((rows: any[]) => rows.map((r: any) => this._localizeDirectorRow(r, locale)));
  }

  async addDirectors(mediaId: number, directorIds: number[]) {
    if (!mediaId) throw new Error('mediaId is required.');
    if (!Array.isArray(directorIds) || directorIds.length === 0) {
      throw new Error('directorIds must be a non-empty array.');
    }

    await this._ensureMediaExists(mediaId);
    await this._ensureAllDirectorsExist(directorIds);

    const uniqueIds = Array.from(new Set(directorIds));

    await prisma.mediaDirector.createMany({
      data: uniqueIds.map((directorId) => ({ mediaId, directorId })),
      skipDuplicates: true,
    });

    return this.getById(mediaId, 'en');
  }

  async replaceDirectors(mediaId: number, directorIds: number[]) {
    if (!mediaId) throw new Error('mediaId is required.');
    if (!Array.isArray(directorIds)) {
      throw new Error('directorIds must be an array.');
    }

    await this._ensureMediaExists(mediaId);
    if (directorIds.length) {
      await this._ensureAllDirectorsExist(directorIds);
    }

    const uniqueIds = Array.from(new Set(directorIds));

    await prisma.$transaction([
      prisma.mediaDirector.deleteMany({ where: { mediaId } }),
      ...(uniqueIds.length
        ? [
            prisma.mediaDirector.createMany({
              data: uniqueIds.map((directorId) => ({ mediaId, directorId })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    return this.getById(mediaId, 'en');
  }

  async removeDirector(mediaId: number, directorId: number) {
    if (!mediaId) throw new Error('mediaId is required.');
    if (!directorId) throw new Error('directorId is required.');
    await this._ensureMediaExists(mediaId);

    await prisma.mediaDirector.delete({
      where: { mediaId_directorId: { mediaId, directorId } },
    });

    return this.getById(mediaId, 'en');
  }

  /**
   * Create a Media record, optionally as a specific kind of media:
   * - MOVIE -> delegates to `MovieService` (creates `Media` + `MovieInfo`)
   * - SERIES -> will delegate to `SeriesService` once implemented
   *
   * This respects the rule that every movie/series is a media,
   * but a media does not have to be a movie or series.
   */
  async create(data: MediaCreateInput) {
    if (!data.title) throw new Error('Title is required.');
    if (!data.typeName) throw new Error('typeName is required.');

    if (data.typeName === 'MOVIE') {
      // Delegate to MovieService so movie-specific rules live there
      return movieService.create(data);
    }

    if (data.typeName === 'SERIES') {
      // Delegate to SeriesService so series-specific rules live there
      return seriesService.create(data);
    }

    const mediaType = await prisma.mediaType.findUnique({
      where: { name: data.typeName },
    });

    if (!mediaType) {
      throw new Error(
        `MediaType '${data.typeName}' not found. Please seed your database.`,
      );
    }

    if (data.directorId) {
      throw new Error(
        'Use the Director attach endpoints after creating media (directorId is no longer supported on create).',
      );
    }

    const releaseDate =
      data.releaseDate instanceof Date
        ? data.releaseDate
        : new Date(data.releaseDate);

    const mediaData: any = {
      title: data.title,
      releaseDate,
      synopsis: data.synopsis,
      country: data.country,
      posterImage: data.posterImage,
      typeId: mediaType.id,
    };

    const created = await prisma.media.create({
      data: mediaData,
      include: {
        type: true,
        directors: { include: { director: true } },
        cast: { include: { person: true } },
        movieInfo: true,
        seriesInfo: true,
      },
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

    if ((data as any)?.translations) {
      await this._upsertMediaTranslations(created.id, (data as any).translations);
    }

    return this.getById(created.id, 'en');
  }

  async update(id: number, data: Partial<MediaCreateInput>) {
    if (!id) throw new Error('ID is required.');

    await this._ensureMediaExists(id);

    const updateData: any = {
      title: data.title,
      synopsis: data.synopsis,
      country: data.country,
      posterImage: data.posterImage,
    };

    if (data.releaseDate) {
      updateData.releaseDate =
        data.releaseDate instanceof Date
          ? data.releaseDate
          : new Date(data.releaseDate);
    }

    const updated = await prisma.media.update({
      where: { id },
      data: updateData,
      include: {
        type: true,
        directors: { include: { director: true } },
        cast: { include: { person: true } },
        movieInfo: true,
        seriesInfo: true,
      },
    });

    if (data.title !== undefined || data.synopsis !== undefined) {
      await prisma.mediaI18n.upsert({
        where: { mediaId_locale: { mediaId: id, locale: 'en' } },
        update: {
          ...(data.title !== undefined ? { title: String(data.title) } : {}),
          ...(data.synopsis !== undefined
            ? { synopsis: data.synopsis != null && String(data.synopsis).trim() !== '' ? String(data.synopsis) : null }
            : {}),
        },
        create: {
          mediaId: id,
          locale: 'en',
          title: data.title != null ? String(data.title) : '',
          synopsis:
            data.synopsis != null && String(data.synopsis).trim() !== '' ? String(data.synopsis) : null,
        },
      });
    }

    if ((data as any)?.translations) {
      await this._upsertMediaTranslations(id, (data as any).translations);
    }

    return this.getById(updated.id, 'en');
  }

  async delete(id: number) {
    if (!id) throw new Error('ID is required.');

    await this._ensureMediaExists(id);

    return prisma.media.delete({
      where: { id },
    });
  }
}

export const mediaService = new MediaService();

