import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Media } from '../types';
import '../App.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import { useBookmarks } from '../bookmarks/useBookmarks';
import { BookmarkStar } from '../bookmarks/BookmarkStar';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="homepage-section-header">
      <div>
        <div className="homepage-section-title">{title}</div>
        <div className="homepage-section-desc">{description}</div>
      </div>
    </div>
  );
}

function MediaCard({ m, bookmarked, onToggle }: { m: Media; bookmarked: boolean; onToggle: (id: number) => void }) {
  const [posterOk, setPosterOk] = useState(true);
  return (
    <Link to={`/title/${m.id}`} className="homepage-card-link">
      <div className="homepage-card">
        <div className="homepage-poster">
          <BookmarkStar mediaId={m.id} active={bookmarked} onToggle={onToggle} />
          {m.posterImage && posterOk ? (
            <img src={m.posterImage} alt={m.title} onError={() => setPosterOk(false)} />
          ) : (
            <div className="homepage-poster-placeholder">No poster</div>
          )}
          <div className="homepage-poster-overlay">
            <div className="homepage-badges">
              <span className="homepage-badge">{m.type?.name ?? '—'}</span>
              <span className="homepage-badge subtle">
                {new Date(m.releaseDate).toISOString().slice(0, 10)}
              </span>
            </div>
            <div className="homepage-title" title={m.title}>
              {m.title}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SectionSlider({
  items,
  bookmarkedIds,
  onToggle,
  coverflow,
}: {
  items: Media[];
  bookmarkedIds: Set<number>;
  onToggle: (id: number) => void;
  coverflow?: boolean;
}) {
  return (
    <Swiper
      modules={coverflow ? [EffectCoverflow, Scrollbar] : [Scrollbar]}
      effect={coverflow ? 'coverflow' : undefined}
      centeredSlides={coverflow ? true : undefined}
      grabCursor={coverflow ? true : undefined}
      coverflowEffect={
        coverflow
          ? {
              rotate: 18,
              stretch: 0,
              depth: 140,
              modifier: 1,
              slideShadows: false,
            }
          : undefined
      }
      slidesPerView="auto"
      spaceBetween={12}
      style={{ padding: 18 }}
      navigation={true}
      mousewheel={true}
      freeMode={true}
      scrollbar={true}
    >
      {items.map((m) => (
        <SwiperSlide key={m.id} style={{ width: 240 }}>
          <MediaCard m={m} bookmarked={bookmarkedIds.has(m.id)} onToggle={onToggle} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export function MainPage() {
  const [featured, setFeatured] = useState<Media[]>([]);
  const [latestMovies, setLatestMovies] = useState<Media[]>([]);
  const [latestSeries, setLatestSeries] = useState<Media[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Media[]>([]);
  const [upcomingSeries, setUpcomingSeries] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevThemeRef = useRef<string | undefined>(undefined);

  const bookmarkMediaIds = useMemo(() => {
    const ids = [
      ...featured.map((m) => m.id),
      ...latestMovies.map((m) => m.id),
      ...latestSeries.map((m) => m.id),
      ...upcomingMovies.map((m) => m.id),
      ...upcomingSeries.map((m) => m.id),
    ];
    return ids;
  }, [featured, latestMovies, latestSeries, upcomingMovies, upcomingSeries]);

  const bookmarks = useBookmarks(bookmarkMediaIds);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const [f, lm, ls, um, us] = await Promise.all([
        endpoints.homepage.featured(),
        endpoints.homepage.latestMovies(),
        endpoints.homepage.latestSeries(),
        endpoints.homepage.upcomingMovies(),
        endpoints.homepage.upcomingSeries(),
      ]);
      setFeatured(f);
      setLatestMovies(lm);
      setLatestSeries(ls);
      setUpcomingMovies(um);
      setUpcomingSeries(us);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    prevThemeRef.current = document.documentElement.dataset.theme;
    document.documentElement.classList.add('homepage-root');
    void refresh();
    return () => {
      document.documentElement.classList.remove('homepage-root');
      const prevTheme = prevThemeRef.current;
      if (prevTheme) document.documentElement.dataset.theme = prevTheme;
      else delete document.documentElement.dataset.theme;
    };
  }, []);

  return (
    <div className="app homepage">
      <div className="homepage-hero">
        <div className="homepage-hero-top">
          <div>
            <div className="homepage-brand">mdfilm</div>
            <div className="homepage-subtitle">Discover what to watch tonight.</div>
          </div>
          <div className="homepage-actions">
            <Link to="/crud/media">
              <button className="homepage-btn">Admin</button>
            </Link>
            <button className="homepage-btn ghost" onClick={() => void refresh()} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>
        <div className="homepage-hero-note">
          Featured picks are curated by admin. Latest and Upcoming are derived from your database.
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted" style={{ margin: '12px 0' }}>Loading…</div>}

      <div className="homepage-section">
        <SectionHeader title="Featured" description="Admin-curated highlights. A few picks worth your attention." />
        <SectionSlider items={featured} bookmarkedIds={bookmarks.bookmarkedIds} onToggle={(id) => void bookmarks.toggle(id)} coverflow />
      </div>

      <div className="homepage-section">
        <SectionHeader title="Latest Movies" description="Recently added" />
        <SectionSlider items={latestMovies} bookmarkedIds={bookmarks.bookmarkedIds} onToggle={(id) => void bookmarks.toggle(id)} />
      </div>

      <div className="homepage-section">
        <SectionHeader title="Latest Series" description="Recently added" />
        <SectionSlider items={latestSeries} bookmarkedIds={bookmarks.bookmarkedIds} onToggle={(id) => void bookmarks.toggle(id)} />
      </div>

      <div className="homepage-section">
        <SectionHeader title="Upcoming Movies" description="Coming soon" />
        <SectionSlider items={upcomingMovies} bookmarkedIds={bookmarks.bookmarkedIds} onToggle={(id) => void bookmarks.toggle(id)} />
      </div>

      <div className="homepage-section">
        <SectionHeader title="Upcoming Series" description="Coming soon" />
        <SectionSlider items={upcomingSeries} bookmarkedIds={bookmarks.bookmarkedIds} onToggle={(id) => void bookmarks.toggle(id)} />
      </div>
    </div>
  );
}
