import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Person } from '../types';
import '../App.css';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function PeoplePagePublic() {
  const [items, setItems] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await endpoints.people.list();
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
          <div className="public-page-title">People</div>
          <div className="public-page-sub">Actors and other people in your database.</div>
        </div>
        <button className="public-icon-btn" onClick={() => void load()} disabled={loading} type="button">
          Refresh
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Loading…</div>}

      <div className="public-grid">
        {items.map((p) => (
          <Link key={p.id} to={`/actor/${p.id}`} className="public-grid-item">
            <div className="public-grid-title">{p.name}</div>
            <div className="muted">Actor</div>
          </Link>
        ))}
        {!loading && items.length === 0 ? <div className="muted">No people yet.</div> : null}
      </div>
    </div>
  );
}
