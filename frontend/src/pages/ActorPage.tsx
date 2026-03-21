import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/scrollbar';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Gender, Media, Person } from '../types';
import '../App.css';
import { useBookmarks } from '../bookmarks/useBookmarks';
import { BookmarkStar } from '../bookmarks/BookmarkStar';

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

function fmtGender(g?: Gender | null) {
  if (!g) return '—';
  if (g === 'MALE') return 'Male';
  if (g === 'FEMALE') return 'Female';
  return 'Unspecified';
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
  return (
    <Link to={`/title/${m.id}`} className="profile-card-link">
      <div className="profile-card">
        <div className="profile-poster">
          <BookmarkStar mediaId={m.id} active={bookmarked} onToggle={onToggle} />
          {m.posterImage && posterOk ? (
            <img src={m.posterImage} alt={m.title} onError={() => setPosterOk(false)} />
          ) : (
            <div className="profile-poster-placeholder">No poster</div>
          )}
        </div>
        <div className="profile-card-meta">
          <div className="profile-card-title" title={m.title}>
            {m.title}
          </div>
          <div className="profile-card-sub">{m.type?.name ?? '—'}</div>
        </div>
      </div>
    </Link>
  );
}

export function ActorPage() {
  const params = useParams();
  const id = Number(params.id);

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
      const [p, m] = await Promise.all([endpoints.people.get(id), endpoints.people.filmography(id)]);
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
  }, [id]);

  return (
    <div className="app profile-page">
      <div className="profile-hero">
        <div className="profile-hero-top">
          <div>
            <div className="profile-kicker">Actor</div>
            <div className="profile-title">{item?.name ?? 'Actor'}</div>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {!item && !error && <div className="muted">{loading ? 'Loading…' : 'Not found.'}</div>}

      {item && (
        <div className="profile-layout">
          <div className="profile-side">
            <div className="profile-avatar">
              {item.imageUrl && avatarOk ? (
                <img src={item.imageUrl} alt={item.name} onError={() => setAvatarOk(false)} />
              ) : (
                <div className="profile-avatar-placeholder">No image</div>
              )}
            </div>

            <div className="profile-meta">
              <div className="profile-chip">Born: {fmtDate(item.birthDate)}</div>
              <div className="profile-chip">Gender: {fmtGender(item.gender as Gender)}</div>
              <div className="profile-chip">Place of birth: {item.placeOfBirth ?? '—'}</div>
              <div className="profile-chip">Earnings: {fmtMoney(item.earnings)}</div>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-panel">
              <div className="profile-panel-title">Biography</div>
              <div className="profile-bio">{item.biography && item.biography.trim() !== '' ? item.biography : 'No biography yet.'}</div>
            </div>

            <div className="profile-panel">
              <div className="profile-panel-title">Filmography</div>
              {loading && <div className="muted">Loading…</div>}
              {!loading && media.length === 0 ? (
                <div className="muted">No titles yet.</div>
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
