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
import { DirectorListPage } from './crud/DirectorListPage';
import { PeopleListPage } from './crud/PeopleListPage';
import { PersonCreatePage } from './crud/PersonCreatePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/crud" replace />} />

      <Route path="/crud" element={<CrudLayout />}>
        <Route index element={<Navigate to="media" replace />} />

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

        <Route path="people" element={<PeopleListPage />} />
        <Route path="create/person" element={<PersonCreatePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/crud" replace />} />
    </Routes>
  );
}
