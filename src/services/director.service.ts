import { prisma } from '../../lib/prisma.js';
import { Locale, parseLocaleStrict, pickTranslation } from '../i18n/locale.js';

export class DirectorService {
  private async _upsertDirectorTranslations(directorId: number, translations: any) {
    if (!Array.isArray(translations) || translations.length === 0) return;

    await prisma.$transaction(
      translations.map((t: any) => {
        const locale = parseLocaleStrict(t?.locale);
        if (!locale) throw new Error(`Unsupported locale '${t?.locale}'`);
        if (!t?.name) throw new Error(`Translation name is required for locale '${locale}'`);
        return prisma.directorI18n.upsert({
          where: { directorId_locale: { directorId, locale } },
          update: {
            name: String(t.name),
            biography:
              t?.biography != null && String(t.biography).trim() !== ''
                ? String(t.biography)
                : null,
          },
          create: {
            directorId,
            locale,
            name: String(t.name),
            biography:
              t?.biography != null && String(t.biography).trim() !== ''
                ? String(t.biography)
                : null,
          },
        });
      }),
    );
  }

  private _localizeDirector(d: any, locale: Locale) {
    const dt = pickTranslation(d?.translations, locale);
    return {
      ...d,
      name: dt?.name ?? d?.name,
      biography: dt?.biography ?? d?.biography,
    };
  }

  private _localizeMedia(m: any, locale: Locale) {
    const mt = pickTranslation(m?.translations, locale);
    return {
      ...m,
      title: mt?.title ?? m?.title,
      synopsis: mt?.synopsis ?? m?.synopsis,
    };
  }

  private _toProfileData(data: any) {
    const genderRaw = typeof data?.gender === 'string' ? data.gender : undefined;
    const gender = genderRaw === 'MALE' || genderRaw === 'FEMALE' || genderRaw === 'UNSPECIFIED'
      ? genderRaw
      : undefined;

    const birthDateRaw = data?.birthDate;
    const birthDate =
      birthDateRaw == null || birthDateRaw === ''
        ? undefined
        : birthDateRaw instanceof Date
          ? birthDateRaw
          : new Date(String(birthDateRaw));

    const earningsRaw = data?.earnings;
    const earnings =
      earningsRaw == null || earningsRaw === ''
        ? undefined
        : Number.isFinite(Number(earningsRaw))
          ? Number(earningsRaw)
          : undefined;

    return {
      earnings,
      biography: data?.biography != null && String(data.biography).trim() !== '' ? String(data.biography) : undefined,
      birthDate: birthDate != null && !Number.isNaN(birthDate.getTime()) ? birthDate : undefined,
      gender,
      imageUrl: data?.imageUrl != null && String(data.imageUrl).trim() !== '' ? String(data.imageUrl) : undefined,
      placeOfBirth:
        data?.placeOfBirth != null && String(data.placeOfBirth).trim() !== '' ? String(data.placeOfBirth) : undefined,
    };
  }

  async getAll(locale: Locale) {
    return prisma.director.findMany({
      orderBy: { id: 'asc' },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
      },
    }).then((rows: any[]) => rows.map((d: any) => this._localizeDirector(d, locale)));
  }

  async getById(id: number, locale: Locale) {
    if (!id) throw new Error('ID is required.');
    const director = await prisma.director.findUnique({
      where: { id },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
      },
    });
    if (!director) throw new Error(`Director with ID ${id} not found.`);
    return this._localizeDirector(director as any, locale);
  }

  async create(data: any) {
    if (!data?.name) throw new Error('Name is required.');
    const created = await prisma.director.create({
      data: {
        name: String(data.name),
        ...this._toProfileData(data),
      },
    });

    await prisma.directorI18n.upsert({
      where: { directorId_locale: { directorId: created.id, locale: 'en' } },
      update: {
        name: String(data.name),
        biography: data?.biography != null && String(data.biography).trim() !== '' ? String(data.biography) : null,
      },
      create: {
        directorId: created.id,
        locale: 'en',
        name: String(data.name),
        biography: data?.biography != null && String(data.biography).trim() !== '' ? String(data.biography) : null,
      },
    });

    if (data?.translations) {
      await this._upsertDirectorTranslations(created.id, data.translations);
    }

    return this.getById(created.id, 'en');
  }

  async update(id: number, data: any) {
    if (!id) throw new Error('ID is required.');
    if (!data?.name) throw new Error('Name is required.');
    await this.getById(id, 'en');
    const updated = await prisma.director.update({
      where: { id },
      data: {
        name: String(data.name),
        ...this._toProfileData(data),
      },
    });

    await prisma.directorI18n.upsert({
      where: { directorId_locale: { directorId: id, locale: 'en' } },
      update: {
        name: String(data.name),
        biography: data?.biography != null && String(data.biography).trim() !== '' ? String(data.biography) : null,
      },
      create: {
        directorId: id,
        locale: 'en',
        name: String(data.name),
        biography: data?.biography != null && String(data.biography).trim() !== '' ? String(data.biography) : null,
      },
    });

    if (data?.translations) {
      await this._upsertDirectorTranslations(id, data.translations);
    }

    return this.getById(updated.id, 'en');
  }

  async getFilmography(id: number, locale: Locale) {
    if (!id) throw new Error('ID is required.');
    await this.getById(id, locale);
    return prisma.media.findMany({
      where: {
        directors: {
          some: { directorId: id },
        },
      },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
        type: true,
      },
      orderBy: { releaseDate: 'desc' },
    }).then((rows: any[]) => rows.map((m: any) => this._localizeMedia(m, locale)));
  }

  async delete(id: number) {
    if (!id) throw new Error('ID is required.');
    await this.getById(id, 'en');
    await prisma.director.delete({ where: { id } });
  }
}

export const directorService = new DirectorService();

