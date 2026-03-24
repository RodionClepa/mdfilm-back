import { prisma } from '../../lib/prisma.js';
import { Locale, parseLocaleStrict, pickTranslation } from '../i18n/locale.js';

export class SeriesService {
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
   * Helper method to verify a series exists and is actually a SERIES
   */
  private async _ensureSeriesExists(id: number, locale: Locale) {
    const series = await prisma.media.findFirst({
      where: {
        id,
        type: { name: 'SERIES' },
      },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        seriesInfo: true,
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

    if (!series) {
      throw new Error(`Series with ID ${id} not found.`);
    }
    return this._localizeMedia(series, locale);
  }

  async getAll(locale: Locale) {
    return prisma.media.findMany({
      where: { type: { name: 'SERIES' } },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        seriesInfo: true,
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

    return this._ensureSeriesExists(id, locale);
  }

  async create(data: any) {
    if (!data.title) throw new Error('Title is required.');
    if (!data.releaseDate) throw new Error('releaseDate is required.');

    const seriesType = await prisma.mediaType.findUnique({
      where: { name: 'SERIES' },
    });

    if (!seriesType) {
      throw new Error(
        "MediaType 'SERIES' not found. Please seed your database.",
      );
    }

    const firstAirDate =
      data.firstAirDate ?? data.seriesInfo?.firstAirDate ?? data.releaseDate;
    if (!firstAirDate) throw new Error('firstAirDate is required.');

    const lastAirDate = data.lastAirDate ?? data.seriesInfo?.lastAirDate ?? null;

    const created = await prisma.media.create({
      data: {
        title: data.title,
        releaseDate: new Date(data.releaseDate),
        synopsis: data.synopsis,
        country: data.country,
        posterImage: data.posterImage,
        typeId: seriesType.id,
        seriesInfo: {
          create: {
            totalSeasons:
              data.totalSeasons ?? data.seriesInfo?.totalSeasons ?? 1,
            status: data.status ?? data.seriesInfo?.status,
            firstAirDate: new Date(firstAirDate),
            lastAirDate: lastAirDate ? new Date(lastAirDate) : null,
          },
        },
      },
      include: { seriesInfo: true },
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
    if (!id) throw new Error('ID is required.');

    await this._ensureSeriesExists(id, 'en');

    const updated = await prisma.media.update({
      where: { id },
      data: {
        title: data.title,
        synopsis: data.synopsis,
        country: data.country,
        posterImage: data.posterImage,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
        seriesInfo: {
          update: {
            totalSeasons: data.totalSeasons ?? data.seriesInfo?.totalSeasons,
            status: data.status ?? data.seriesInfo?.status,
            firstAirDate: data.firstAirDate
              ? new Date(data.firstAirDate)
              : data.seriesInfo?.firstAirDate
                ? new Date(data.seriesInfo.firstAirDate)
                : undefined,
            lastAirDate:
              data.lastAirDate !== undefined
                ? data.lastAirDate
                  ? new Date(data.lastAirDate)
                  : null
                : data.seriesInfo?.lastAirDate !== undefined
                  ? data.seriesInfo.lastAirDate
                    ? new Date(data.seriesInfo.lastAirDate)
                    : null
                  : undefined,
          },
        },
      },
      include: { seriesInfo: true },
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
    if (!id) throw new Error('ID is required.');

    await this._ensureSeriesExists(id, 'en');

    return prisma.media.delete({
      where: { id },
    });
  }
}

export const seriesService = new SeriesService();

