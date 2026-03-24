import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api';
import { publicEndpoints } from '../publicEndpoints';
import type { News } from '../types';
import '../App.css';
import { usePublicLang } from '../publicLang';
import { t } from '../publicI18n';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

export function NewsDetailsPage() {
  const params = useParams();
  const slug = String(params.slug ?? '');

  const { lang } = usePublicLang();

  const [item, setItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const n = await publicEndpoints.news.getBySlug(slug, lang);
      setItem(n);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (slug) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lang]);

  return (
    <div className="app title-details">
      <div className="title-hero">
        <div className="title-hero-top">
          <div>
            <div className="title-kicker">{t(lang, 'news_title')}</div>
            <div className="title-title">{item?.title ?? slug}</div>
            <div className="title-subtitle">{fmtDate(item?.createdAt)}</div>
          </div>
          <div className="actions" style={{ marginTop: 0 }}>
            <Link to="/news">
              <button className="public-icon-btn" type="button">
                {t(lang, 'back')}
              </button>
            </Link>
            <button className="public-icon-btn" onClick={() => void load()} disabled={loading} type="button">
              {t(lang, 'refresh')}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {!item && !error && <div className="muted">{loading ? t(lang, 'loading') : t(lang, 'not_found')}</div>}

      {item && (
        <div className="title-layout" style={{ gridTemplateColumns: '1fr' }}>
          <div className="title-main">
            {item.coverImageUrl ? (
              <div className="title-panel">
                <img
                  src={item.coverImageUrl}
                  alt=""
                  style={{ width: '100%', borderRadius: 14, maxHeight: 420, objectFit: 'cover' }}
                />
              </div>
            ) : null}

            {item.excerpt ? (
              <div className="title-panel">
                <div className="title-panel-title">{t(lang, 'news_summary')}</div>
                <div className="title-overview">{item.excerpt}</div>
              </div>
            ) : null}

            <div className="title-panel">
              <div className="title-panel-title">{t(lang, 'news_content')}</div>
              <div className="title-overview" style={{ whiteSpace: 'pre-wrap' }}>
                {item.content ?? ''}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
