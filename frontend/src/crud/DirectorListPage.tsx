import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Director } from '../types';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function DirectorListPage() {
  const [items, setItems] = useState<Director[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      setItems(await endpoints.directors.list());
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Directors</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/create/director">
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
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.name}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={2} className="muted">
                No directors yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

