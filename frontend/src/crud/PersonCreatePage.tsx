import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

export function PersonCreatePage() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await endpoints.people.create(name);
      nav('/crud/people');
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Create person</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <Link to="/crud/people">
            <button>Back</button>
          </Link>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="row">
        <div className="muted">name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="actions">
        <button onClick={() => void onSubmit()} disabled={loading}>
          Create
        </button>
      </div>
    </div>
  );
}

