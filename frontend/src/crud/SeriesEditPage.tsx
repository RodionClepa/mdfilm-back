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

export function SeriesEditPage() {
  const params = useParams();
  const id = Number(params.id);
  const nav = useNavigate();

  const [item, setItem] = useState<Media | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [i18nEnabled, setI18nEnabled] = useState({ ro: false, ru: false });
  const [i18nRo, setI18nRo] = useState({ title: '', synopsis: '', productionNotes: '' });
  const [i18nRu, setI18nRu] = useState({ title: '', synopsis: '', productionNotes: '' });

  const [posterFile, setPosterFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: '',
    releaseDate: '',
    synopsis: '',
    productionNotes: '',
    country: '',
    posterImage: '',
    totalSeasons: '',
    status: '',
    firstAirDate: '',
    lastAirDate: '',
  });

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const [sEn, sRo, sRu] = await Promise.all([
        endpoints.series.get(id),
        api<Media>(`/api/series/${id}?lang=ro`),
        api<Media>(`/api/series/${id}?lang=ru`),
      ]);
      const s = sEn;
      setItem(s);
      setForm({
        title: s.title ?? '',
        releaseDate: toDateInput(s.releaseDate),
        synopsis: s.synopsis ?? '',
        productionNotes: (s as any).productionNotes ?? '',
        country: s.country ?? '',
        posterImage: s.posterImage ?? '',
        totalSeasons: s.seriesInfo?.totalSeasons != null ? String(s.seriesInfo.totalSeasons) : '',
        status: s.seriesInfo?.status ?? '',
        firstAirDate: toDateInput(s.seriesInfo?.firstAirDate),
        lastAirDate: toDateInput(s.seriesInfo?.lastAirDate),
      });

      const roTitle = sRo?.title ?? '';
      const roSynopsis = sRo?.synopsis ?? '';
      const roProductionNotes = (sRo as any)?.productionNotes ?? '';
      const ruTitle = sRu?.title ?? '';
      const ruSynopsis = sRu?.synopsis ?? '';
      const ruProductionNotes = (sRu as any)?.productionNotes ?? '';
      setI18nRo({ title: roTitle, synopsis: roSynopsis, productionNotes: roProductionNotes });
      setI18nRu({ title: ruTitle, synopsis: ruSynopsis, productionNotes: ruProductionNotes });
      setI18nEnabled({ ro: Boolean(roTitle.trim()), ru: Boolean(ruTitle.trim()) });
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }

  }

  async function onUploadPoster() {
    if (!posterFile) return;
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('poster', posterFile);
      const updated = await api<Media>(`/api/media/${id}/poster`, { method: 'POST', body: fd });
      setItem(updated);
      setForm((f) => ({ ...f, posterImage: updated.posterImage ?? '' }));
      setPosterFile(null);
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
        productionNotes: form.productionNotes || undefined,
        country: form.country || undefined,
        posterImage: form.posterImage || undefined,
        totalSeasons: numOrUndefined(form.totalSeasons),
        status: form.status || undefined,
        firstAirDate: form.firstAirDate || undefined,
        lastAirDate: form.lastAirDate || null,
      };
      const translations = buildTranslationsPayload(i18nEnabled, { ro: i18nRo, ru: i18nRu });
      if (translations) payload.translations = translations;

      await endpoints.series.update(id, payload);
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
            <input type="date" value={form.releaseDate} disabled />
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
            <div className="muted">poster upload</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
              />
              <button onClick={() => void onUploadPoster()} disabled={loading || !posterFile}>
                Upload
              </button>
            </div>
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
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="">(optional)</option>
              <option value="ONGOING">ONGOING</option>
              <option value="ENDED">ENDED</option>
            </select>
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

