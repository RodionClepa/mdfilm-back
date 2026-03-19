export type MediaTypeName = 'MOVIE' | 'SERIES' | 'MEDIA' | string;

export interface MediaType {
  id: number;
  name: string;
}

export interface Director {
  id: number;
  name: string;
}

export interface Person {
  id: number;
  name: string;
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
  country?: string | null;
  posterImage?: string | null;
  typeId: number;
  type?: MediaType;
  directors?: MediaDirector[];
  cast?: MediaCast[];
  movieInfo?: MovieInfo | null;
  seriesInfo?: SeriesInfo | null;
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

