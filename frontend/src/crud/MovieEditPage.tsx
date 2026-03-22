import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { api } from '../api';
import { endpoints } from '../endpoints';
import type { Media } from '../types';
import { TranslationTabs } from './TranslationTabs';
import { buildTranslationsPayload, numOrUndefined, toDateInput } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function MovieEditPage() {
  const params = useParams();
  const id = Number(params.id);
  const nav = useNavigate();

  const [item, setItem] = useState<Media | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [i18nEnabled, setI18nEnabled] = useState({ ro: false, ru: false });
  const [i18nRo, setI18nRo] = useState({ title: '', synopsis: '' });
  const [i18nRu, setI18nRu] = useState({ title: '', synopsis: '' });

  const [form, setForm] = useState({
    title: '',
    releaseDate: '',
    synopsis: '',
    country: '',
    posterImage: '',
    duration: '',
    budget: '',
  });

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [mEn, mRo, mRu] = await Promise.all([
        endpoints.movies.get(id),
        api<Media>(`/api/movies/${id}?lang=ro`),
        api<Media>(`/api/movies/${id}?lang=ru`),
      ]);
      const m = mEn;
      setItem(m);
      setForm({
        title: m.title ?? '',
        releaseDate: toDateInput(m.releaseDate),
        synopsis: m.synopsis ?? '',
        country: m.country ?? '',
        posterImage: m.posterImage ?? '',
        duration: m.movieInfo?.duration != null ? String(m.movieInfo.duration) : '',
        budget: m.movieInfo?.budget != null ? String(m.movieInfo.budget) : '',
      });

      const roTitle = mRo?.title ?? '';
      const roSynopsis = mRo?.synopsis ?? '';
      const ruTitle = mRu?.title ?? '';
      const ruSynopsis = mRu?.synopsis ?? '';
      setI18nRo({ title: roTitle, synopsis: roSynopsis });
      setI18nRu({ title: ruTitle, synopsis: ruSynopsis });
      setI18nEnabled({ ro: Boolean(roTitle.trim()), ru: Boolean(ruTitle.trim()) });
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
      if (i18nEnabled.ro && !i18nRo.title.trim()) {
        setError('RO translation title is required when RO is enabled');
        return;
      }
      if (i18nEnabled.ru && !i18nRu.title.trim()) {
        setError('RU translation title is required when RU is enabled');
        return;
      }

      const payload: any = {
        title: form.title || undefined,
        synopsis: form.synopsis || undefined,
        country: form.country || undefined,
        posterImage: form.posterImage || undefined,
        releaseDate: form.releaseDate || undefined,
        duration: numOrUndefined(form.duration),
        budget: numOrUndefined(form.budget),
      };
      const translations = buildTranslationsPayload(i18nEnabled, { ro: i18nRo, ru: i18nRu });
      if (translations) payload.translations = translations;

      await endpoints.movies.update(id, payload);
      nav(`/crud/details/movie/${id}`);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Edit movie</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to={`/crud/details/movie/${id}`}>
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
          <TranslationTabs
            title="Translations"
            fields={[
              { key: 'title', label: 'title' },
              { key: 'synopsis', label: 'synopsis', multiline: true },
            ]}
            requiredKeys={['title']}
            en={{ title: form.title, synopsis: form.synopsis }}
            ro={i18nRo}
            ru={i18nRu}
            enabled={i18nEnabled}
            onChangeEn={(next) =>
              setForm((f) => ({
                ...f,
                title: String(next.title ?? ''),
                synopsis: String(next.synopsis ?? ''),
              }))
            }
            onChangeRo={(next) =>
              setI18nRo({ title: String(next.title ?? ''), synopsis: String(next.synopsis ?? '') })
            }
            onChangeRu={(next) =>
              setI18nRu({ title: String(next.title ?? ''), synopsis: String(next.synopsis ?? '') })
            }
            onChangeEnabled={setI18nEnabled}
          />
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
            <div className="muted">duration</div>
            <input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
          </div>
          <div className="row">
            <div className="muted">budget</div>
            <input value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
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

