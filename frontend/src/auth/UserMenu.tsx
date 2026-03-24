import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { User } from '../types';
import { usePublicLang } from '../publicLang';
import { t } from '../publicI18n';

function isJwtPresent() {
  return Boolean(localStorage.getItem('mdfilm-jwt'));
}

export function UserMenu() {
  const loc = useLocation();
  const nav = useNavigate();
  const { lang } = usePublicLang();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const next = useMemo(() => {
    const path = loc.pathname + loc.search;
    return path.startsWith('/') ? path : '/';
  }, [loc.pathname, loc.search]);

  async function refresh() {
    setLoading(true);
    try {
      if (!isJwtPresent()) {
        setUser(null);
        return;
      }
      const me = await endpoints.auth.me();
      setUser(me);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        localStorage.removeItem('mdfilm-jwt');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function logout() {
    localStorage.removeItem('mdfilm-jwt');
    setUser(null);
    setOpen(false);
    nav('/', { replace: true });
  }

  function loginGoogle() {
    window.location.href = `/api/auth/google/start?next=${encodeURIComponent(next)}`;
  }

  const label = user ? user.name || user.email : t(lang, 'menu_login');

  return (
    <div className="user-menu" ref={rootRef}>
      <button className="public-icon-btn" type="button" onClick={() => setOpen((v) => !v)}>
        {loading ? '…' : label}
      </button>

      {open ? (
        <div className="user-menu-pop">
          {user ? (
            <>
              <div className="user-menu-head">
                {user.avatarUrl ? (
                  <img
                    className="user-menu-avatar"
                    src={user.avatarUrl}
                    alt={user.name || user.email}
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                  />
                ) : null}
                <div>
                  <div className="user-menu-name">{user.name || user.email}</div>
                  <div className="user-menu-sub">{user.email}</div>
                  <div className="user-menu-sub">{user.role === 'ADMIN' ? t(lang, 'role_admin') : t(lang, 'role_user')}</div>
                </div>
              </div>

              <div className="user-menu-actions">
                {user.role === 'USER' ? (
                  <Link to="/profile/bookmarks" onClick={() => setOpen(false)}>
                    <button type="button">{t(lang, 'menu_bookmarks')}</button>
                  </Link>
                ) : null}
                {user.role === 'ADMIN' ? (
                  <Link to="/crud" onClick={() => setOpen(false)}>
                    <button type="button">{t(lang, 'menu_admin')}</button>
                  </Link>
                ) : null}
                <button type="button" onClick={logout}>
                  {t(lang, 'menu_logout')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="user-menu-actions">
                <button type="button" onClick={loginGoogle}>
                  {t(lang, 'menu_continue_google')}
                </button>
                <Link to={`/admin/login?next=${encodeURIComponent(next)}`} onClick={() => setOpen(false)}>
                  <button type="button">{t(lang, 'menu_admin_login')}</button>
                </Link>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
