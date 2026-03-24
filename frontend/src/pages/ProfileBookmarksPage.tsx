import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import { publicEndpoints } from '../publicEndpoints';
import type { Bookmark } from '../types';
import '../App.css';
import { BookmarkStar } from '../bookmarks/BookmarkStar';
import { usePublicLang } from '../publicLang';
import { t, tMediaType } from '../publicI18n';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

type Sort = 'createdAt_desc' | 'createdAt_asc' | 'title_asc' | 'title_desc';

function BookmarkCard({ b, bookmarked, onToggle, lang }: { b: Bookmark; bookmarked: boolean; onToggle: (id: number) => void; lang: any }) {
  const [posterOk, setPosterOk] = useState(true);
  const m = b.media;
  return (
    <Link key={b.id} to={`/title/${b.mediaId}`} className="profile-card-link">
      <div className="profile-card">
        <div className="profile-poster">
          <BookmarkStar mediaId={b.mediaId} active={bookmarked} onToggle={onToggle} />
          {m?.posterImage && posterOk ? (
            <img src={m.posterImage} alt={m.title} onError={() => setPosterOk(false)} />
          ) : (
            <div className="profile-poster-placeholder">{t(lang, 'poster_fallback')}</div>
          )}
        </div>
        <div className="profile-card-meta">
          <div className="profile-card-title">{m?.title ?? `#${b.mediaId}`}</div>
          <div className="profile-card-sub">{tMediaType(lang, m?.type?.name)}</div>
        </div>
      </div>
    </Link>
  );
}

export function ProfileBookmarksPage() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();

  const { lang } = usePublicLang();

  const typeParam = sp.get('type') || '';
  const qParam = sp.get('q') || '';
  const sortParam = (sp.get('sort') || 'createdAt_desc') as Sort;

  const type = typeParam === 'MOVIE' || typeParam === 'SERIES' ? typeParam : '';
  const q = qParam;
  const sort: Sort =
    sortParam === 'createdAt_asc' || sortParam === 'title_asc' || sortParam === 'title_desc' || sortParam === 'createdAt_desc'
      ? sortParam
      : 'createdAt_desc';

  const [items, setItems] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaIds = useMemo(() => items.map((b) => b.mediaId), [items]);
  const bookmarkedSet = useMemo(() => new Set(mediaIds), [mediaIds]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const rows = await publicEndpoints.bookmarks.list(lang, {
        type: type ? (type as 'MOVIE' | 'SERIES') : undefined,
        q: q.trim() ? q.trim() : undefined,
        sort,
      });
      setItems(rows);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        nav(`/login?next=${encodeURIComponent('/profile/bookmarks' + window.location.search)}`, { replace: true });
        return;
      }
      if (e instanceof ApiError && e.status === 403) {
        nav('/', { replace: true });
        return;
      }
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, q, sort, lang]);

  async function removeBookmark(mediaId: number) {
    setError(null);
    try {
      await endpoints.bookmarks.remove(mediaId);
      setItems((prev) => prev.filter((b) => b.mediaId !== mediaId));
    } catch (e) {
      setError(showError(e));
    }
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSp(next, { replace: true });
  }

  return (
    <div className="app public-list">
      <div className="public-page-head">
        <div>
          <div className="public-page-title">{t(lang, 'bookmarks_title')}</div>
          <div className="public-page-sub">{t(lang, 'bookmarks_sub')}</div>
        </div>
        <button className="public-icon-btn" onClick={() => void load()} disabled={loading} type="button">
          {t(lang, 'refresh')}
        </button>
      </div>

      <div className="public-panel" style={{ marginBottom: 12 }}>
        <div className="public-panel-title">{t(lang, 'filters')}</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="public-icon-btn" type="button" onClick={() => setParam('type', '')}>
              {t(lang, 'bookmarks_all')}
            </button>
            <button className="public-icon-btn" type="button" onClick={() => setParam('type', 'MOVIE')}>
              {tMediaType(lang, 'MOVIE')}
            </button>
            <button className="public-icon-btn" type="button" onClick={() => setParam('type', 'SERIES')}>
              {tMediaType(lang, 'SERIES')}
            </button>
          </div>

          <input
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder={t(lang, 'bookmarks_search_title')}
            aria-label={t(lang, 'bookmarks_search_title')}
            style={{ padding: 10, borderRadius: 12, border: '1px solid var(--borderColor)', background: 'var(--bgColorTint)', color: 'var(--textColor)' }}
          />

          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            style={{ padding: 10, borderRadius: 12, border: '1px solid var(--borderColor)', background: 'var(--bgColorTint)', color: 'var(--textColor)' }}
          >
            <option value="createdAt_desc">{t(lang, 'bookmarks_newest')}</option>
            <option value="createdAt_asc">{t(lang, 'bookmarks_oldest')}</option>
            <option value="title_asc">{t(lang, 'sort_title_asc')}</option>
            <option value="title_desc">{t(lang, 'sort_title_desc')}</option>
          </select>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">{t(lang, 'loading')}</div>}

      <div className="public-grid">
        {items.map((b) => (
          <BookmarkCard b={b} bookmarked={bookmarkedSet.has(b.mediaId)} onToggle={(id) => void removeBookmark(id)} lang={lang} />
        ))}
        {!loading && items.length === 0 ? <div className="muted">{t(lang, 'bookmarks_empty')}</div> : null}
      </div>
    </div>
  );
}
