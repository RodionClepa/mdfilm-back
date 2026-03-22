import { Navigate, Route, Routes } from 'react-router-dom';
import { CrudLayout } from './crud/CrudLayout';
import { MediaCreatePage } from './crud/MediaCreatePage';
import { MediaDetailsPage } from './crud/MediaDetailsPage';
import { MediaEditPage } from './crud/MediaEditPage';
import { MediaListPage } from './crud/MediaListPage';
import { MovieCreatePage } from './crud/MovieCreatePage';
import { MovieDetailsPage } from './crud/MovieDetailsPage';
import { MovieEditPage } from './crud/MovieEditPage';
import { MovieListPage } from './crud/MovieListPage';
import { SeriesCreatePage } from './crud/SeriesCreatePage';
import { SeriesDetailsPage } from './crud/SeriesDetailsPage';
import { SeriesEditPage } from './crud/SeriesEditPage';
import { SeriesListPage } from './crud/SeriesListPage';
import { DirectorCreatePage } from './crud/DirectorCreatePage';
import { DirectorEditPage } from './crud/DirectorEditPage';
import { DirectorListPage } from './crud/DirectorListPage';
import { PeopleListPage } from './crud/PeopleListPage';
import { PersonCreatePage } from './crud/PersonCreatePage';
import { PersonEditPage } from './crud/PersonEditPage';
import { HomepageFeaturedPage } from './crud/HomepageFeaturedPage';
import { NewsCreatePage } from './crud/NewsCreatePage';
import { NewsEditPage } from './crud/NewsEditPage';
import { NewsListPage } from './crud/NewsListPage';
import { MainPage } from './pages/MainPage';
import { TitleDetailsPage } from './pages/TitleDetailsPage';
import { ActorPage } from './pages/ActorPage';
import { DirectorPage } from './pages/DirectorPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { MoviesPage } from './pages/MoviesPage';
import { SeriesPagePublic } from './pages/SeriesPagePublic';
import { PeoplePagePublic } from './pages/PeoplePagePublic';
import { SearchPage } from './pages/SearchPage';
import { ProfileBookmarksPage } from './pages/ProfileBookmarksPage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailsPage } from './pages/NewsDetailsPage';
import { RequireAdmin } from './auth/RequireAdmin';
import { PublicLayout } from './layouts/PublicLayout';
import { PublicLangProvider } from './publicLang';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLangProvider>
            <PublicLayout />
          </PublicLangProvider>
        }
      >
        <Route index element={<MainPage />} />

        <Route path="login" element={<LoginPage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="auth/callback" element={<AuthCallbackPage />} />

        <Route path="movies" element={<MoviesPage />} />
        <Route path="series" element={<SeriesPagePublic />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/:slug" element={<NewsDetailsPage />} />
        <Route path="people" element={<PeoplePagePublic />} />
        <Route path="search" element={<SearchPage />} />

        <Route path="profile/bookmarks" element={<ProfileBookmarksPage />} />

        <Route path="title/:id" element={<TitleDetailsPage />} />
        <Route path="actor/:id" element={<ActorPage />} />
        <Route path="director/:id" element={<DirectorPage />} />
      </Route>

      <Route
        path="/crud"
        element={
          <RequireAdmin>
            <CrudLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="media" replace />} />

        <Route path="homepage-featured" element={<HomepageFeaturedPage />} />

        <Route path="media" element={<MediaListPage />} />
        <Route path="create/media" element={<MediaCreatePage />} />
        <Route path="details/media/:id" element={<MediaDetailsPage />} />
        <Route path="edit/media/:id" element={<MediaEditPage />} />

        <Route path="movies" element={<MovieListPage />} />
        <Route path="create/movie" element={<MovieCreatePage />} />
        <Route path="details/movie/:id" element={<MovieDetailsPage />} />
        <Route path="edit/movie/:id" element={<MovieEditPage />} />

        <Route path="series" element={<SeriesListPage />} />
        <Route path="create/series" element={<SeriesCreatePage />} />
        <Route path="details/series/:id" element={<SeriesDetailsPage />} />
        <Route path="edit/series/:id" element={<SeriesEditPage />} />

        <Route path="directors" element={<DirectorListPage />} />
        <Route path="create/director" element={<DirectorCreatePage />} />
        <Route path="edit/director/:id" element={<DirectorEditPage />} />

        <Route path="people" element={<PeopleListPage />} />
        <Route path="create/person" element={<PersonCreatePage />} />
        <Route path="edit/person/:id" element={<PersonEditPage />} />

        <Route path="news" element={<NewsListPage />} />
        <Route path="create/news" element={<NewsCreatePage />} />
        <Route path="edit/news/:id" element={<NewsEditPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
