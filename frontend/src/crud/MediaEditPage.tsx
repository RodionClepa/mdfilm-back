import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Media } from '../types';
import { toDateInput } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function MediaEditPage() {
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
    country: '',
    posterImage: '',
  });

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const m = await endpoints.media.get(id);
      setItem(m);
      setForm({
        title: m.title ?? '',
        releaseDate: toDateInput(m.releaseDate),
        synopsis: m.synopsis ?? '',
        country: m.country ?? '',
        posterImage: m.posterImage ?? '',
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
      await endpoints.media.update(id, {
        title: form.title || undefined,
        releaseDate: form.releaseDate || undefined,
        synopsis: form.synopsis || undefined,
        country: form.country || undefined,
        posterImage: form.posterImage || undefined,
      });
      nav(`/crud/details/media/${id}`);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Edit media</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to={`/crud/details/media/${id}`}>
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
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="row">
            <div className="muted">releaseDate</div>
            <input
              type="date"
              value={form.releaseDate}
              onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
            />
          </div>
          <div className="row">
            <div className="muted">country</div>
            <input
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            />
          </div>
          <div className="row">
            <div className="muted">posterImage</div>
            <input
              value={form.posterImage}
              onChange={(e) => setForm((f) => ({ ...f, posterImage: e.target.value }))}
            />
          </div>
          <div className="row">
            <div className="muted">synopsis</div>
            <textarea
              value={form.synopsis}
              onChange={(e) => setForm((f) => ({ ...f, synopsis: e.target.value }))}
            />
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

