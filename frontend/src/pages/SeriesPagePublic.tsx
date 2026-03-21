import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Media } from '../types';
import '../App.css';
import { useBookmarks } from '../bookmarks/useBookmarks';
import { BookmarkStar } from '../bookmarks/BookmarkStar';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function SeriesPagePublic() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookmarks = useBookmarks(items.map((m) => m.id));

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await endpoints.series.list();
      setItems(data);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="app public-list">
      <div className="public-page-head">
        <div>
          <div className="public-page-title">Series</div>
          <div className="public-page-sub">Browse all series in your database.</div>
        </div>
        <button className="public-icon-btn" onClick={() => void load()} disabled={loading} type="button">
          Refresh
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Loading…</div>}

      <div className="public-grid">
        {items.map((m) => (
          <Link key={m.id} to={`/title/${m.id}`} className="public-grid-item">
            <BookmarkStar mediaId={m.id} active={bookmarks.isBookmarked(m.id)} onToggle={(id) => void bookmarks.toggle(id)} />
            <div className="public-grid-title">{m.title}</div>
            <div className="muted">{new Date(m.releaseDate).toISOString().slice(0, 10)}</div>
          </Link>
        ))}
        {!loading && items.length === 0 ? <div className="muted">No series yet.</div> : null}
      </div>
    </div>
  );
}
