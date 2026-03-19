import { NavLink, Outlet } from 'react-router-dom';
import '../App.css';

export function CrudLayout() {
  return (
    <div className="app">
      <div className="header">
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>mdfilm CRUD</div>
          <div className="muted">
            Routes are under <code>/crud</code>
          </div>
        </div>
        <div className="tabs">
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
        </div>
      </div>

      <Outlet />
    </div>
  );
}

