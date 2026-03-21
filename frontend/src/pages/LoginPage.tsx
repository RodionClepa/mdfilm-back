import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function LoginPage() {
  const loc = useLocation();

  const next = useMemo(() => {
    const sp = new URLSearchParams(loc.search);
    const raw = sp.get('next');
    if (!raw) return '/crud';
    return raw.startsWith('/') ? raw : '/crud';
  }, [loc.search]);

  function startGoogle() {
    window.location.href = `/api/auth/google/start?next=${encodeURIComponent(next)}`;
  }

  return (
    <div className="app public" style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Sign in</h2>
        <Link to="/">
          <button>Home</button>
        </Link>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <div className="muted" style={{ marginBottom: 12 }}>
          Admin access requires a Google account.
        </div>
        <button onClick={startGoogle}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
