import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api';
import { publicEndpoints } from '../publicEndpoints';
import type { Media } from '../types';
import '../App.css';
import { useBookmarks } from '../bookmarks/useBookmarks';
import { BookmarkStar } from '../bookmarks/BookmarkStar';
import { usePublicLang } from '../publicLang';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

function PosterCard({ m, bookmarked, onToggle }: { m: Media; bookmarked: boolean; onToggle: (id: number) => void }) {
  const [posterOk, setPosterOk] = useState(true);
  return (
    <Link to={`/title/${m.id}`} className="homepage-card-link">
      <div className="homepage-card">
        <div className="homepage-poster">
          <BookmarkStar mediaId={m.id} active={bookmarked} onToggle={onToggle} />
          {m.posterImage && posterOk ? (
            <img src={m.posterImage} alt={m.title} onError={() => setPosterOk(false)} />
          ) : (
            <div className="homepage-poster-placeholder">No poster</div>
          )}
          <div className="homepage-poster-overlay">
            <div className="homepage-badges">
              <span className="homepage-badge">{m.type?.name ?? '—'}</span>
              <span className="homepage-badge subtle">{new Date(m.releaseDate).toISOString().slice(0, 10)}</span>
            </div>
            <div className="homepage-title" title={m.title}>
              {m.title}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MoviesPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lang } = usePublicLang();

  const [sp, setSp] = useSearchParams();

  const dateFrom = sp.get('dateFrom') ?? '';
  const dateTo = sp.get('dateTo') ?? '';
  const sort = sp.get('sort') ?? 'latest';
  const page = Math.max(1, Number(sp.get('page') ?? '1') || 1);
  const pageSize = Math.max(1, Math.min(100, Number(sp.get('pageSize') ?? '24') || 24));

  const bookmarks = useBookmarks(items.map((m) => m.id));

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(sp);
    if (!value) next.delete(key);
    else next.set(key, value);
    next.set('page', '1');
    setSp(next, { replace: true });
  }

  function updatePage(nextPage: number) {
    const next = new URLSearchParams(sp);
    next.set('page', String(Math.max(1, nextPage)));
    setSp(next, { replace: true });
  }

  function resetFilters() {
    const next = new URLSearchParams();
    next.set('page', '1');
    next.set('pageSize', String(pageSize));
    setSp(next, { replace: true });
  }

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await publicEndpoints.movies.browse(lang, {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sort: sort || undefined,
        page,
        pageSize,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, sp.toString()]);

  return (
    <div className="app public-list">
      <div className="public-page-head">
        <div>
          <div className="public-page-title">Movies</div>
          <div className="public-page-sub">Browse all movies in your database.</div>
        </div>
        <button className="public-icon-btn" onClick={() => void load()} disabled={loading} type="button">
          Refresh
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Loading…</div>}

      <div className="browse-layout">
        <div className="title-panel browse-sidebar">
          <div className="title-panel-title">Filters</div>

          <div className="browse-filters">
            <div className="browse-field">
              <label>Release date</label>
              <div className="browse-date-range">
                <input className="browse-control" type="date" value={dateFrom} onChange={(e) => updateParam('dateFrom', e.target.value)} />
                <input className="browse-control" type="date" value={dateTo} onChange={(e) => updateParam('dateTo', e.target.value)} />
              </div>
            </div>

            <div className="browse-field">
              <label>Sort</label>
              <select className="browse-control" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="title_asc">Title A–Z</option>
                <option value="title_desc">Title Z–A</option>
              </select>
            </div>

            <button className="public-icon-btn" type="button" onClick={resetFilters} disabled={loading}>
              Reset
            </button>
          </div>
        </div>

        <div>
          <div className="muted browse-meta">
            Showing {items.length} of {total}
          </div>

          <div className="public-grid">
            {items.map((m) => (
              <PosterCard key={m.id} m={m} bookmarked={bookmarks.isBookmarked(m.id)} onToggle={(id) => void bookmarks.toggle(id)} />
            ))}
            {!loading && items.length === 0 ? <div className="muted">No movies found.</div> : null}
          </div>

          <div className="browse-actions" style={{ marginTop: 14 }}>
            <button className="public-icon-btn" type="button" onClick={() => updatePage(page - 1)} disabled={loading || page <= 1}>
              Prev
            </button>
            <div className="muted" style={{ alignSelf: 'center' }}>
              Page {page}
            </div>
            <button
              className="public-icon-btn"
              type="button"
              onClick={() => updatePage(page + 1)}
              disabled={loading || page * pageSize >= total}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
