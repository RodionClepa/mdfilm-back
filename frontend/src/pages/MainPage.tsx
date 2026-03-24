import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api';
import { publicEndpoints } from '../publicEndpoints';
import type { Media } from '../types';
import '../App.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import { useBookmarks } from '../bookmarks/useBookmarks';
import { BookmarkStar } from '../bookmarks/BookmarkStar';
import { usePublicLang } from '../publicLang';
import { t, tMediaType } from '../publicI18n';

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

function MediaCard({
  m,
  bookmarked,
  onToggle,
  lang,
}: {
  m: Media;
  bookmarked: boolean;
  onToggle: (id: number) => void;
  lang: 'en' | 'ro' | 'ru';
}) {
  const [posterOk, setPosterOk] = useState(true);
  return (
    <Link to={`/title/${m.id}`} className="homepage-card-link">
      <div className="homepage-card">
        <div className="homepage-poster">
          <BookmarkStar mediaId={m.id} active={bookmarked} onToggle={onToggle} />
          {m.posterImage && posterOk ? (
            <img src={m.posterImage} alt={m.title} onError={() => setPosterOk(false)} />
          ) : (
            <div className="homepage-poster-placeholder">{t(lang, 'poster_fallback')}</div>
          )}
          <div className="homepage-poster-overlay">
            <div className="homepage-badges">
              <span className="homepage-badge">{tMediaType(lang, m.type?.name)}</span>
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
  lang,
}: {
  items: Media[];
  bookmarkedIds: Set<number>;
  onToggle: (id: number) => void;
  coverflow?: boolean;
  lang: 'en' | 'ro' | 'ru';
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
          <MediaCard m={m} bookmarked={bookmarkedIds.has(m.id)} onToggle={onToggle} lang={lang} />
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

  const { lang } = usePublicLang();

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
        publicEndpoints.homepage.featured(lang),
        publicEndpoints.homepage.latestMovies(lang),
        publicEndpoints.homepage.latestSeries(lang),
        publicEndpoints.homepage.upcomingMovies(lang),
        publicEndpoints.homepage.upcomingSeries(lang),
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
    return () => {
      document.documentElement.classList.remove('homepage-root');
      const prevTheme = prevThemeRef.current;
      if (prevTheme) document.documentElement.dataset.theme = prevTheme;
      else delete document.documentElement.dataset.theme;
    };
  }, []);

  useEffect(() => {
    void refresh();
  }, [lang]);

  return (
    <div className="app homepage">
      <div className="homepage-hero">
        <div className="homepage-hero-top">
          <div>
            <div className="homepage-brand">mdfilm</div>
            <div className="homepage-subtitle">{t(lang, 'homepage_subtitle')}</div>
          </div>
        </div>
        <div className="homepage-hero-note">
          {t(lang, 'homepage_hero_note')}
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted" style={{ margin: '12px 0' }}>{t(lang, 'loading')}</div>}

      <div className="homepage-section">
        <SectionHeader title={t(lang, 'homepage_featured')} description={t(lang, 'homepage_featured_desc')} />
        <SectionSlider items={featured} bookmarkedIds={bookmarks.bookmarkedIds} onToggle={(id) => void bookmarks.toggle(id)} coverflow lang={lang} />
      </div>

      <div className="homepage-section">
        <SectionHeader title={t(lang, 'homepage_latest_movies')} description={t(lang, 'homepage_recently_added')} />
        <SectionSlider items={latestMovies} bookmarkedIds={bookmarks.bookmarkedIds} onToggle={(id) => void bookmarks.toggle(id)} lang={lang} />
      </div>

      <div className="homepage-section">
        <SectionHeader title={t(lang, 'homepage_latest_series')} description={t(lang, 'homepage_recently_added')} />
        <SectionSlider items={latestSeries} bookmarkedIds={bookmarks.bookmarkedIds} onToggle={(id) => void bookmarks.toggle(id)} lang={lang} />
      </div>

      <div className="homepage-section">
        <SectionHeader title={t(lang, 'homepage_upcoming_movies')} description={t(lang, 'homepage_coming_soon')} />
        <SectionSlider items={upcomingMovies} bookmarkedIds={bookmarks.bookmarkedIds} onToggle={(id) => void bookmarks.toggle(id)} lang={lang} />
      </div>

      <div className="homepage-section">
        <SectionHeader title={t(lang, 'homepage_upcoming_series')} description={t(lang, 'homepage_coming_soon')} />
        <SectionSlider items={upcomingSeries} bookmarkedIds={bookmarks.bookmarkedIds} onToggle={(id) => void bookmarks.toggle(id)} lang={lang} />
      </div>
    </div>
  );
}
