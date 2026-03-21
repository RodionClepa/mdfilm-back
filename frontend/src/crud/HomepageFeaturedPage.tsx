import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api';
import { endpoints } from '../endpoints';
import type { Media, HomepageFeaturedMedia } from '../types';

function showError(e: unknown) {
  if (e instanceof ApiError) return `${e.message} (HTTP ${e.status})`;
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}

function nextPosition(items: HomepageFeaturedMedia[]) {
  return items.length ? Math.max(...items.map((i) => i.position)) + 1 : 1;
}

export function HomepageFeaturedPage() {
  const [items, setItems] = useState<HomepageFeaturedMedia[]>([]);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaOptions = useMemo(() => {
    const selected = new Set(items.map((i) => i.mediaId));
    return allMedia.filter((m) => !selected.has(m.id));
  }, [allMedia, items]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const [featured, media] = await Promise.all([
        endpoints.homepage.adminFeaturedList(),
        endpoints.media.list(),
      ]);
      setItems(featured);
      setAllMedia(media);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function move(id: number, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapWith];
    const updated = sorted.map((x) => {
      if (x.id === a.id) return { ...x, position: b.position };
      if (x.id === b.id) return { ...x, position: a.position };
      return x;
    });
    setItems(updated);
  }

  function toggleEnabled(id: number) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
  }

  function remove(id: number) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function addSelected() {
    if (selectedMediaId === '') return;
    const m = allMedia.find((x) => x.id === selectedMediaId);
    if (!m) return;
    const pos = nextPosition(items);
    setItems((prev) => [
      ...prev,
      {
        id: -Date.now(),
        mediaId: m.id,
        position: pos,
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        media: m,
      },
    ]);
    setSelectedMediaId('');
  }

  async function save() {
    setError(null);
    setLoading(true);
    try {
      const payload = [...items]
        .sort((a, b) => a.position - b.position)
        .map((i) => ({ mediaId: i.mediaId, position: i.position, enabled: i.enabled }));
      const updated = await endpoints.homepage.adminFeaturedReplace(payload);
      setItems(updated);
    } catch (e) {
      setError(showError(e));
    } finally {
      setLoading(false);
    }
  }

  const sortedItems = [...items].sort((a, b) => a.position - b.position);

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h2>Homepage featured media</h2>
        <div className="actions" style={{ marginTop: 0 }}>
          <button onClick={() => void refresh()} disabled={loading}>
            Refresh
          </button>
          <button onClick={() => void save()} disabled={loading}>
            Save
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <select
          value={selectedMediaId}
          onChange={(e) => setSelectedMediaId(e.target.value ? Number(e.target.value) : '')}
          disabled={loading}
        >
          <option value="">Select media to add…</option>
          {mediaOptions.map((m) => (
            <option key={m.id} value={m.id}>
              #{m.id} {m.title} ({m.type?.name ?? m.typeId})
            </option>
          ))}
        </select>
        <button onClick={addSelected} disabled={loading || selectedMediaId === ''}>
          Add
        </button>
      </div>

      <div className="muted" style={{ marginBottom: 10 }}>
        {loading ? 'Loading…' : `${items.length} item(s)`}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Order</th>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Enabled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((i) => (
            <tr key={`${i.id}-${i.mediaId}`}>
              <td>{i.position}</td>
              <td>{i.mediaId}</td>
              <td>{i.media?.title ?? '—'}</td>
              <td>{i.media?.type?.name ?? i.media?.typeId ?? '—'}</td>
              <td>
                <input
                  type="checkbox"
                  checked={Boolean(i.enabled)}
                  onChange={() => toggleEnabled(i.id)}
                  disabled={loading}
                />
              </td>
              <td>
                <button onClick={() => move(i.id, -1)} disabled={loading}>
                  Up
                </button>{' '}
                <button onClick={() => move(i.id, 1)} disabled={loading}>
                  Down
                </button>{' '}
                <button onClick={() => remove(i.id)} disabled={loading}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {sortedItems.length === 0 && (
            <tr>
              <td colSpan={6} className="muted">
                No featured media yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
