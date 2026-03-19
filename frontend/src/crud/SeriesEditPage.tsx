import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Media } from '../types';
import { numOrUndefined, toDateInput } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function SeriesEditPage() {
  const params = useParams();
  const id = Number(params.id);
  const nav = useNavigate();

  const [item, setItem] = useState<Media | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    releaseDate: '',
    synopsis: '',
    totalSeasons: '',
    status: '',
    firstAirDate: '',
    lastAirDate: '',
  });

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const s = await endpoints.series.get(id);
      setItem(s);
      setForm({
        title: s.title ?? '',
        releaseDate: toDateInput(s.releaseDate),
        synopsis: s.synopsis ?? '',
        totalSeasons: s.seriesInfo?.totalSeasons != null ? String(s.seriesInfo.totalSeasons) : '',
        status: s.seriesInfo?.status ?? '',
        firstAirDate: toDateInput(s.seriesInfo?.firstAirDate),
        lastAirDate: toDateInput(s.seriesInfo?.lastAirDate),
      });
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isFinite(id)) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSave() {
    setError(null);
    setLoading(true);
    try {
      await endpoints.series.update(id, {
        title: form.title || undefined,
        synopsis: form.synopsis || undefined,
        totalSeasons: numOrUndefined(form.totalSeasons),
        status: form.status || undefined,
        firstAirDate: form.firstAirDate || undefined,
        lastAirDate: form.lastAirDate || null,
      });
      nav(`/crud/details/series/${id}`);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Edit series</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to={`/crud/details/series/${id}`}>
            <button>Back</button>
          </Link>
          <button onClick={() => void load()} disabled={loading}>
            Reload
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {!item && !error && <div className="muted">{loading ? 'Loading…' : 'Not found.'}</div>}

      {item && (
        <>
          <div className="row">
            <div className="muted">title</div>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="row">
            <div className="muted">releaseDate</div>
            <input type="date" value={form.releaseDate} disabled />
          </div>
          <div className="row">
            <div className="muted">firstAirDate</div>
            <input type="date" value={form.firstAirDate} onChange={(e) => setForm((f) => ({ ...f, firstAirDate: e.target.value }))} />
          </div>
          <div className="row">
            <div className="muted">lastAirDate</div>
            <input type="date" value={form.lastAirDate} onChange={(e) => setForm((f) => ({ ...f, lastAirDate: e.target.value }))} />
          </div>
          <div className="row">
            <div className="muted">totalSeasons</div>
            <input value={form.totalSeasons} onChange={(e) => setForm((f) => ({ ...f, totalSeasons: e.target.value }))} />
          </div>
          <div className="row">
            <div className="muted">status</div>
            <input value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
          </div>
          <div className="row">
            <div className="muted">synopsis</div>
            <textarea value={form.synopsis} onChange={(e) => setForm((f) => ({ ...f, synopsis: e.target.value }))} />
          </div>

          <div className="actions">
            <button onClick={() => void onSave()} disabled={loading}>
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
}

