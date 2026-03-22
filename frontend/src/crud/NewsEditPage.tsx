import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { News, NewsI18n } from '../types';
import { TranslationTabs } from './TranslationTabs';
import { buildTranslationsPayload } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

function pickLocale(rows: NewsI18n[] | undefined, locale: 'en' | 'ro' | 'ru') {
  if (!rows?.length) return undefined;
  return rows.find((r) => r.locale === locale);
}

export function NewsEditPage() {
  const params = useParams();
  const id = Number(params.id);
  const nav = useNavigate();

  const [item, setItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const [en, setEn] = useState({ title: '', excerpt: '', content: '' });
  const [i18nEnabled, setI18nEnabled] = useState({ ro: false, ru: false });
  const [i18nRo, setI18nRo] = useState({ title: '', excerpt: '', content: '' });
  const [i18nRu, setI18nRu] = useState({ title: '', excerpt: '', content: '' });

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const n = await endpoints.news.adminGet(id);
      setItem(n);
      setSlug(String(n.slug ?? ''));
      setCoverImageUrl(String(n.coverImageUrl ?? ''));

      const tEn = pickLocale(n.translations as any, 'en');
      const tRo = pickLocale(n.translations as any, 'ro');
      const tRu = pickLocale(n.translations as any, 'ru');

      setEn({
        title: String(tEn?.title ?? ''),
        excerpt: String(tEn?.excerpt ?? ''),
        content: String(tEn?.content ?? ''),
      });

      const roTitle = String(tRo?.title ?? '');
      const ruTitle = String(tRu?.title ?? '');

      setI18nRo({
        title: roTitle,
        excerpt: String(tRo?.excerpt ?? ''),
        content: String(tRo?.content ?? ''),
      });
      setI18nRu({
        title: ruTitle,
        excerpt: String(tRu?.excerpt ?? ''),
        content: String(tRu?.content ?? ''),
      });
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

  async function save() {
    setError(null);
    setLoading(true);
    try {
      if (!slug.trim()) {
        setError('Slug is required');
        return;
      }
      if (!en.title.trim()) {
        setError('EN title is required');
        return;
      }
      if (!en.content.trim()) {
        setError('EN content is required');
        return;
      }
      if (i18nEnabled.ro && (!i18nRo.title.trim() || !i18nRo.content.trim())) {
        setError('RO title and content are required when RO is enabled');
        return;
      }
      if (i18nEnabled.ru && (!i18nRu.title.trim() || !i18nRu.content.trim())) {
        setError('RU title and content are required when RU is enabled');
        return;
      }

      const payload: any = {
        slug,
        coverImageUrl: coverImageUrl || null,
        title: en.title,
        excerpt: en.excerpt || undefined,
        content: en.content,
      };

      const tPayload = buildTranslationsPayload(i18nEnabled, { ro: i18nRo, ru: i18nRu });
      if (tPayload) payload.translations = tPayload;

      await endpoints.news.adminUpdate(id, payload);
      nav('/crud/news');
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Edit news</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/news">
            <button>Back</button>
          </Link>
          <button onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {!item && !error && <div className="muted">{loading ? 'Loading…' : 'Not found.'}</div>}

      {item && (
        <>
          <div className="row">
            <div className="muted">slug</div>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="row">
            <div className="muted">coverImageUrl</div>
            <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
          </div>

          <TranslationTabs
            title="Translations"
            fields={[
              { key: 'title', label: 'title' },
              { key: 'excerpt', label: 'excerpt', multiline: true },
              { key: 'content', label: 'content', multiline: true },
            ]}
            requiredKeys={['title', 'content']}
            en={en}
            ro={i18nRo}
            ru={i18nRu}
            enabled={i18nEnabled}
            onChangeEn={(next) =>
              setEn({
                title: String(next.title ?? ''),
                excerpt: String(next.excerpt ?? ''),
                content: String(next.content ?? ''),
              })
            }
            onChangeRo={(next) =>
              setI18nRo({
                title: String(next.title ?? ''),
                excerpt: String(next.excerpt ?? ''),
                content: String(next.content ?? ''),
              })
            }
            onChangeRu={(next) =>
              setI18nRu({
                title: String(next.title ?? ''),
                excerpt: String(next.excerpt ?? ''),
                content: String(next.content ?? ''),
              })
            }
            onChangeEnabled={setI18nEnabled}
          />

          <div className="actions">
            <button onClick={() => void save()} disabled={loading}>
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
}
