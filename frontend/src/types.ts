export type MediaTypeName = 'MOVIE' | 'SERIES' | 'MEDIA' | string;

export type Gender = 'MALE' | 'FEMALE' | 'UNSPECIFIED';

export type Role = 'USER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  role: Role;
}

export interface MediaType {
  id: number;
  name: string;
}

export interface Director {
  id: number;
  name: string;
  earnings?: number | null;
  biography?: string | null;
  birthDate?: string | null;
  gender?: Gender | null;
  imageUrl?: string | null;
  placeOfBirth?: string | null;
}

export interface Person {
  id: number;
  name: string;
  earnings?: number | null;
  biography?: string | null;
  birthDate?: string | null;
  gender?: Gender | null;
  imageUrl?: string | null;
  placeOfBirth?: string | null;
}

export interface MediaDirector {
  mediaId: number;
  directorId: number;
  createdAt: string;
  director: Director;
}

export interface MediaCast {
  mediaId: number;
  personId: number;
  characterName?: string | null;
  billingOrder?: number | null;
  createdAt: string;
  person: Person;
}

export interface MovieInfo {
  mediaId: number;
  duration: number;
  budget?: number | null;
}

export interface SeriesInfo {
  mediaId: number;
  totalSeasons: number;
  status?: string | null;
  firstAirDate: string;
  lastAirDate?: string | null;
}

export interface Media {
  id: number;
  title: string;
  releaseDate: string;
  synopsis?: string | null;
  productionNotes?: string | null;
  country?: string | null;
  posterImage?: string | null;
  typeId: number;
  type?: MediaType;
  directors?: MediaDirector[];
  cast?: MediaCast[];
  movieInfo?: MovieInfo | null;
  seriesInfo?: SeriesInfo | null;
}

export interface HomepageFeaturedMedia {
  id: number;
  mediaId: number;
  position: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  media?: Media;
}

export interface Bookmark {
  id: number;
  userId: number;
  mediaId: number;
  createdAt: string;
  media: Media;
}

export interface NewsI18n {
  id: number;
  newsId: number;
  locale: 'en' | 'ro' | 'ru' | string;
  title: string;
  excerpt?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface News {
  id: number;
  slug: string;
  coverImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  translations?: NewsI18n[];
  title?: string;
  excerpt?: string | null;
  content?: string;
}

export interface Season {
  id: number;
  mediaId: number;
  seasonNumber: number;
  releaseYear: number;
}

export interface Episode {
  id: number;
  seasonId: number;
  episodeNumber: number;
  durationMinutes?: number | null;
  airDate?: string | null;
}

