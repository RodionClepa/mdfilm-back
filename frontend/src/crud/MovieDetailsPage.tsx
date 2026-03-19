import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Media } from '../types';
import { toDateInput } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function MovieDetailsPage() {
  const params = useParams();
  const id = Number(params.id);
  const [item, setItem] = useState<Media | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      setItem(await endpoints.movies.get(id));
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

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Movie details</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/movies">
            <button>Back</button>
          </Link>
          <Link to={`/crud/edit/movie/${id}`}>
            <button>Edit</button>
          </Link>
          <button onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {!item && !error && <div className="muted">{loading ? 'Loading…' : 'Not found.'}</div>}

      {item && (
        <table className="table">
          <tbody>
            <tr>
              <th>ID</th>
              <td>{item.id}</td>
            </tr>
            <tr>
              <th>Title</th>
              <td>{item.title}</td>
            </tr>
            <tr>
              <th>Release</th>
              <td>{toDateInput(item.releaseDate)}</td>
            </tr>
            <tr>
              <th>Duration</th>
              <td>{item.movieInfo?.duration ?? '-'}</td>
            </tr>
            <tr>
              <th>Budget</th>
              <td>{item.movieInfo?.budget ?? '-'}</td>
            </tr>
            <tr>
              <th>Synopsis</th>
              <td>{item.synopsis ?? '-'}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

