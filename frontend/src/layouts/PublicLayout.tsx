import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { UserMenu } from '../auth/UserMenu';
import { usePublicLang } from '../publicLang';
import '../App.css';

export function PublicLayout() {
  const nav = useNavigate();
  const { lang, setLang } = usePublicLang();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('homepage-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const prevThemeRef = useRef<string | undefined>(undefined);

  const [q, setQ] = useState('');

  const searchHref = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    return `/search?${sp.toString()}`;
  }, [q]);

  useEffect(() => {
    prevThemeRef.current = document.documentElement.dataset.theme;
    document.documentElement.classList.add('public-root');
    return () => {
      document.documentElement.classList.remove('public-root');
      const prevTheme = prevThemeRef.current;
      if (prevTheme) document.documentElement.dataset.theme = prevTheme;
      else delete document.documentElement.dataset.theme;
    };
  }, []);

  useEffect(() => {
    if (!document.documentElement.classList.contains('public-root')) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('homepage-theme', theme);
  }, [theme]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    nav(searchHref);
  }

  return (
    <div className="public-shell">
      <header className="public-header">
        <div className="public-header-inner">
          <div className="public-left">
            <NavLink to="/" className="public-logo">
              mdfilm
            </NavLink>
            <nav className="public-nav">
              <NavLink to="/movies" className={({ isActive }) => (isActive ? 'active' : '')}>
                Movies
              </NavLink>
              <NavLink to="/series" className={({ isActive }) => (isActive ? 'active' : '')}>
                Series
              </NavLink>
              <NavLink to="/news" className={({ isActive }) => (isActive ? 'active' : '')}>
                News
              </NavLink>
              <NavLink to="/people" className={({ isActive }) => (isActive ? 'active' : '')}>
                People
              </NavLink>
            </nav>
          </div>

          <div className="public-right">
            <form className="public-search" onSubmit={onSubmit}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                aria-label="Search"
              />
            </form>

            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              aria-label="Language"
              className="public-lang-select"
              title="Language"
            >
              <option value="en">EN</option>
              <option value="ro">RO</option>
              <option value="ru">RU</option>
            </select>

            <button
              className="public-icon-btn"
              type="button"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              title="Toggle theme"
            >
              Theme: {theme}
            </button>

            <UserMenu />
          </div>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>
    </div>
  );
}
