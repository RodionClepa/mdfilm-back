import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

type ImportTranslation = {
  locale: string;
  title?: string;
  synopsis?: string | null;
  productionNotes?: string | null;
  name?: string;
  biography?: string | null;
};

type ImportDirector = {
  key: string;
  name: string;
  biography?: string | null;
  birthDate?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
  imageUrl?: string | null;
  placeOfBirth?: string | null;
  translations?: ImportTranslation[];
};

type ImportPerson = {
  key: string;
  name: string;
  biography?: string | null;
  birthDate?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
  imageUrl?: string | null;
  placeOfBirth?: string | null;
  translations?: ImportTranslation[];
};

type ImportCastItem = {
  personKey: string;
  characterName?: string | null;
  billingOrder?: number | null;
};

type ImportMovie = {
  key: string;
  title: string;
  releaseDate: string;
  synopsis?: string | null;
  productionNotes?: string | null;
  country?: string | null;
  posterImage?: string | null;
  duration: number;
  budget?: number | null;
  translations?: ImportTranslation[];
  directorKeys?: string[];
  cast?: ImportCastItem[];
};

type ImportEpisode = {
  episodeNumber: number;
  airDate?: string | null;
  durationMinutes?: number | null;
};

type ImportSeason = {
  key: string;
  seasonNumber: number;
  releaseYear: number;
  episodes?: ImportEpisode[];
};

type ImportSeries = {
  key: string;
  title: string;
  releaseDate: string;
  synopsis?: string | null;
  productionNotes?: string | null;
  country?: string | null;
  posterImage?: string | null;
  totalSeasons: number;
  status?: 'ONGOING' | 'ENDED' | null;
  firstAirDate: string;
  lastAirDate?: string | null;
  translations?: ImportTranslation[];
  directorKeys?: string[];
  cast?: ImportCastItem[];
  seasons?: ImportSeason[];
};

type AdminImportPayload = {
  directors?: ImportDirector[];
  people?: ImportPerson[];
  movies?: ImportMovie[];
  series?: ImportSeries[];
};

function requireKey(v: any, label: string) {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) throw new Error(`${label} is required`);
  return s;
}

function uniqKeys(items: Array<{ key: string }>, label: string) {
  const set = new Set<string>();
  for (const it of items) {
    if (set.has(it.key)) throw new Error(`${label}: duplicate key '${it.key}'`);
    set.add(it.key);
  }
}

function parseDateOrNull(raw: any, label: string) {
  if (raw === undefined) return undefined;
  if (raw === null || raw === '') return null;
  const s = String(raw);
  const d = new Date(s);
  if (Number.isNaN(d.valueOf())) throw new Error(`${label}: invalid date '${s}'`);
  return d;
}

function parseDateRequired(raw: any, label: string) {
  const d = parseDateOrNull(raw, label);
  if (!d || d === null) throw new Error(`${label} is required`);
  return d;
}

export class AdminImportController {
  async import(req: Request, res: Response) {
    try {
      const body = (req.body ?? {}) as AdminImportPayload;
      const directors = Array.isArray(body.directors) ? body.directors : [];
      const people = Array.isArray(body.people) ? body.people : [];
      const movies = Array.isArray(body.movies) ? body.movies : [];
      const series = Array.isArray(body.series) ? body.series : [];

      uniqKeys(directors, 'directors');
      uniqKeys(people, 'people');
      uniqKeys(movies, 'movies');
      uniqKeys(series, 'series');

      const [movieType, seriesType] = await Promise.all([
        prisma.mediaType.findUnique({ where: { name: 'MOVIE' } }),
        prisma.mediaType.findUnique({ where: { name: 'SERIES' } }),
      ]);
      if (!movieType) throw new Error("MediaType 'MOVIE' not found. Please seed your database.");
      if (!seriesType) throw new Error("MediaType 'SERIES' not found. Please seed your database.");

      const result = await prisma.$transaction(async (tx) => {
        const directorKeyToId: Record<string, number> = {};
        const personKeyToId: Record<string, number> = {};
        const mediaKeyToId: Record<string, number> = {};
        const seasonKeyToId: Record<string, number> = {};

        // Directors
        for (const d of directors) {
          const key = requireKey(d.key, 'director.key');
          const name = requireKey(d.name, `director(${key}).name`);

          const created = await tx.director.create({
            data: {
              name,
              biography: d.biography != null && String(d.biography).trim() !== '' ? String(d.biography) : null,
              birthDate: parseDateOrNull(d.birthDate, `director(${key}).birthDate`),
              gender: (d.gender as any) ?? 'UNSPECIFIED',
              imageUrl: d.imageUrl != null && String(d.imageUrl).trim() !== '' ? String(d.imageUrl) : null,
              placeOfBirth: d.placeOfBirth != null && String(d.placeOfBirth).trim() !== '' ? String(d.placeOfBirth) : null,
            },
          });
          directorKeyToId[key] = created.id;

          const trs = Array.isArray(d.translations) ? d.translations : [];
          if (trs.length) {
            await tx.directorI18n.createMany({
              data: trs
                .filter((t) => t && typeof t.locale === 'string' && t.locale.trim() !== '')
                .map((t) => ({
                  directorId: created.id,
                  locale: String(t.locale),
                  name: t.name != null && String(t.name).trim() !== '' ? String(t.name) : name,
                  biography:
                    t.biography != null && String(t.biography).trim() !== '' ? String(t.biography) : null,
                })),
              skipDuplicates: true,
            });
          }
        }

        // People
        for (const p of people) {
          const key = requireKey(p.key, 'person.key');
          const name = requireKey(p.name, `person(${key}).name`);

          const created = await tx.person.create({
            data: {
              name,
              biography: p.biography != null && String(p.biography).trim() !== '' ? String(p.biography) : null,
              birthDate: parseDateOrNull(p.birthDate, `person(${key}).birthDate`),
              gender: (p.gender as any) ?? 'UNSPECIFIED',
              imageUrl: p.imageUrl != null && String(p.imageUrl).trim() !== '' ? String(p.imageUrl) : null,
              placeOfBirth: p.placeOfBirth != null && String(p.placeOfBirth).trim() !== '' ? String(p.placeOfBirth) : null,
            },
          });
          personKeyToId[key] = created.id;

          const trs = Array.isArray(p.translations) ? p.translations : [];
          if (trs.length) {
            await tx.personI18n.createMany({
              data: trs
                .filter((t) => t && typeof t.locale === 'string' && t.locale.trim() !== '')
                .map((t) => ({
                  personId: created.id,
                  locale: String(t.locale),
                  name: t.name != null && String(t.name).trim() !== '' ? String(t.name) : name,
                  biography:
                    t.biography != null && String(t.biography).trim() !== '' ? String(t.biography) : null,
                })),
              skipDuplicates: true,
            });
          }
        }

        // Movies
        for (const m of movies) {
          const key = requireKey(m.key, 'movie.key');
          const title = requireKey(m.title, `movie(${key}).title`);
          const releaseDate = parseDateRequired(m.releaseDate, `movie(${key}).releaseDate`);

          const created = await tx.media.create({
            data: {
              title,
              releaseDate,
              synopsis: m.synopsis != null && String(m.synopsis).trim() !== '' ? String(m.synopsis) : null,
              productionNotes:
                m.productionNotes != null && String(m.productionNotes).trim() !== ''
                  ? String(m.productionNotes)
                  : null,
              country: m.country != null && String(m.country).trim() !== '' ? String(m.country) : null,
              posterImage:
                m.posterImage != null && String(m.posterImage).trim() !== '' ? String(m.posterImage) : null,
              typeId: movieType.id,
              movieInfo: {
                create: {
                  duration: Number(m.duration),
                  budget: m.budget != null ? Number(m.budget) : null,
                },
              },
            },
            select: { id: true },
          });
          mediaKeyToId[key] = created.id;

          // EN translation
          await tx.mediaI18n.upsert({
            where: { mediaId_locale: { mediaId: created.id, locale: 'en' } },
            update: {
              title,
              synopsis:
                m.synopsis != null && String(m.synopsis).trim() !== '' ? String(m.synopsis) : null,
              productionNotes:
                m.productionNotes != null && String(m.productionNotes).trim() !== ''
                  ? String(m.productionNotes)
                  : null,
            },
            create: {
              mediaId: created.id,
              locale: 'en',
              title,
              synopsis:
                m.synopsis != null && String(m.synopsis).trim() !== '' ? String(m.synopsis) : null,
              productionNotes:
                m.productionNotes != null && String(m.productionNotes).trim() !== ''
                  ? String(m.productionNotes)
                  : null,
            },
          });

          const trs = Array.isArray(m.translations) ? m.translations : [];
          if (trs.length) {
            await tx.mediaI18n.createMany({
              data: trs
                .filter((t) => t && typeof t.locale === 'string' && t.locale.trim() !== '' && t.locale !== 'en')
                .map((t) => ({
                  mediaId: created.id,
                  locale: String(t.locale),
                  title: t.title != null && String(t.title).trim() !== '' ? String(t.title) : title,
                  synopsis:
                    t.synopsis != null && String(t.synopsis).trim() !== '' ? String(t.synopsis) : null,
                  productionNotes:
                    t.productionNotes != null && String(t.productionNotes).trim() !== ''
                      ? String(t.productionNotes)
                      : null,
                })),
              skipDuplicates: true,
            });
          }

          // Directors
          const directorKeys = Array.isArray(m.directorKeys) ? m.directorKeys : [];
          if (directorKeys.length) {
            await tx.mediaDirector.createMany({
              data: directorKeys.map((dk) => {
                const directorId = directorKeyToId[String(dk)];
                if (!directorId) throw new Error(`movie(${key}): unknown directorKey '${dk}'`);
                return { mediaId: created.id, directorId };
              }),
              skipDuplicates: true,
            });
          }

          // Cast
          const cast = Array.isArray(m.cast) ? m.cast : [];
          if (cast.length) {
            await tx.mediaCast.createMany({
              data: cast.map((c) => {
                const personId = personKeyToId[String(c.personKey)];
                if (!personId) throw new Error(`movie(${key}): unknown personKey '${c.personKey}'`);
                return {
                  mediaId: created.id,
                  personId,
                  characterName:
                    c.characterName != null && String(c.characterName).trim() !== ''
                      ? String(c.characterName)
                      : null,
                  billingOrder: c.billingOrder != null ? Number(c.billingOrder) : null,
                };
              }),
              skipDuplicates: true,
            });
          }
        }

        // Series
        for (const s of series) {
          const key = requireKey(s.key, 'series.key');
          const title = requireKey(s.title, `series(${key}).title`);
          const releaseDate = parseDateRequired(s.releaseDate, `series(${key}).releaseDate`);
          const firstAirDate = parseDateRequired(s.firstAirDate, `series(${key}).firstAirDate`);
          const lastAirDate = parseDateOrNull(s.lastAirDate, `series(${key}).lastAirDate`);

          const created = await tx.media.create({
            data: {
              title,
              releaseDate,
              synopsis: s.synopsis != null && String(s.synopsis).trim() !== '' ? String(s.synopsis) : null,
              productionNotes:
                s.productionNotes != null && String(s.productionNotes).trim() !== ''
                  ? String(s.productionNotes)
                  : null,
              country: s.country != null && String(s.country).trim() !== '' ? String(s.country) : null,
              posterImage:
                s.posterImage != null && String(s.posterImage).trim() !== '' ? String(s.posterImage) : null,
              typeId: seriesType.id,
              seriesInfo: {
                create: {
                  totalSeasons: Number(s.totalSeasons),
                  status: s.status === undefined ? undefined : (s.status as any),
                  firstAirDate,
                  lastAirDate: lastAirDate === undefined ? undefined : lastAirDate,
                },
              },
            },
            select: { id: true },
          });
          mediaKeyToId[key] = created.id;

          // EN translation
          await tx.mediaI18n.upsert({
            where: { mediaId_locale: { mediaId: created.id, locale: 'en' } },
            update: {
              title,
              synopsis:
                s.synopsis != null && String(s.synopsis).trim() !== '' ? String(s.synopsis) : null,
              productionNotes:
                s.productionNotes != null && String(s.productionNotes).trim() !== ''
                  ? String(s.productionNotes)
                  : null,
            },
            create: {
              mediaId: created.id,
              locale: 'en',
              title,
              synopsis:
                s.synopsis != null && String(s.synopsis).trim() !== '' ? String(s.synopsis) : null,
              productionNotes:
                s.productionNotes != null && String(s.productionNotes).trim() !== ''
                  ? String(s.productionNotes)
                  : null,
            },
          });

          const trs = Array.isArray(s.translations) ? s.translations : [];
          if (trs.length) {
            await tx.mediaI18n.createMany({
              data: trs
                .filter((t) => t && typeof t.locale === 'string' && t.locale.trim() !== '' && t.locale !== 'en')
                .map((t) => ({
                  mediaId: created.id,
                  locale: String(t.locale),
                  title: t.title != null && String(t.title).trim() !== '' ? String(t.title) : title,
                  synopsis:
                    t.synopsis != null && String(t.synopsis).trim() !== '' ? String(t.synopsis) : null,
                  productionNotes:
                    t.productionNotes != null && String(t.productionNotes).trim() !== ''
                      ? String(t.productionNotes)
                      : null,
                })),
              skipDuplicates: true,
            });
          }

          // Directors
          const directorKeys = Array.isArray(s.directorKeys) ? s.directorKeys : [];
          if (directorKeys.length) {
            await tx.mediaDirector.createMany({
              data: directorKeys.map((dk) => {
                const directorId = directorKeyToId[String(dk)];
                if (!directorId) throw new Error(`series(${key}): unknown directorKey '${dk}'`);
                return { mediaId: created.id, directorId };
              }),
              skipDuplicates: true,
            });
          }

          // Cast
          const cast = Array.isArray(s.cast) ? s.cast : [];
          if (cast.length) {
            await tx.mediaCast.createMany({
              data: cast.map((c) => {
                const personId = personKeyToId[String(c.personKey)];
                if (!personId) throw new Error(`series(${key}): unknown personKey '${c.personKey}'`);
                return {
                  mediaId: created.id,
                  personId,
                  characterName:
                    c.characterName != null && String(c.characterName).trim() !== ''
                      ? String(c.characterName)
                      : null,
                  billingOrder: c.billingOrder != null ? Number(c.billingOrder) : null,
                };
              }),
              skipDuplicates: true,
            });
          }

          // Seasons + Episodes
          const seasons = Array.isArray(s.seasons) ? s.seasons : [];
          for (const seas of seasons) {
            const seasonKey = requireKey(seas.key, `series(${key}).season.key`);
            const seasonNumber = Number(seas.seasonNumber);
            const releaseYear = Number(seas.releaseYear);
            if (!Number.isFinite(seasonNumber) || seasonNumber <= 0) {
              throw new Error(`series(${key}).season(${seasonKey}): invalid seasonNumber`);
            }
            if (!Number.isFinite(releaseYear) || releaseYear < 1900) {
              throw new Error(`series(${key}).season(${seasonKey}): invalid releaseYear`);
            }

            const createdSeason = await tx.season.create({
              data: {
                mediaId: created.id,
                seasonNumber,
                releaseYear,
              },
              select: { id: true },
            });
            seasonKeyToId[seasonKey] = createdSeason.id;

            const episodes = Array.isArray(seas.episodes) ? seas.episodes : [];
            if (episodes.length) {
              await tx.episode.createMany({
                data: episodes.map((e) => ({
                  seasonId: createdSeason.id,
                  episodeNumber: Number(e.episodeNumber),
                  durationMinutes: e.durationMinutes != null ? Number(e.durationMinutes) : null,
                  airDate: e.airDate ? new Date(String(e.airDate)) : null,
                })),
              });
            }
          }
        }

        return {
          directorKeyToId,
          personKeyToId,
          mediaKeyToId,
          seasonKeyToId,
          counts: {
            directors: directors.length,
            people: people.length,
            movies: movies.length,
            series: series.length,
          },
        };
      });

      return res.json(result);
    } catch (e: any) {
      return res.status(400).json({ error: e?.message ?? 'Import failed' });
    }
  }
}

export const adminImportController = new AdminImportController();
