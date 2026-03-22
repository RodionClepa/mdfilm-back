import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { publicEndpoints } from '../publicEndpoints';
import type { Media, MediaCast, MediaDirector } from '../types';
import '../App.css';
import { usePublicLang } from '../publicLang';

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

  return (
    <div className="app title-details">
      <div className="title-hero">
        <div className="title-hero-top">
          <div>
            <div className="title-kicker">{type}</div>
            <div className="title-title">{title}</div>
            <div className="title-subtitle">
              {fmtDate(item?.releaseDate)}
              {item?.country ? ` • ${item.country}` : ''}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {!item && !error && <div className="muted">{loading ? 'Loading…' : 'Not found.'}</div>}

      {item && (
        <div className="title-layout">
          <div className="title-poster-col">
            <div className="title-poster">
              {item.posterImage ? (
                <img src={item.posterImage} alt={item.title} />
              ) : (
                <div className="title-poster-placeholder">No poster</div>
              )}
            </div>

            <div className="title-meta">
              <div className="title-chip">Release: {fmtDate(item.releaseDate)}</div>
              <div className="title-chip">Type: {type}</div>
              {item.movieInfo?.duration ? (
                <div className="title-chip">Duration: {item.movieInfo.duration} min</div>
              ) : null}
              {item.seriesInfo?.totalSeasons ? (
                <div className="title-chip">Seasons: {item.seriesInfo.totalSeasons}</div>
              ) : null}
              {item.seriesInfo?.status ? (
                <div className="title-chip">Status: {item.seriesInfo.status}</div>
              ) : null}
            </div>
          </div>

          <div className="title-main">
            <div className="title-panel">
              <div className="title-panel-title">Overview</div>
              <div className="title-overview">{item.synopsis ?? 'No synopsis yet.'}</div>
            </div>

            <div className="title-grid">
              <div className="title-panel">
                <div className="title-panel-title">Directors</div>
                <div className="title-people">
                  {directors.map((d) => (
                    <div key={d.directorId} className="title-person">
                      <Link to={`/director/${d.directorId}`} className="title-person-name">
                        {d.director?.name ?? `#${d.directorId}`}
                      </Link>
                      <div className="title-person-sub">Director</div>
                    </div>
                  ))}
                  {directors.length === 0 && <div className="muted">No directors attached.</div>}
                </div>
              </div>

              <div className="title-panel">
                <div className="title-panel-title">Top cast</div>
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
                          {c.characterName ? c.characterName : 'Cast'}
                        </div>
                      </div>
                    ))}
                  {cast.length === 0 && <div className="muted">No cast attached.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
