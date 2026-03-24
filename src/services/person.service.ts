import { prisma } from '../../lib/prisma.js';
import { Locale, parseLocaleStrict, pickTranslation } from '../i18n/locale.js';

export class PersonService {
  private async _upsertPersonTranslations(personId: number, translations: any) {
    if (!Array.isArray(translations) || translations.length === 0) return;

    await prisma.$transaction(
      translations.map((t: any) => {
        const locale = parseLocaleStrict(t?.locale);
        if (!locale) throw new Error(`Unsupported locale '${t?.locale}'`);
        if (!t?.name) throw new Error(`Translation name is required for locale '${locale}'`);
        return prisma.personI18n.upsert({
          where: { personId_locale: { personId, locale } },
          update: {
            name: String(t.name),
            biography:
              t?.biography != null && String(t.biography).trim() !== ''
                ? String(t.biography)
                : null,
          },
          create: {
            personId,
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

  private _localizePerson(p: any, locale: Locale) {
    const pt = pickTranslation(p?.translations, locale);
    return {
      ...p,
      name: pt?.name ?? p?.name,
      biography: pt?.biography ?? p?.biography,
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
    return prisma.person.findMany({
      orderBy: { id: 'asc' },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
      },
    }).then((rows: any[]) => rows.map((p: any) => this._localizePerson(p, locale)));
  }

  async getById(id: number, locale: Locale) {
    if (!id) throw new Error('ID is required.');
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
      },
    });
    if (!person) throw new Error(`Person with ID ${id} not found.`);
    return this._localizePerson(person as any, locale);
  }

  async create(data: any) {
    if (!data?.name) throw new Error('Name is required.');
    const created = await prisma.person.create({
      data: {
        name: String(data.name),
        ...this._toProfileData(data),
      },
    });

    await prisma.personI18n.upsert({
      where: { personId_locale: { personId: created.id, locale: 'en' } },
      update: {
        name: String(data.name),
        biography: data?.biography != null && String(data.biography).trim() !== '' ? String(data.biography) : null,
      },
      create: {
        personId: created.id,
        locale: 'en',
        name: String(data.name),
        biography: data?.biography != null && String(data.biography).trim() !== '' ? String(data.biography) : null,
      },
    });

    if (data?.translations) {
      await this._upsertPersonTranslations(created.id, data.translations);
    }

    return this.getById(created.id, 'en');
  }

  async update(id: number, data: any) {
    if (!id) throw new Error('ID is required.');
    if (!data?.name) throw new Error('Name is required.');
    await this.getById(id, 'en');
    const updated = await prisma.person.update({
      where: { id },
      data: {
        name: String(data.name),
        ...this._toProfileData(data),
      },
    });

    await prisma.personI18n.upsert({
      where: { personId_locale: { personId: id, locale: 'en' } },
      update: {
        name: String(data.name),
        biography: data?.biography != null && String(data.biography).trim() !== '' ? String(data.biography) : null,
      },
      create: {
        personId: id,
        locale: 'en',
        name: String(data.name),
        biography: data?.biography != null && String(data.biography).trim() !== '' ? String(data.biography) : null,
      },
    });

    if (data?.translations) {
      await this._upsertPersonTranslations(id, data.translations);
    }

    return this.getById(updated.id, 'en');
  }

  async getFilmography(id: number, locale: Locale) {
    if (!id) throw new Error('ID is required.');
    await this.getById(id, locale);
    return prisma.media.findMany({
      where: {
        cast: {
          some: { personId: id },
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
    await prisma.person.delete({ where: { id } });
  }
}

export const personService = new PersonService();

