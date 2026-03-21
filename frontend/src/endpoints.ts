import { api } from './api';
import type { Episode, Media, MediaCast, MediaDirector, Person, Season, Director, HomepageFeaturedMedia, User, Bookmark } from './types';

export const endpoints = {
  auth: {
    me: () => api<User>('/api/auth/me'),
  },
  bookmarks: {
    list: (params?: { type?: 'MOVIE' | 'SERIES'; q?: string; sort?: string }) => {
      const sp = new URLSearchParams();
      if (params?.type) sp.set('type', params.type);
      if (params?.q) sp.set('q', params.q);
      if (params?.sort) sp.set('sort', params.sort);
      const qs = sp.toString();
      return api<Bookmark[]>(`/api/bookmarks${qs ? `?${qs}` : ''}`);
    },
    status: (mediaIds: number[]) => {
      const qs = mediaIds.length ? `?mediaIds=${encodeURIComponent(mediaIds.join(','))}` : '';
      return api<{ bookmarked: number[] }>(`/api/bookmarks/status${qs}`);
    },
    add: (mediaId: number) =>
      api<Bookmark>('/api/bookmarks', { method: 'POST', body: JSON.stringify({ mediaId }) }),
    remove: (mediaId: number) => api<void>(`/api/bookmarks/${mediaId}`, { method: 'DELETE' }),
  },
  homepage: {
    featured: () => api<Media[]>('/api/homepage/featured'),
    latestMovies: () => api<Media[]>('/api/homepage/latest/movies'),
    latestSeries: () => api<Media[]>('/api/homepage/latest/series'),
    upcomingMovies: () => api<Media[]>('/api/homepage/upcoming/movies'),
    upcomingSeries: () => api<Media[]>('/api/homepage/upcoming/series'),

    adminFeaturedList: () => api<HomepageFeaturedMedia[]>('/api/homepage/admin/featured'),
    adminFeaturedReplace: (
      items: Array<{ mediaId: number; position: number; enabled?: boolean }>,
    ) =>
      api<HomepageFeaturedMedia[]>('/api/homepage/admin/featured', {
        method: 'PUT',
        body: JSON.stringify(items),
      }),
  },
  media: {
    list: () => api<Media[]>('/api/media'),
    get: (id: number) => api<Media>(`/api/media/${id}`),
    create: (data: any) =>
      api<Media>('/api/media', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      api<Media>(`/api/media/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      api<void>(`/api/media/${id}`, { method: 'DELETE' }),

    directors: {
      list: (mediaId: number) => api<MediaDirector[]>(`/api/media/${mediaId}/directors`),
      add: (mediaId: number, directorIds: number[]) =>
        api<Media>(`/api/media/${mediaId}/directors`, {
          method: 'POST',
          body: JSON.stringify({ directorIds }),
        }),
      replace: (mediaId: number, directorIds: number[]) =>
        api<Media>(`/api/media/${mediaId}/directors`, {
          method: 'PUT',
          body: JSON.stringify({ directorIds }),
        }),
      remove: (mediaId: number, directorId: number) =>
        api<Media>(`/api/media/${mediaId}/directors/${directorId}`, { method: 'DELETE' }),
    },

    cast: {
      list: (mediaId: number) => api<MediaCast[]>(`/api/media/${mediaId}/cast`),
      add: (
        mediaId: number,
        data: { personId: number; characterName?: string; billingOrder?: number },
      ) =>
        api<Media>(`/api/media/${mediaId}/cast`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      replace: (
        mediaId: number,
        cast: Array<{ personId: number; characterName?: string; billingOrder?: number }>,
      ) =>
        api<Media>(`/api/media/${mediaId}/cast`, {
          method: 'PUT',
          body: JSON.stringify({ cast }),
        }),
      remove: (mediaId: number, personId: number) =>
        api<Media>(`/api/media/${mediaId}/cast/${personId}`, { method: 'DELETE' }),
    },
  },
  movies: {
    list: () => api<Media[]>('/api/movies'),
    get: (id: number) => api<Media>(`/api/movies/${id}`),
    create: (data: any) =>
      api<Media>('/api/movies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      api<Media>(`/api/movies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      api<void>(`/api/movies/${id}`, { method: 'DELETE' }),
  },
  series: {
    list: () => api<Media[]>('/api/series'),
    get: (id: number) => api<Media>(`/api/series/${id}`),
    create: (data: any) =>
      api<Media>('/api/series', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      api<Media>(`/api/series/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      api<void>(`/api/series/${id}`, { method: 'DELETE' }),
  },
  seasons: {
    listBySeries: (seriesId: number) =>
      api<Season[]>(`/api/series/${seriesId}/seasons`),
    createForSeries: (seriesId: number, data: any) =>
      api<Season>(`/api/series/${seriesId}/seasons`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      api<Season>(`/api/seasons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => api<void>(`/api/seasons/${id}`, { method: 'DELETE' }),
  },
  episodes: {
    listBySeason: (seasonId: number) =>
      api<Episode[]>(`/api/seasons/${seasonId}/episodes`),
    createForSeason: (seasonId: number, data: any) =>
      api<Episode>(`/api/seasons/${seasonId}/episodes`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      api<Episode>(`/api/episodes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => api<void>(`/api/episodes/${id}`, { method: 'DELETE' }),
  },

  directors: {
    list: () => api<Director[]>('/api/directors'),
    get: (id: number) => api<Director>(`/api/directors/${id}`),
    filmography: (id: number) => api<Media[]>(`/api/directors/${id}/filmography`),
    create: (data: any) =>
      api<Director>('/api/directors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      api<Director>(`/api/directors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => api<void>(`/api/directors/${id}`, { method: 'DELETE' }),
  },

  people: {
    list: () => api<Person[]>('/api/people'),
    get: (id: number) => api<Person>(`/api/people/${id}`),
    filmography: (id: number) => api<Media[]>(`/api/people/${id}/filmography`),
    create: (data: any) =>
      api<Person>('/api/people', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      api<Person>(`/api/people/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => api<void>(`/api/people/${id}`, { method: 'DELETE' }),
  },
};

