import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import { TranslationTabs } from './TranslationTabs';
import { buildTranslationsPayload } from './utils';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function NewsCreatePage() {
  const nav = useNavigate();

  const [slug, setSlug] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const [i18nEnabled, setI18nEnabled] = useState({ ro: false, ru: false });
  const [i18nRo, setI18nRo] = useState({ title: '', excerpt: '', content: '' });
  const [i18nRu, setI18nRu] = useState({ title: '', excerpt: '', content: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (!slug.trim()) {
        setError('Slug is required');
        return;
      }
      if (!title.trim()) {
        setError('EN title is required');
        return;
      }
      if (!content.trim()) {
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
        coverImageUrl: coverImageUrl || undefined,
        title,
        excerpt: excerpt || undefined,
        content,
      };

      const translations = buildTranslationsPayload(i18nEnabled, { ro: i18nRo, ru: i18nRu });
      if (translations) payload.translations = translations;

      const created = await endpoints.news.adminCreate(payload);
      nav(`/crud/edit/news/${created.id}`);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Create news</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/news">
            <button>Back</button>
          </Link>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

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
        en={{ title, excerpt, content }}
        ro={i18nRo}
        ru={i18nRu}
        enabled={i18nEnabled}
        onChangeEn={(next) => {
          setTitle(String(next.title ?? ''));
          setExcerpt(String(next.excerpt ?? ''));
          setContent(String(next.content ?? ''));
        }}
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
        <button onClick={() => void onSubmit()} disabled={loading}>
          Create
        </button>
      </div>
    </div>
  );
}
