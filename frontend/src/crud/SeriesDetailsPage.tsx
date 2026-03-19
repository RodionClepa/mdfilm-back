import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type {
  Director,
  Episode,
  Media,
  MediaCast,
  MediaDirector,
  Person,
  Season,
} from '../types';
import { numOrUndefined, toDateInput } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function SeriesDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  const [item, setItem] = useState<Media | null>(null);
  const [directors, setDirectors] = useState<MediaDirector[]>([]);
  const [cast, setCast] = useState<MediaCast[]>([]);
  const [allDirectors, setAllDirectors] = useState<Director[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodesBySeason, setEpisodesBySeason] = useState<Record<number, Episode[]>>(
    {},
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [seasonForm, setSeasonForm] = useState({ seasonNumber: '', releaseYear: '' });
  const [episodeFormBySeason, setEpisodeFormBySeason] = useState<
    Record<number, { episodeNumber: string; durationMinutes: string; airDate: string }>
  >({});
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
      const [seriesMedia, mediaDirectors, mediaCast, ss, dirList, peopleList] =
        await Promise.all([
          endpoints.series.get(id),
          endpoints.media.directors.list(id),
          endpoints.media.cast.list(id),
          endpoints.seasons.listBySeries(id),
          endpoints.directors.list(),
          endpoints.people.list(),
        ]);
      setItem(seriesMedia);
      setDirectors(mediaDirectors);
      setCast(mediaCast);
      setSeasons(ss);
      setAllDirectors(dirList);
      setAllPeople(peopleList);
      const map: Record<number, Episode[]> = {};
      for (const season of ss) {
        // eslint-disable-next-line no-await-in-loop
        map[season.id] = await endpoints.episodes.listBySeason(season.id);
      }
      setEpisodesBySeason(map);
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

  async function addSeason() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await endpoints.seasons.createForSeries(id, {
        seasonNumber: numOrUndefined(seasonForm.seasonNumber),
        releaseYear: numOrUndefined(seasonForm.releaseYear),
      });
      setSeasonForm({ seasonNumber: '', releaseYear: '' });
      setSuccess('Season created.');
      await load();
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

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

  async function deleteSeason(seasonId: number) {
    if (!confirm(`Delete season #${seasonId}?`)) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await endpoints.seasons.delete(seasonId);
      setSuccess('Season deleted.');
      await load();
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  async function addEpisode(seasonId: number) {
    const f = episodeFormBySeason[seasonId] ?? {
      episodeNumber: '',
      durationMinutes: '',
      airDate: '',
    };
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await endpoints.episodes.createForSeason(seasonId, {
        episodeNumber: numOrUndefined(f.episodeNumber),
        durationMinutes: numOrUndefined(f.durationMinutes),
        airDate: f.airDate || undefined,
      });
      setEpisodeFormBySeason((m) => ({
        ...m,
        [seasonId]: { episodeNumber: '', durationMinutes: '', airDate: '' },
      }));
      setSuccess('Episode created.');
      await load();
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  async function deleteEpisode(episodeId: number) {
    if (!confirm(`Delete episode #${episodeId}?`)) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await endpoints.episodes.delete(episodeId);
      setSuccess('Episode deleted.');
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
        <h2>Series details</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/series">
            <button>Back</button>
          </Link>
          <Link to={`/crud/edit/series/${id}`}>
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
                <th>Title</th>
                <td>{item.title}</td>
              </tr>
              <tr>
                <th>First air date</th>
                <td>{toDateInput(item.seriesInfo?.firstAirDate)}</td>
              </tr>
              <tr>
                <th>Total seasons</th>
                <td>{item.seriesInfo?.totalSeasons ?? '-'}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>{item.seriesInfo?.status ?? '-'}</td>
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

          <div className="panel" style={{ marginBottom: 12 }}>
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

          <div className="panel" style={{ marginBottom: 12 }}>
            <h2>Add season</h2>
            <div className="row">
              <div className="muted">seasonNumber</div>
              <input
                value={seasonForm.seasonNumber}
                onChange={(e) => setSeasonForm((f) => ({ ...f, seasonNumber: e.target.value }))}
              />
            </div>
            <div className="row">
              <div className="muted">releaseYear</div>
              <input
                value={seasonForm.releaseYear}
                onChange={(e) => setSeasonForm((f) => ({ ...f, releaseYear: e.target.value }))}
              />
            </div>
            <div className="actions">
              <button onClick={() => void addSeason()} disabled={loading}>
                Add season
              </button>
            </div>
          </div>

          {seasons.map((season) => {
            const eps = episodesBySeason[season.id] ?? [];
            const ef = episodeFormBySeason[season.id] ?? {
              episodeNumber: '',
              durationMinutes: '',
              airDate: '',
            };

            return (
              <div key={season.id} className="panel" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      Season {season.seasonNumber}{' '}
                      <span className="muted">(#{season.id})</span>
                    </div>
                    <div className="muted">releaseYear: {season.releaseYear}</div>
                  </div>
                  <div className="actions" style={{ marginTop: 0 }}>
                    <button onClick={() => void deleteSeason(season.id)} disabled={loading}>
                      Delete season
                    </button>
                  </div>
                </div>

                <div className="panel" style={{ marginTop: 10 }}>
                  <h2>Add episode</h2>
                  <div className="row">
                    <div className="muted">episodeNumber</div>
                    <input
                      value={ef.episodeNumber}
                      onChange={(e) =>
                        setEpisodeFormBySeason((m) => ({
                          ...m,
                          [season.id]: { ...ef, episodeNumber: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="row">
                    <div className="muted">durationMinutes</div>
                    <input
                      value={ef.durationMinutes}
                      onChange={(e) =>
                        setEpisodeFormBySeason((m) => ({
                          ...m,
                          [season.id]: { ...ef, durationMinutes: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="row">
                    <div className="muted">airDate</div>
                    <input
                      type="date"
                      value={ef.airDate}
                      onChange={(e) =>
                        setEpisodeFormBySeason((m) => ({
                          ...m,
                          [season.id]: { ...ef, airDate: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="actions">
                    <button onClick={() => void addEpisode(season.id)} disabled={loading}>
                      Add episode
                    </button>
                  </div>
                </div>

                <table className="table" style={{ marginTop: 10 }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>#</th>
                      <th>Duration</th>
                      <th>Air date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eps.map((ep) => (
                      <tr key={ep.id}>
                        <td>{ep.id}</td>
                        <td>{ep.episodeNumber}</td>
                        <td>{ep.durationMinutes ?? '-'}</td>
                        <td>{toDateInput(ep.airDate)}</td>
                        <td>
                          <button onClick={() => void deleteEpisode(ep.id)} disabled={loading}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {eps.length === 0 && (
                      <tr>
                        <td colSpan={5} className="muted">
                          No episodes yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })}

          {seasons.length === 0 && <div className="muted">No seasons yet.</div>}
        </>
      )}
    </div>
  );
}

