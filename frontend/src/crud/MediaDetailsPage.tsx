import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Media, MediaCast, MediaDirector, Director, Person } from '../types';
import { toDateInput } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function MediaDetailsPage() {
  const params = useParams();
  const id = Number(params.id);
  const [item, setItem] = useState<Media | null>(null);
  const [directors, setDirectors] = useState<MediaDirector[]>([]);
  const [cast, setCast] = useState<MediaCast[]>([]);
  const [allDirectors, setAllDirectors] = useState<Director[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [directorId, setDirectorId] = useState('');
  const [castForm, setCastForm] = useState({
    personId: '',
    characterName: '',
    billingOrder: '',
  });

  async function load() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const [media, mediaDirectors, mediaCast, dirList, peopleList] =
        await Promise.all([
          endpoints.media.get(id),
          endpoints.media.directors.list(id),
          endpoints.media.cast.list(id),
          endpoints.directors.list(),
          endpoints.people.list(),
        ]);
      setItem(media);
      setDirectors(mediaDirectors);
      setCast(mediaCast);
      setAllDirectors(dirList);
      setAllPeople(peopleList);
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

  async function addDirector() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await endpoints.media.directors.add(id, [Number(directorId)]);
      setDirectorId('');
      setSuccess('Director attached.');
      await load();
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  async function removeDirector(did: number) {
    if (!confirm(`Remove director #${did}?`)) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await endpoints.media.directors.remove(id, did);
      setSuccess('Director removed.');
      await load();
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  async function addCast() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await endpoints.media.cast.add(id, {
        personId: Number(castForm.personId),
        characterName: castForm.characterName || undefined,
        billingOrder: castForm.billingOrder ? Number(castForm.billingOrder) : undefined,
      });
      setCastForm({ personId: '', characterName: '', billingOrder: '' });
      setSuccess('Cast member attached.');
      await load();
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  async function removeCastMember(pid: number) {
    if (!confirm(`Remove person #${pid} from cast?`)) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await endpoints.media.cast.remove(id, pid);
      setSuccess('Cast member removed.');
      await load();
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Media details</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/media">
            <button>Back</button>
          </Link>
          <Link to={`/crud/edit/media/${id}`}>
            <button>Edit</button>
          </Link>
          <button onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {!item && !error && <div className="muted">{loading ? 'Loading…' : 'Not found.'}</div>}

      {item && (
        <>
          <table className="table" style={{ marginBottom: 12 }}>
            <tbody>
              <tr>
                <th>ID</th>
                <td>{item.id}</td>
              </tr>
              <tr>
                <th>Type</th>
                <td>{item.type?.name ?? item.typeId}</td>
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
                <th>Country</th>
                <td>{item.country ?? '-'}</td>
              </tr>
              <tr>
                <th>Synopsis</th>
                <td>{item.synopsis ?? '-'}</td>
              </tr>
              <tr>
                <th>MovieInfo</th>
                <td>
                  {item.movieInfo
                    ? `duration=${item.movieInfo.duration}, budget=${item.movieInfo.budget ?? '-'}`
                    : '-'}
                </td>
              </tr>
              <tr>
                <th>SeriesInfo</th>
                <td>
                  {item.seriesInfo
                    ? `totalSeasons=${item.seriesInfo.totalSeasons}, status=${item.seriesInfo.status ?? '-'}`
                    : '-'}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="panel" style={{ marginBottom: 12 }}>
            <h2>Directors</h2>
            <div className="muted" style={{ marginBottom: 8 }}>
              Create directors in <code>/crud/directors</code> then attach them here.
            </div>
            <div className="row">
              <div className="muted">director</div>
              <select
                value={directorId}
                onChange={(e) => setDirectorId(e.target.value)}
              >
                <option value="">(select director)</option>
                {allDirectors.map((d) => (
                  <option key={d.id} value={d.id}>
                    #{d.id} {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="actions">
              <button onClick={() => void addDirector()} disabled={loading}>
                Attach director
              </button>
            </div>

            <table className="table" style={{ marginTop: 10 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {directors.map((d) => (
                  <tr key={d.directorId}>
                    <td>{d.directorId}</td>
                    <td>{d.director?.name ?? '-'}</td>
                    <td>
                      <button onClick={() => void removeDirector(d.directorId)} disabled={loading}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {directors.length === 0 && (
                  <tr>
                    <td colSpan={3} className="muted">
                      No directors attached.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h2>Cast</h2>
            <div className="muted" style={{ marginBottom: 8 }}>
              Create people in <code>/crud/people</code> then attach them here.
            </div>
            <div className="row">
              <div className="muted">person</div>
              <select
                value={castForm.personId}
                onChange={(e) =>
                  setCastForm((f) => ({ ...f, personId: e.target.value }))
                }
              >
                <option value="">(select person)</option>
                {allPeople.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="row">
              <div className="muted">characterName</div>
              <input
                value={castForm.characterName}
                onChange={(e) =>
                  setCastForm((f) => ({ ...f, characterName: e.target.value }))
                }
              />
            </div>
            <div className="row">
              <div className="muted">billingOrder</div>
              <input
                value={castForm.billingOrder}
                onChange={(e) =>
                  setCastForm((f) => ({ ...f, billingOrder: e.target.value }))
                }
              />
            </div>
            <div className="actions">
              <button onClick={() => void addCast()} disabled={loading}>
                Attach cast member
              </button>
            </div>

            <table className="table" style={{ marginTop: 10 }}>
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Character</th>
                  <th>Order</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cast.map((c) => (
                  <tr key={c.personId}>
                    <td>
                      #{c.personId} {c.person?.name ?? ''}
                    </td>
                    <td>{c.characterName ?? '-'}</td>
                    <td>{c.billingOrder ?? '-'}</td>
                    <td>
                      <button onClick={() => void removeCastMember(c.personId)} disabled={loading}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {cast.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted">
                      No cast attached.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

