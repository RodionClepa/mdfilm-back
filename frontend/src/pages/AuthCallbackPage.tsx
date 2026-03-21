import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function AuthCallbackPage() {
  const loc = useLocation();
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(loc.search);
    const token = sp.get('token') || '';
    const next = sp.get('next') || '/crud';

    async function run() {
      try {
        if (!token) throw new Error('Missing token');
        localStorage.setItem('mdfilm-jwt', token);
        await endpoints.auth.me();
        nav(next.startsWith('/') ? next : '/crud', { replace: true });
      } catch (e) {
        setError(showError(e));
      }
    }

    void run();
  }, [loc.search, nav]);

  return (
    <div className="app public" style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Signing you in…</h2>
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="muted">Please wait.</div>
      )}
    </div>
  );
}
