import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api';
import { api } from '../api';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function AdminLoginPage() {
  const loc = useLocation();
  const nav = useNavigate();

  const next = useMemo(() => {
    const sp = new URLSearchParams(loc.search);
    const raw = sp.get('next');
    if (!raw) return '/crud';
    return raw.startsWith('/') ? raw : '/crud';
  }, [loc.search]);

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await api<{ token: string }>('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      localStorage.setItem('mdfilm-jwt', res.token);
      nav(next, { replace: true });
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app public" style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Admin sign in</h2>
        <Link to="/">
          <button>Home</button>
        </Link>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        {error && <div className="error">{error}</div>}

        <div className="row">
          <div className="muted">username</div>
          <input
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            autoComplete="username"
            disabled={loading}
          />
        </div>

        <div className="row">
          <div className="muted">password</div>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        <div className="actions">
          <button onClick={() => void onSubmit()} disabled={loading || !form.username || !form.password}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
