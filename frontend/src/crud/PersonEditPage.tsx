import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { api } from '../api';
import { endpoints } from '../endpoints';
import type { Gender, Person } from '../types';
import { TranslationTabs } from './TranslationTabs';
import { buildTranslationsPayload } from './utils';

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

  const [i18nEnabled, setI18nEnabled] = useState({ ro: false, ru: false });
  const [i18nRo, setI18nRo] = useState({ name: '', biography: '' });
  const [i18nRu, setI18nRu] = useState({ name: '', biography: '' });

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [pEn, pRo, pRu] = await Promise.all([
        endpoints.people.get(id),
        api<Person>(`/api/people/${id}?lang=ro`),
        api<Person>(`/api/people/${id}?lang=ru`),
      ]);
      const p = pEn;
      setName(p.name ?? '');
      setEarnings(p.earnings != null ? String(p.earnings) : '');
      setBiography(p.biography ?? '');
      setBirthDate(p.birthDate ? String(p.birthDate).slice(0, 10) : '');
      setGender((p.gender as Gender) ?? 'UNSPECIFIED');
      setImageUrl(p.imageUrl ?? '');
      setPlaceOfBirth(p.placeOfBirth ?? '');

      const roName = pRo?.name ?? '';
      const roBio = pRo?.biography ?? '';
      const ruName = pRu?.name ?? '';
      const ruBio = pRu?.biography ?? '';
      setI18nRo({ name: roName, biography: roBio });
      setI18nRu({ name: ruName, biography: ruBio });
      setI18nEnabled({ ro: Boolean(roName.trim()), ru: Boolean(ruName.trim()) });
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
      if (i18nEnabled.ro && !i18nRo.name.trim()) {
        setError('RO translation name is required when RO is enabled');
        return;
      }
      if (i18nEnabled.ru && !i18nRu.name.trim()) {
        setError('RU translation name is required when RU is enabled');
        return;
      }

      const payload: any = {
        name,
        earnings,
        biography,
        birthDate,
        gender,
        imageUrl,
        placeOfBirth,
      };
      const translations = buildTranslationsPayload(i18nEnabled, { ro: i18nRo, ru: i18nRu });
      if (translations) payload.translations = translations;

      await endpoints.people.update(id, payload);
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

      <TranslationTabs
        title="Translations"
        fields={[
          { key: 'name', label: 'name' },
          { key: 'biography', label: 'biography', multiline: true },
        ]}
        requiredKeys={['name']}
        en={{ name, biography }}
        ro={i18nRo}
        ru={i18nRu}
        enabled={i18nEnabled}
        onChangeEn={(next) => {
          setName(String(next.name ?? ''));
          setBiography(String(next.biography ?? ''));
        }}
        onChangeRo={(next) =>
          setI18nRo({ name: String(next.name ?? ''), biography: String(next.biography ?? '') })
        }
        onChangeRu={(next) =>
          setI18nRu({ name: String(next.name ?? ''), biography: String(next.biography ?? '') })
        }
        onChangeEnabled={setI18nEnabled}
      />

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

      <div className="actions">
        <button onClick={() => void save()} disabled={loading}>
          Save
        </button>
      </div>
    </div>
  );
}
