import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api';
import { publicEndpoints } from '../publicEndpoints';
import type { News } from '../types';
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
    return String(d);
  }
}

export function NewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lang } = usePublicLang();

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await publicEndpoints.news.list(lang);
      setItems(data);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [lang]);

  return (
    <div className="app public-list">
      <div className="public-page-head">
        <div>
          <div className="public-page-title">News</div>
          <div className="public-page-sub">Latest announcements and updates.</div>
        </div>
        <button className="public-icon-btn" onClick={() => void load()} disabled={loading} type="button">
          Refresh
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Loading…</div>}

      <div className="public-grid">
        {items.map((n) => (
          <Link key={n.id} to={`/news/${n.slug}`} className="public-grid-item">
            <div className="public-grid-title">{n.title ?? n.slug}</div>
            <div className="muted">{fmtDate(n.createdAt)}</div>
            {n.excerpt ? <div className="muted" style={{ marginTop: 6 }}>{n.excerpt}</div> : null}
          </Link>
        ))}
        {!loading && items.length === 0 ? <div className="muted">No news yet.</div> : null}
      </div>
    </div>
  );
}
