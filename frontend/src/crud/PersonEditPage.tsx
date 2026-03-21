import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Gender } from '../types';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function PersonEditPage() {
  const params = useParams();
  const id = Number(params.id);
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [earnings, setEarnings] = useState('');
  const [biography, setBiography] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('UNSPECIFIED');
  const [imageUrl, setImageUrl] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const p = await endpoints.people.get(id);
      setName(p.name ?? '');
      setEarnings(p.earnings != null ? String(p.earnings) : '');
      setBiography(p.biography ?? '');
      setBirthDate(p.birthDate ? String(p.birthDate).slice(0, 10) : '');
      setGender((p.gender as Gender) ?? 'UNSPECIFIED');
      setImageUrl(p.imageUrl ?? '');
      setPlaceOfBirth(p.placeOfBirth ?? '');
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setError(null);
    setLoading(true);
    try {
      await endpoints.people.update(id, {
        name,
        earnings,
        biography,
        birthDate,
        gender,
        imageUrl,
        placeOfBirth,
      });
      nav('/crud/people');
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
        <h2>Edit person</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/people">
            <button>Back</button>
          </Link>
          <button onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="row">
        <div className="muted">name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="row">
        <div className="muted">earnings</div>
        <input
          value={earnings}
          onChange={(e) => setEarnings(e.target.value)}
          inputMode="numeric"
        />
      </div>

      <div className="row">
        <div className="muted">birthDate</div>
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      </div>

      <div className="row">
        <div className="muted">gender</div>
        <select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
          <option value="UNSPECIFIED">UNSPECIFIED</option>
          <option value="MALE">MALE</option>
          <option value="FEMALE">FEMALE</option>
        </select>
      </div>

      <div className="row">
        <div className="muted">placeOfBirth</div>
        <input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} />
      </div>

      <div className="row">
        <div className="muted">imageUrl</div>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </div>

      {imageUrl.trim() !== '' && (
        <div className="row">
          <div className="muted">preview</div>
          <img
            src={imageUrl}
            alt=""
            style={{ width: 92, height: 92, borderRadius: 12, objectFit: 'cover' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="row">
        <div className="muted">biography</div>
        <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={6} />
      </div>

      <div className="actions">
        <button onClick={() => void save()} disabled={loading}>
          Save
        </button>
      </div>
    </div>
  );
}
