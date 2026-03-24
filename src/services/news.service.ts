import { prisma } from '../../lib/prisma.js';
import { Locale, parseLocaleStrict, pickTranslation } from '../i18n/locale.js';

export class NewsService {
  private async _upsertNewsTranslations(newsId: number, translations: any) {
    if (!Array.isArray(translations) || translations.length === 0) return;

    await prisma.$transaction(
      translations.map((t: any) => {
        const locale = parseLocaleStrict(t?.locale);
        if (!locale) throw new Error(`Unsupported locale '${t?.locale}'`);
        if (!t?.title) throw new Error(`Translation title is required for locale '${locale}'`);
        if (!t?.content) throw new Error(`Translation content is required for locale '${locale}'`);

        return prisma.newsI18n.upsert({
          where: { newsId_locale: { newsId, locale } },
          update: {
            title: String(t.title),
            excerpt:
              t?.excerpt != null && String(t.excerpt).trim() !== '' ? String(t.excerpt) : null,
            content: String(t.content),
          },
          create: {
            newsId,
            locale,
            title: String(t.title),
            excerpt:
              t?.excerpt != null && String(t.excerpt).trim() !== '' ? String(t.excerpt) : null,
            content: String(t.content),
          },
        });
      }),
    );
  }

  private _localizeNewsRow(row: any, locale: Locale) {
    const t = pickTranslation(row?.translations, locale);
    return {
      ...row,
      title: t?.title,
      excerpt: t?.excerpt ?? null,
      content: t?.content,
    };
  }

  async getAll(locale: Locale) {
    return prisma.news
      .findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          translations: { where: { locale: { in: [locale, 'en'] } } },
        },
      })
      .then((rows: any[]) => rows.map((r: any) => this._localizeNewsRow(r, locale)));
  }

  async getBySlug(slug: string, locale: Locale) {
    if (!slug) throw new Error('slug is required.');
    const row = await prisma.news.findUnique({
      where: { slug },
      include: {
        translations: { where: { locale: { in: [locale, 'en'] } } },
      },
    });
    if (!row) throw new Error(`News with slug '${slug}' not found.`);
    return this._localizeNewsRow(row as any, locale);
  }

  // Admin

  async adminGetAll() {
    return prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      include: { translations: true },
    });
  }

  async adminGetById(id: number) {
    if (!id) throw new Error('ID is required.');
    const row = await prisma.news.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!row) throw new Error(`News with ID ${id} not found.`);
    return row;
  }

  async create(data: any) {
    const slug = data?.slug != null ? String(data.slug).trim() : '';
    if (!slug) throw new Error('slug is required.');

    const title = data?.title != null ? String(data.title).trim() : '';
    const content = data?.content != null ? String(data.content).trim() : '';
    if (!title) throw new Error('title is required.');
    if (!content) throw new Error('content is required.');

    const coverImageUrl =
      data?.coverImageUrl != null && String(data.coverImageUrl).trim() !== ''
        ? String(data.coverImageUrl)
        : null;

    const created = await prisma.news.create({
      data: {
        slug,
        coverImageUrl,
      },
    });

    await prisma.newsI18n.upsert({
      where: { newsId_locale: { newsId: created.id, locale: 'en' } },
      update: {
        title: String(title),
        excerpt:
          data?.excerpt != null && String(data.excerpt).trim() !== '' ? String(data.excerpt) : null,
        content: String(content),
      },
      create: {
        newsId: created.id,
        locale: 'en',
        title: String(title),
        excerpt:
          data?.excerpt != null && String(data.excerpt).trim() !== '' ? String(data.excerpt) : null,
        content: String(content),
      },
    });

    if (data?.translations) {
      await this._upsertNewsTranslations(created.id, data.translations);
    }

    return this.adminGetById(created.id);
  }

  async update(id: number, data: any) {
    if (!id) throw new Error('ID is required.');
    await this.adminGetById(id);

    const patch: any = {};

    if (data?.slug != null) {
      const slug = String(data.slug).trim();
      if (!slug) throw new Error('slug cannot be empty.');
      patch.slug = slug;
    }

    if (data?.coverImageUrl !== undefined) {
      patch.coverImageUrl =
        data.coverImageUrl != null && String(data.coverImageUrl).trim() !== ''
          ? String(data.coverImageUrl)
          : null;
    }

    if (Object.keys(patch).length > 0) {
      await prisma.news.update({ where: { id }, data: patch });
    }

    const hasEnUpdate = data?.title != null || data?.content != null || data?.excerpt !== undefined;
    if (hasEnUpdate) {
      const title = data?.title != null ? String(data.title).trim() : undefined;
      const content = data?.content != null ? String(data.content).trim() : undefined;
      if (title !== undefined && !title) throw new Error('title cannot be empty.');
      if (content !== undefined && !content) throw new Error('content cannot be empty.');

      await prisma.newsI18n.upsert({
        where: { newsId_locale: { newsId: id, locale: 'en' } },
        update: {
          ...(title !== undefined ? { title } : null),
          ...(content !== undefined ? { content } : null),
          ...(data?.excerpt !== undefined
            ? {
                excerpt:
                  data?.excerpt != null && String(data.excerpt).trim() !== ''
                    ? String(data.excerpt)
                    : null,
              }
            : null),
        },
        create: {
          newsId: id,
          locale: 'en',
          title: title ?? '',
          excerpt:
            data?.excerpt != null && String(data.excerpt).trim() !== '' ? String(data.excerpt) : null,
          content: content ?? '',
        },
      });
    }

    if (data?.translations) {
      await this._upsertNewsTranslations(id, data.translations);
    }

    return this.adminGetById(id);
  }

  async delete(id: number) {
    if (!id) throw new Error('ID is required.');
    await this.adminGetById(id);
    await prisma.news.delete({ where: { id } });
  }
}

export const newsService = new NewsService();
