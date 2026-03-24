import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { publicEndpoints } from '../publicEndpoints';
import type { Media, MediaCast, MediaDirector } from '../types';
import '../App.css';
import { usePublicLang } from '../publicLang';
import { t, tMediaType } from '../publicI18n';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return d;
  }
}

export function TitleDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  const { lang } = usePublicLang();

  const [item, setItem] = useState<Media | null>(null);
  const [directors, setDirectors] = useState<MediaDirector[]>([]);
  const [cast, setCast] = useState<MediaCast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posterOk, setPosterOk] = useState(true);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [m, ds, cs] = await Promise.all([
        publicEndpoints.media.get(id, lang),
        publicEndpoints.media.directors.list(id, lang),
        publicEndpoints.media.cast.list(id, lang),
      ]);
      setItem(m);
      setDirectors(ds);
      setCast(cs);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  const title = item?.title ?? 'Title';
  const type = item?.type?.name ?? '—';
  const typeLabel = tMediaType(lang, type);

  return (
    <div className="app title-details">
      <div className="title-hero">
        <div className="title-hero-top">
          <div>
            <div className="title-kicker">{typeLabel}</div>
            <div className="title-title">{title}</div>
            <div className="title-subtitle">
              {fmtDate(item?.releaseDate)}
              {item?.country ? ` • ${item.country}` : ''}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {!item && !error && <div className="muted">{loading ? t(lang, 'loading') : t(lang, 'not_found')}</div>}

      {item && (
        <div className="title-layout">
          <div className="title-poster-col">
            <div className="title-poster">
              {item.posterImage && posterOk ? (
                <img src={item.posterImage} alt={item.title} onError={() => setPosterOk(false)} />
              ) : (
                <div className="title-poster-placeholder">{t(lang, 'poster_fallback')}</div>
              )}
            </div>

            <div className="title-meta">
              <div className="title-chip">{t(lang, 'release_chip')}: {fmtDate(item.releaseDate)}</div>
              <div className="title-chip">{t(lang, 'type_chip')}: {typeLabel}</div>
              {item.movieInfo?.duration ? (
                <div className="title-chip">{t(lang, 'duration_chip')}: {item.movieInfo.duration} {t(lang, 'unit_min')}</div>
              ) : null}
              {item.seriesInfo?.totalSeasons ? (
                <div className="title-chip">{t(lang, 'seasons_chip')}: {item.seriesInfo.totalSeasons}</div>
              ) : null}
              {item.seriesInfo?.status ? (
                <div className="title-chip">{t(lang, 'series_status_chip')}: {item.seriesInfo.status}</div>
              ) : null}
            </div>
          </div>

          <div className="title-main">
            <div className="title-panel">
              <div className="title-panel-title">{t(lang, 'title_overview')}</div>
              <div className="title-overview">{item.synopsis ?? t(lang, 'title_no_synopsis')}</div>
            </div>

            <div className="title-grid">
              <div className="title-panel">
                <div className="title-panel-title">{t(lang, 'title_directors')}</div>
                <div className="title-people">
                  {directors.map((d) => (
                    <div key={d.directorId} className="title-person">
                      <Link to={`/director/${d.directorId}`} className="title-person-name">
                        {d.director?.name ?? `#${d.directorId}`}
                      </Link>
                      <div className="title-person-sub">{t(lang, 'role_director')}</div>
                    </div>
                  ))}
                  {directors.length === 0 && <div className="muted">{t(lang, 'title_no_directors')}</div>}
                </div>
              </div>

              <div className="title-panel">
                <div className="title-panel-title">{t(lang, 'title_top_cast')}</div>
                <div className="title-people">
                  {cast
                    .slice()
                    .sort((a, b) => (a.billingOrder ?? 9999) - (b.billingOrder ?? 9999))
                    .slice(0, 12)
                    .map((c) => (
                      <div key={c.personId} className="title-person">
                        <Link to={`/actor/${c.personId}`} className="title-person-name">
                          {c.person?.name ?? `#${c.personId}`}
                        </Link>
                        <div className="title-person-sub">
                          {c.characterName ? c.characterName : t(lang, 'title_cast_fallback')}
                        </div>
                      </div>
                    ))}
                  {cast.length === 0 && <div className="muted">{t(lang, 'title_no_cast')}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
