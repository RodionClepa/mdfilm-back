import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api';
import { publicEndpoints } from '../publicEndpoints';
import type { Media, Person } from '../types';
import '../App.css';
import { useBookmarks } from '../bookmarks/useBookmarks';
import { BookmarkStar } from '../bookmarks/BookmarkStar';
import { usePublicLang } from '../publicLang';
import { t } from '../publicI18n';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

function includesQ(hay: string, q: string) {
  return hay.toLowerCase().includes(q.toLowerCase());
}

export function SearchPage() {
  const [sp] = useSearchParams();
  const q = (sp.get('q') || '').trim();

  const [media, setMedia] = useState<Media[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mediaImgOk, setMediaImgOk] = useState<Record<number, boolean>>({});
  const [peopleImgOk, setPeopleImgOk] = useState<Record<number, boolean>>({});

  const { lang } = usePublicLang();

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [m, p] = await Promise.all([publicEndpoints.media.list(lang), publicEndpoints.people.list(lang)]);
      setMedia(m);
      setPeople(p);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [lang]);

  const results = useMemo(() => {
    if (!q) return { media: [], people: [] };
    return {
      media: media.filter((m) => includesQ(m.title || '', q)).slice(0, 30),
      people: people.filter((p) => includesQ(p.name || '', q)).slice(0, 30),
    };
  }, [q, media, people]);

  const mediaResultIds = useMemo(() => results.media.map((m) => m.id), [results.media]);
  const bookmarks = useBookmarks(mediaResultIds);

  return (
    <div className="app public-list">
      <div className="public-page-head">
        <div>
          <div className="public-page-title">Search</div>
          <div className="public-page-sub">{q ? `Results for “${q}”` : 'Type in the search box above.'}</div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Loading…</div>}

      {q ? (
        <div className="public-search-results">
          <div className="public-panel">
            <div className="public-panel-title">Titles</div>
            {results.media.map((m) => (
              <Link key={m.id} to={`/title/${m.id}`} className="public-list-link">
                <BookmarkStar
                  mediaId={m.id}
                  active={bookmarks.isBookmarked(m.id)}
                  onToggle={(id) => void bookmarks.toggle(id)}
                />
                <div className="public-search-row">
                  <div className="public-search-thumb">
                    {m.posterImage && mediaImgOk[m.id] !== false ? (
                      <img src={m.posterImage} alt={m.title} onError={() => setMediaImgOk((prev) => ({ ...prev, [m.id]: false }))} />
                    ) : (
                      <div className="public-search-thumb-placeholder">{t(lang, 'poster_fallback')}</div>
                    )}
                  </div>
                  <div className="public-search-meta">{m.title}</div>
                </div>
              </Link>
            ))}
            {!loading && results.media.length === 0 ? <div className="muted">No titles found.</div> : null}
          </div>

          <div className="public-panel">
            <div className="public-panel-title">People</div>
            {results.people.map((p) => (
              <Link key={p.id} to={`/actor/${p.id}`} className="public-list-link">
                <div className="public-search-row">
                  <div className="public-search-thumb square">
                    {p.imageUrl && peopleImgOk[p.id] !== false ? (
                      <img src={p.imageUrl} alt={p.name} onError={() => setPeopleImgOk((prev) => ({ ...prev, [p.id]: false }))} />
                    ) : (
                      <div className="public-search-thumb-placeholder">{t(lang, 'profile_no_image')}</div>
                    )}
                  </div>
                  <div className="public-search-meta">{p.name}</div>
                </div>
              </Link>
            ))}
            {!loading && results.people.length === 0 ? <div className="muted">No people found.</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
