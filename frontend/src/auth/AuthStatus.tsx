import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { User } from '../types';

type Props = {
  variant?: 'public' | 'crud';
};

function isJwtPresent() {
  return Boolean(localStorage.getItem('mdfilm-jwt'));
}

export function AuthStatus({ variant = 'public' }: Props) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authed, setAuthed] = useState(false);

  const next = useMemo(() => {
    const path = window.location.pathname + window.location.search;
    return path.startsWith('/') ? path : '/';
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      if (!isJwtPresent()) {
        setUser(null);
        setAuthed(false);
        return;
      }
      const me = await endpoints.auth.me();
      setUser(me);
      setAuthed(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        localStorage.removeItem('mdfilm-jwt');
      }
      setUser(null);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    localStorage.removeItem('mdfilm-jwt');
    setUser(null);
    setAuthed(false);
    if (variant === 'crud') {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  }

  function loginGoogle() {
    window.location.href = `/api/auth/google/start?next=${encodeURIComponent(next)}`;
  }

  if (loading) {
    return <div className={variant === 'crud' ? 'muted' : ''}>{variant === 'crud' ? 'Auth…' : ''}</div>;
  }

  if (!authed || !user) {
    return (
      <button className={variant === 'public' ? 'homepage-btn ghost' : 'crud-btn'} onClick={loginGoogle} type="button">
        Continue with Google
      </button>
    );
  }

  const displayName = user.name || user.email;

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={displayName}
          style={{ width: 28, height: 28, borderRadius: 999, objectFit: 'cover' }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <div style={{ fontWeight: 800, fontSize: 12 }}>{displayName}</div>
        <div className="muted" style={{ fontSize: 11 }}>{user.role}</div>
      </div>
      <button className={variant === 'public' ? 'homepage-btn ghost' : 'crud-btn'} onClick={logout} type="button">
        Logout
      </button>
    </div>
  );
}
