import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { News, NewsI18n } from '../types';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

function pickEn(t: NewsI18n[] | undefined) {
  if (!t?.length) return undefined;
  return t.find((x) => x.locale === 'en') ?? t[0];
}

export function NewsListPage() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      setItems(await endpoints.news.adminList());
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function remove(id: number) {
    if (!confirm(`Delete news #${id}?`)) return;
    setError(null);
    setLoading(true);
    try {
      await endpoints.news.adminDelete(id);
      await refresh();
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => {
    return items.map((n) => {
      const en = pickEn(n.translations as any);
      return {
        ...n,
        _enTitle: en?.title ?? '',
      };
    });
  }, [items]);

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>News</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/create/news">
            <button>Create</button>
          </Link>
          <button onClick={() => void refresh()} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="muted" style={{ marginBottom: 10 }}>
        {loading ? 'Loading…' : `${items.length} item(s)`}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Slug</th>
            <th>EN Title</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((n: any) => (
            <tr key={n.id}>
              <td>{n.id}</td>
              <td>{n.slug}</td>
              <td>{n._enTitle}</td>
              <td style={{ textAlign: 'right' }}>
                <div className="actions" style={{ marginTop: 0, justifyContent: 'flex-end' }}>
                  <Link to={`/crud/edit/news/${n.id}`}>
                    <button disabled={loading}>Edit</button>
                  </Link>
                  <button onClick={() => void remove(n.id)} disabled={loading}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="muted">
                No news yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
