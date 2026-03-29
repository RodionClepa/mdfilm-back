import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { MediaTypeName } from '../types';
import { TranslationTabs } from './TranslationTabs';
import { buildTranslationsPayload, numOrUndefined } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function MediaCreatePage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [i18nEnabled, setI18nEnabled] = useState({ ro: false, ru: false });
  const [i18nRo, setI18nRo] = useState({ title: '', synopsis: '', productionNotes: '' });
  const [i18nRu, setI18nRu] = useState({ title: '', synopsis: '', productionNotes: '' });

  const [form, setForm] = useState({
    typeName: 'MEDIA' as MediaTypeName,
    title: '',
    releaseDate: '',
    synopsis: '',
    productionNotes: '',
    country: '',
    posterImage: '',
    directorId: '',
    // movie
    duration: '',
    budget: '',
    // series
    totalSeasons: '',
    status: '',
    firstAirDate: '',
    lastAirDate: '',
  });

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (!form.title.trim()) {
        setError('Title is required');
        return;
      }
      if (i18nEnabled.ro && !i18nRo.title.trim()) {
        setError("RO translation title is required when RO is enabled");
        return;
      }
      if (i18nEnabled.ru && !i18nRu.title.trim()) {
        setError("RU translation title is required when RU is enabled");
        return;
      }

      const payload: any = {
        typeName: form.typeName,
        title: form.title,
        releaseDate: form.releaseDate,
        synopsis: form.synopsis || undefined,
        productionNotes: form.productionNotes || undefined,
        country: form.country || undefined,
        posterImage: form.posterImage || undefined,
        directorId: numOrUndefined(form.directorId),
      };

      const translations = buildTranslationsPayload(i18nEnabled, { ro: i18nRo, ru: i18nRu });
      if (translations) payload.translations = translations;

      if (form.typeName === 'MOVIE') {
        payload.duration = numOrUndefined(form.duration);
        payload.budget = numOrUndefined(form.budget);
      }
      if (form.typeName === 'SERIES') {
        payload.totalSeasons = numOrUndefined(form.totalSeasons);
        payload.status = form.status || undefined;
        payload.firstAirDate = form.firstAirDate || undefined;
        payload.lastAirDate = form.lastAirDate || null;
      }

      const created = await endpoints.media.create(payload);
      nav(`/crud/details/media/${created.id}`);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Create media</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/media">
            <button>Back</button>
          </Link>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="row">
        <div className="muted">typeName</div>
        <select
          value={form.typeName}
          onChange={(e) => setForm((f) => ({ ...f, typeName: e.target.value }))}
        >
          <option value="MEDIA">MEDIA</option>
          <option value="MOVIE">MOVIE</option>
          <option value="SERIES">SERIES</option>
        </select>
      </div>

      <TranslationTabs
        title="Translations"
        fields={[
          { key: 'title', label: 'title' },
          { key: 'synopsis', label: 'synopsis', multiline: true },
          { key: 'productionNotes', label: 'productionNotes', multiline: true },
        ]}
        requiredKeys={['title']}
        en={{ title: form.title, synopsis: form.synopsis, productionNotes: form.productionNotes }}
        ro={i18nRo}
        ru={i18nRu}
        enabled={i18nEnabled}
        onChangeEn={(next) =>
          setForm((f) => ({
            ...f,
            title: String(next.title ?? ''),
            synopsis: String(next.synopsis ?? ''),
            productionNotes: String(next.productionNotes ?? ''),
          }))
        }
        onChangeRo={(next) =>
          setI18nRo({
            title: String(next.title ?? ''),
            synopsis: String(next.synopsis ?? ''),
            productionNotes: String(next.productionNotes ?? ''),
          })
        }
        onChangeRu={(next) =>
          setI18nRu({
            title: String(next.title ?? ''),
            synopsis: String(next.synopsis ?? ''),
            productionNotes: String(next.productionNotes ?? ''),
          })
        }
        onChangeEnabled={setI18nEnabled}
      />

      <div className="row">
        <div className="muted">releaseDate</div>
        <input
          type="date"
          value={form.releaseDate}
          onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
        />
      </div>

      <div className="row">
        <div className="muted">directorId</div>
        <input
          value={form.directorId}
          onChange={(e) => setForm((f) => ({ ...f, directorId: e.target.value }))}
          placeholder="optional (number)"
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

      {form.typeName === 'MOVIE' && (
        <>
          <div className="row">
            <div className="muted">duration</div>
            <input
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            />
          </div>
          <div className="row">
            <div className="muted">budget</div>
            <input
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            />
          </div>
        </>
      )}

      {form.typeName === 'SERIES' && (
        <>
          <div className="row">
            <div className="muted">totalSeasons</div>
            <input
              value={form.totalSeasons}
              onChange={(e) => setForm((f) => ({ ...f, totalSeasons: e.target.value }))}
            />
          </div>
          <div className="row">
            <div className="muted">status</div>
            <input
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            />
          </div>
          <div className="row">
            <div className="muted">firstAirDate</div>
            <input
              type="date"
              value={form.firstAirDate}
              onChange={(e) => setForm((f) => ({ ...f, firstAirDate: e.target.value }))}
            />
          </div>
          <div className="row">
            <div className="muted">lastAirDate</div>
            <input
              type="date"
              value={form.lastAirDate}
              onChange={(e) => setForm((f) => ({ ...f, lastAirDate: e.target.value }))}
            />
          </div>
        </>
      )}

      <div className="actions">
        <button onClick={() => void onSubmit()} disabled={loading}>
          Create
        </button>
      </div>
    </div>
  );
}

