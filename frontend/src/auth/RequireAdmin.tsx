import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { User } from '../types';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setUnauthorized(false);
      try {
        const me = await endpoints.auth.me();
        if (!alive) return;
        setUser(me);
      } catch (e) {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) setUnauthorized(true);
        else setUnauthorized(true);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [loc.pathname]);

  if (loading) {
    return (
      <div className="app crud">
        <div className="panel">Loading…</div>
      </div>
    );
  }

  if (unauthorized) {
    return <Navigate to={`/admin/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
