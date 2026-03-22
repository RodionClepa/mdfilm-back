import { api } from './api';
import type { Bookmark, Director, Media, MediaCast, MediaDirector, Person, News } from './types';
import type { PublicLang } from './publicLang';

function addLang(path: string, lang: PublicLang) {
  if (!lang || lang === 'en') return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}lang=${encodeURIComponent(lang)}`;
}

export const publicEndpoints = {
  homepage: {
    featured: (lang: PublicLang) => api<Media[]>(addLang('/api/homepage/featured', lang)),
    latestMovies: (lang: PublicLang) => api<Media[]>(addLang('/api/homepage/latest/movies', lang)),
    latestSeries: (lang: PublicLang) => api<Media[]>(addLang('/api/homepage/latest/series', lang)),
    upcomingMovies: (lang: PublicLang) => api<Media[]>(addLang('/api/homepage/upcoming/movies', lang)),
    upcomingSeries: (lang: PublicLang) => api<Media[]>(addLang('/api/homepage/upcoming/series', lang)),
  },

  media: {
    list: (lang: PublicLang) => api<Media[]>(addLang('/api/media', lang)),
    get: (id: number, lang: PublicLang) => api<Media>(addLang(`/api/media/${id}`, lang)),

    directors: {
      list: (mediaId: number, lang: PublicLang) => api<MediaDirector[]>(addLang(`/api/media/${mediaId}/directors`, lang)),
    },

    cast: {
      list: (mediaId: number, lang: PublicLang) => api<MediaCast[]>(addLang(`/api/media/${mediaId}/cast`, lang)),
    },
  },

  movies: {
    list: (lang: PublicLang) => api<Media[]>(addLang('/api/movies', lang)),
    get: (id: number, lang: PublicLang) => api<Media>(addLang(`/api/movies/${id}`, lang)),
  },

  series: {
    list: (lang: PublicLang) => api<Media[]>(addLang('/api/series', lang)),
    get: (id: number, lang: PublicLang) => api<Media>(addLang(`/api/series/${id}`, lang)),
  },

  directors: {
    list: (lang: PublicLang) => api<Director[]>(addLang('/api/directors', lang)),
    get: (id: number, lang: PublicLang) => api<Director>(addLang(`/api/directors/${id}`, lang)),
    filmography: (id: number, lang: PublicLang) => api<Media[]>(addLang(`/api/directors/${id}/filmography`, lang)),
  },

  people: {
    list: (lang: PublicLang) => api<Person[]>(addLang('/api/people', lang)),
    get: (id: number, lang: PublicLang) => api<Person>(addLang(`/api/people/${id}`, lang)),
    filmography: (id: number, lang: PublicLang) => api<Media[]>(addLang(`/api/people/${id}/filmography`, lang)),
  },

  news: {
    list: (lang: PublicLang) => api<News[]>(addLang('/api/news', lang)),
    getBySlug: (slug: string, lang: PublicLang) =>
      api<News>(addLang(`/api/news/${encodeURIComponent(slug)}`, lang)),
  },

  bookmarks: {
    list: (lang: PublicLang, params?: { type?: 'MOVIE' | 'SERIES'; q?: string; sort?: string }) => {
      const sp = new URLSearchParams();
      if (params?.type) sp.set('type', params.type);
      if (params?.q) sp.set('q', params.q);
      if (params?.sort) sp.set('sort', params.sort);
      const qs = sp.toString();
      return api<Bookmark[]>(addLang(`/api/bookmarks${qs ? `?${qs}` : ''}`, lang));
    },
  },
};
