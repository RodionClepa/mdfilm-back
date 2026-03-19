import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import { numOrUndefined } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function MovieCreatePage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    releaseDate: '',
    synopsis: '',
    country: '',
    posterImage: '',
    directorId: '',
    duration: '',
    budget: '',
  });

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const created = await endpoints.movies.create({
        title: form.title,
        releaseDate: form.releaseDate,
        synopsis: form.synopsis || undefined,
        country: form.country || undefined,
        posterImage: form.posterImage || undefined,
        directorId: numOrUndefined(form.directorId),
        duration: numOrUndefined(form.duration),
        budget: numOrUndefined(form.budget),
      });
      nav(`/crud/details/movie/${created.id}`);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Create movie</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/movies">
            <button>Back</button>
          </Link>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="row">
        <div className="muted">title</div>
        <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="row">
        <div className="muted">releaseDate</div>
        <input type="date" value={form.releaseDate} onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))} />
      </div>
      <div className="row">
        <div className="muted">directorId</div>
        <input value={form.directorId} onChange={(e) => setForm((f) => ({ ...f, directorId: e.target.value }))} placeholder="optional (number)" />
      </div>
      <div className="row">
        <div className="muted">duration</div>
        <input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="minutes" />
      </div>
      <div className="row">
        <div className="muted">budget</div>
        <input value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} placeholder="optional" />
      </div>
      <div className="row">
        <div className="muted">synopsis</div>
        <textarea value={form.synopsis} onChange={(e) => setForm((f) => ({ ...f, synopsis: e.target.value }))} />
      </div>

      <div className="actions">
        <button onClick={() => void onSubmit()} disabled={loading}>
          Create
        </button>
      </div>
    </div>
  );
}

