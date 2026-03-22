import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { AuthStatus } from '../auth/AuthStatus';
import '../App.css';

export function CrudLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('homepage-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const prevThemeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    prevThemeRef.current = document.documentElement.dataset.theme;
    document.documentElement.classList.add('crud-root');
    return () => {
      document.documentElement.classList.remove('crud-root');
      const prevTheme = prevThemeRef.current;
      if (prevTheme) document.documentElement.dataset.theme = prevTheme;
      else delete document.documentElement.dataset.theme;
    };
  }, []);

  useEffect(() => {
    if (!document.documentElement.classList.contains('crud-root')) return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('homepage-theme', theme);
  }, [theme]);

  return (
    <div className="app crud">
      <div className="header">
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>mdfilm CRUD</div>
          <div className="muted">
            Routes are under <code>/crud</code>
          </div>
        </div>
        <div className="crud-top-actions">
          <Link to="/">
            <button className="crud-btn">Home</button>
          </Link>
          <AuthStatus variant="crud" />
          <button
            className="crud-btn"
            type="button"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            Theme: {theme}
          </button>
        </div>
        <div className="tabs">
          <NavLink to="/crud/homepage-featured">
            {({ isActive }) => (
              <button className={isActive ? 'active' : ''}>Homepage</button>
            )}
          </NavLink>
          <NavLink to="/crud/media">
            {({ isActive }) => (
              <button className={isActive ? 'active' : ''}>Media</button>
            )}
          </NavLink>
          <NavLink to="/crud/movies">
            {({ isActive }) => (
              <button className={isActive ? 'active' : ''}>Movies</button>
            )}
          </NavLink>
          <NavLink to="/crud/series">
            {({ isActive }) => (
              <button className={isActive ? 'active' : ''}>Series</button>
            )}
          </NavLink>
          <NavLink to="/crud/directors">
            {({ isActive }) => (
              <button className={isActive ? 'active' : ''}>Directors</button>
            )}
          </NavLink>
          <NavLink to="/crud/people">
            {({ isActive }) => (
              <button className={isActive ? 'active' : ''}>People</button>
            )}
          </NavLink>
          <NavLink to="/crud/news">
            {({ isActive }) => (
              <button className={isActive ? 'active' : ''}>News</button>
            )}
          </NavLink>
        </div>
      </div>

      <Outlet />
    </div>
  );
}

