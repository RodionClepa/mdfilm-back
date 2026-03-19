import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Media } from '../types';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function SeriesListPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      setItems(await endpoints.series.list());
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onDelete(id: number) {
    if (!confirm(`Delete series #${id}?`)) return;
    setError(null);
    setLoading(true);
    try {
      await endpoints.series.delete(id);
      await refresh();
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Series</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/create/series">
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
            <th>Title</th>
            <th>Total seasons</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.title}</td>
              <td>{s.seriesInfo?.totalSeasons ?? '-'}</td>
              <td>
                <Link to={`/crud/details/series/${s.id}`}>
                  <button>Additional information</button>
                </Link>{' '}
                <Link to={`/crud/edit/series/${s.id}`}>
                  <button>Edit</button>
                </Link>{' '}
                <button onClick={() => void onDelete(s.id)} disabled={loading}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="muted">
                No series yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

