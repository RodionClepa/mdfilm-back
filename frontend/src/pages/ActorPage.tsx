import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/scrollbar';
import { ApiError } from '../api';
import { publicEndpoints } from '../publicEndpoints';
import type { Media, Person } from '../types';
import '../App.css';
import { useBookmarks } from '../bookmarks/useBookmarks';
import { BookmarkStar } from '../bookmarks/BookmarkStar';
import { usePublicLang } from '../publicLang';
import { t, tMediaType } from '../publicI18n';

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
    return d;
  }
}

function fmtMoney(v?: number | null) {
  if (v == null) return '—';
  try {
    return new Intl.NumberFormat(undefined).format(v);
  } catch {
    return String(v);
  }
}

function MediaCard({ m, bookmarked, onToggle }: { m: Media; bookmarked: boolean; onToggle: (id: number) => void }) {
  const [posterOk, setPosterOk] = useState(true);
  const { lang } = usePublicLang();
  return (
    <Link to={`/title/${m.id}`} className="profile-card-link">
      <div className="profile-card">
        <div className="profile-poster">
          <BookmarkStar mediaId={m.id} active={bookmarked} onToggle={onToggle} />
          {m.posterImage && posterOk ? (
            <img src={m.posterImage} alt={m.title} onError={() => setPosterOk(false)} />
          ) : (
            <div className="profile-poster-placeholder">{t(lang, 'poster_fallback')}</div>
          )}
        </div>
        <div className="profile-card-meta">
          <div className="profile-card-title" title={m.title}>
            {m.title}
          </div>
          <div className="profile-card-sub">{tMediaType(lang, m.type?.name)}</div>
        </div>
      </div>
    </Link>
  );
}

export function ActorPage() {
  const params = useParams();
  const id = Number(params.id);

  const { lang } = usePublicLang();

  const [item, setItem] = useState<Person | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarOk, setAvatarOk] = useState(true);

  const bookmarks = useBookmarks(media.map((m) => m.id));

  async function load() {
    setError(null);
    setAvatarOk(true);
    setLoading(true);
    try {
      const [p, m] = await Promise.all([
        publicEndpoints.people.get(id, lang),
        publicEndpoints.people.filmography(id, lang),
      ]);
      setItem(p);
      setMedia(m);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isFinite(id)) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lang]);

  return (
    <div className="app profile-page">
      <div className="profile-hero">
        <div className="profile-hero-top">
          <div>
            <div className="profile-kicker">{t(lang, 'role_actor')}</div>
            <div className="profile-title">{item?.name ?? t(lang, 'role_actor')}</div>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {!item && !error && <div className="muted">{loading ? t(lang, 'loading') : t(lang, 'not_found')}</div>}

      {item && (
        <div className="profile-layout">
          <div className="profile-side">
            <div className="profile-avatar">
              {item.imageUrl && avatarOk ? (
                <img src={item.imageUrl} alt={item.name} onError={() => setAvatarOk(false)} />
              ) : (
                <div className="profile-avatar-placeholder">{t(lang, 'profile_no_image')}</div>
              )}
            </div>

            <div className="profile-meta">
              <div className="profile-chip">{t(lang, 'profile_born')}: {fmtDate(item.birthDate)}</div>
              <div className="profile-chip">
                {t(lang, 'profile_gender')}: {item.gender === 'MALE' ? t(lang, 'gender_male') : item.gender === 'FEMALE' ? t(lang, 'gender_female') : t(lang, 'gender_unspecified')}
              </div>
              <div className="profile-chip">{t(lang, 'profile_place_of_birth')}: {item.placeOfBirth ?? '—'}</div>
              <div className="profile-chip">{t(lang, 'profile_earnings')}: {fmtMoney(item.earnings)}</div>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-panel">
              <div className="profile-panel-title">{t(lang, 'profile_biography')}</div>
              <div className="profile-bio">{item.biography && item.biography.trim() !== '' ? item.biography : t(lang, 'profile_no_bio')}</div>
            </div>

            <div className="profile-panel">
              <div className="profile-panel-title">{t(lang, 'profile_filmography')}</div>
              {loading && <div className="muted">{t(lang, 'loading')}</div>}
              {!loading && media.length === 0 ? (
                <div className="muted">{t(lang, 'profile_no_titles')}</div>
              ) : null}

              {media.length > 0 ? (
                <Swiper
                  modules={[Scrollbar]}
                  slidesPerView="auto"
                  spaceBetween={12}
                  scrollbar={{ hide: true }}
                  style={{ padding: 18 }}
                >
                  {media.map((m) => (
                    <SwiperSlide key={m.id} style={{ width: 220 }}>
                      <MediaCard m={m} bookmarked={bookmarks.isBookmarked(m.id)} onToggle={(id) => void bookmarks.toggle(id)} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
