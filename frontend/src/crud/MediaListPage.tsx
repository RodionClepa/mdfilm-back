import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Media } from '../types';
import { toDateInput } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function MediaListPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      setItems(await endpoints.media.list());
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
    if (!confirm(`Delete media #${id}?`)) return;
    setError(null);
    setLoading(true);
    try {
      await endpoints.media.delete(id);
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
        <h2>All media</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/create/media">
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
            <th>Type</th>
            <th>Title</th>
            <th>Release</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.type?.name ?? m.typeId}</td>
              <td>{m.title}</td>
              <td>{toDateInput(m.releaseDate)}</td>
              <td>
                <Link to={`/crud/details/media/${m.id}`}>
                  <button>Additional information</button>
                </Link>{' '}
                <Link to={`/crud/edit/media/${m.id}`}>
                  <button>Edit</button>
                </Link>{' '}
                <button onClick={() => void onDelete(m.id)} disabled={loading}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                No media yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

