import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';

function hasJwt() {
  return Boolean(localStorage.getItem('mdfilm-jwt'));
}

export type BookmarksState = {
  bookmarkedIds: Set<number>;
  loading: boolean;
  error: string | null;
  isBookmarked: (mediaId: number) => boolean;
  toggle: (mediaId: number) => Promise<void>;
  refresh: (mediaIds: number[]) => Promise<void>;
  loggedIn: boolean;
};

export function useBookmarks(mediaIds: number[]): BookmarksState {
  const idsKey = useMemo(() => Array.from(new Set(mediaIds.filter((n) => Number.isFinite(n) && n > 0))).sort((a, b) => a - b), [mediaIds]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => new Set());

  const idsRef = useRef<number[]>(idsKey);
  useEffect(() => {
    idsRef.current = idsKey;
  }, [idsKey]);

  const loggedIn = hasJwt();

  const refresh = useCallback(async (ids: number[]) => {
    setError(null);
    if (!hasJwt()) {
      setBookmarkedIds(new Set());
      return;
    }
    const uniq = Array.from(new Set(ids)).filter((n) => Number.isFinite(n) && n > 0);
    if (!uniq.length) {
      setBookmarkedIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const res = await endpoints.bookmarks.status(uniq);
      setBookmarkedIds(new Set(res.bookmarked));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        localStorage.removeItem('mdfilm-jwt');
        setBookmarkedIds(new Set());
        return;
      }
      if (e instanceof ApiError && (e.status === 403 || e.status === 401)) {
        setBookmarkedIds(new Set());
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(idsKey);
  }, [idsKey, refresh]);

  const isBookmarked = useCallback((mediaId: number) => bookmarkedIds.has(mediaId), [bookmarkedIds]);

  const toggle = useCallback(async (mediaId: number) => {
    setError(null);
    if (!hasJwt()) return;

    const was = bookmarkedIds.has(mediaId);

    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (was) next.delete(mediaId);
      else next.add(mediaId);
      return next;
    });

    try {
      if (was) await endpoints.bookmarks.remove(mediaId);
      else await endpoints.bookmarks.add(mediaId);
    } catch (e) {
      // rollback
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (was) next.add(mediaId);
        else next.delete(mediaId);
        return next;
      });

      if (e instanceof ApiError && e.status === 401) {
        localStorage.removeItem('mdfilm-jwt');
        setBookmarkedIds(new Set());
        return;
      }

      setError(e instanceof Error ? e.message : 'Bookmark update failed');
      // attempt to resync
      void refresh(idsRef.current);
    }
  }, [bookmarkedIds, refresh]);

  return {
    bookmarkedIds,
    loading,
    error,
    isBookmarked,
    toggle,
    refresh,
    loggedIn,
  };
}
