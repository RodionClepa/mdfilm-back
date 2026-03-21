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

export function SeriesCreatePage() {
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
    totalSeasons: '1',
    status: '',
    firstAirDate: '',
    lastAirDate: '',
  });

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const created = await endpoints.series.create({
        title: form.title,
        releaseDate: form.releaseDate,
        synopsis: form.synopsis || undefined,
        country: form.country || undefined,
        posterImage: form.posterImage || undefined,
        directorId: numOrUndefined(form.directorId),
        totalSeasons: numOrUndefined(form.totalSeasons),
        status: form.status || undefined,
        firstAirDate: form.firstAirDate || undefined,
        lastAirDate: form.lastAirDate || null,
      });
      nav(`/crud/details/series/${created.id}`);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Create series</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/series">
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
        <div className="muted">country</div>
        <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="optional" />
      </div>
      <div className="row">
        <div className="muted">posterImage</div>
        <input value={form.posterImage} onChange={(e) => setForm((f) => ({ ...f, posterImage: e.target.value }))} placeholder="optional url" />
      </div>
      <div className="row">
        <div className="muted">firstAirDate</div>
        <input type="date" value={form.firstAirDate} onChange={(e) => setForm((f) => ({ ...f, firstAirDate: e.target.value }))} />
      </div>
      <div className="row">
        <div className="muted">lastAirDate</div>
        <input type="date" value={form.lastAirDate} onChange={(e) => setForm((f) => ({ ...f, lastAirDate: e.target.value }))} placeholder="optional" />
      </div>
      <div className="row">
        <div className="muted">totalSeasons</div>
        <input value={form.totalSeasons} onChange={(e) => setForm((f) => ({ ...f, totalSeasons: e.target.value }))} />
      </div>
      <div className="row">
        <div className="muted">status</div>
        <input value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} placeholder="optional" />
      </div>
      <div className="row">
        <div className="muted">directorId</div>
        <input value={form.directorId} onChange={(e) => setForm((f) => ({ ...f, directorId: e.target.value }))} placeholder="optional (number)" />
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

