import { api } from './api';
import type { Episode, Media, MediaCast, MediaDirector, Person, Season, Director } from './types';

export const endpoints = {
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
    create: (name: string) =>
      api<Director>('/api/directors', { method: 'POST', body: JSON.stringify({ name }) }),
  },

  people: {
    list: () => api<Person[]>('/api/people'),
    get: (id: number) => api<Person>(`/api/people/${id}`),
    create: (name: string) =>
      api<Person>('/api/people', { method: 'POST', body: JSON.stringify({ name }) }),
  },
};

