import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api';
import { publicEndpoints } from '../publicEndpoints';
import type { Person } from '../types';
import '../App.css';
import { usePublicLang } from '../publicLang';
import { t } from '../publicI18n';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function PeoplePagePublic() {
  const [items, setItems] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imgOk, setImgOk] = useState<Record<number, boolean>>({});

  const { lang } = usePublicLang();

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await publicEndpoints.people.list(lang);
      setItems(data);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [lang]);

  return (
    <div className="app public-list">
      <div className="public-page-head">
        <div>
          <div className="public-page-title">{t(lang, 'people_title')}</div>
          <div className="public-page-sub">{t(lang, 'people_sub')}</div>
        </div>
        <button className="public-icon-btn" onClick={() => void load()} disabled={loading} type="button">
          {t(lang, 'refresh')}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">{t(lang, 'loading')}</div>}

      <div className="public-grid">
        {items.map((p) => (
          <Link key={p.id} to={`/actor/${p.id}`} className="public-grid-item">
            <div className="public-person-row">
              <div className="public-person-avatar">
                {p.imageUrl && imgOk[p.id] !== false ? (
                  <img src={p.imageUrl} alt={p.name} onError={() => setImgOk((prev) => ({ ...prev, [p.id]: false }))} />
                ) : (
                  <div className="public-person-avatar-placeholder">{t(lang, 'profile_no_image')}</div>
                )}
              </div>
              <div className="public-person-meta">
                <div className="public-grid-title">{p.name}</div>
                <div className="muted">{t(lang, 'role_actor')}</div>
              </div>
            </div>
          </Link>
        ))}
        {!loading && items.length === 0 ? <div className="muted">{t(lang, 'people_empty')}</div> : null}
      </div>
    </div>
  );
}
