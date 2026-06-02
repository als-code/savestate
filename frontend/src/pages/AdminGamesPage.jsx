import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { Textarea } from '../components/ui/Textarea';
import { listGames } from '../services/gamesService';
import { listGenres } from '../services/genresService';
import { listPlatforms } from '../services/platformsService';
import * as adminGames from '../services/adminGamesService';
import { getCoverUrl } from '../utils/coverUrl';

function emptyDraft() {
  return {
    id: null,
    title: '',
    description: '',
    platform_id: '',
    genre_id: '',
    release_year: '',
    cover_url: '',
    cover_current: '',
    remove_cover: false,
    cover: null,
  };
}

export function AdminGamesPage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [draft, setDraft] = useState(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let alive = true;

    Promise.all([listGames(), listGenres(), listPlatforms()])
      .then(([g, ge, p]) => {
        if (!alive) return;
        setItems(g);
        setGenres(ge);
        setPlatforms(p);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message || 'No se pudo cargar admin');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) return;
    const idNum = Number(editId);
    if (!idNum) return;
    const row = items.find((g) => g.id === idNum);
    if (!row) return;
    startEdit(row);
  }, [searchParams, items]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [items]);

  function startCreate() {
    setFeedback(null);
    setDraft(emptyDraft());
  }

  function startEdit(row) {
    setFeedback(null);
    setDraft({
      id: row.id,
      title: row.title || '',
      description: row.description || '',
      platform_id: String(row.platform_id || ''),
      genre_id: row.genre_id ? String(row.genre_id) : '',
      release_year: row.release_year ? String(row.release_year) : '',
      cover_url: row.cover && /^https?:\/\//i.test(String(row.cover)) ? String(row.cover) : '',
      cover_current: row.cover ? String(row.cover) : '',
      remove_cover: false,
      cover: null,
    });
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        platform_id: Number(draft.platform_id),
        genre_id: draft.genre_id ? Number(draft.genre_id) : null,
        release_year: draft.release_year ? Number(draft.release_year) : null,
        ...(draft.remove_cover
          ? { cover: null }
          : draft.cover_url.trim()
            ? { cover: draft.cover_url.trim() }
            : {}),
      };

      let saved;
      if (draft.id) saved = await adminGames.updateGame(draft.id, payload);
      else saved = await adminGames.createGame(payload);

      if (draft.cover) {
        saved = await adminGames.uploadGameCover(saved.id, draft.cover);
      }

      setItems((prev) => {
        const idx = prev.findIndex((x) => x.id === saved.id);
        if (idx === -1) return [saved, ...prev];
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      });

      setDraft((d) => ({ ...d, id: saved.id, cover: null, remove_cover: false, cover_current: saved.cover || '' }));
      setFeedback({ ok: true, message: 'Guardado.' });
    } catch (err) {
      setFeedback({ ok: false, message: err?.message || 'No se pudo guardar.' });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm('¿Eliminar este juego?')) return;
    setSaving(true);
    setFeedback(null);
    try {
      await adminGames.deleteGame(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (draft.id === id) setDraft(emptyDraft());
      setFeedback({ ok: true, message: 'Eliminado.' });
    } catch (err) {
      setFeedback({ ok: false, message: err?.message || 'No se pudo eliminar.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) return <Alert>{error}</Alert>;

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-retro-accent">Admin · Juegos</h1>
          <p className="text-sm text-gray-300">Crear/editar/borrar juegos (solo admin).</p>
        </div>
        <Link className="text-sm text-retro-accent hover:underline" to="/">
          Volver al catálogo
        </Link>
      </div>

      {feedback ? <Alert variant={feedback.ok ? 'info' : 'error'}>{feedback.message}</Alert> : null}

      <div className="rounded-lg border border-retro-border bg-retro-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{draft.id ? `Editando #${draft.id}` : 'Crear juego'}</div>
          <Button variant="secondary" onClick={startCreate} disabled={saving}>
            Nuevo
          </Button>
        </div>

        <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={submit}>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-300">Título</label>
            <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} required />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300">Plataforma</label>
            <Select value={draft.platform_id} onChange={(e) => setDraft((d) => ({ ...d, platform_id: e.target.value }))} required>
              <option value="" disabled>
                Selecciona…
              </option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300">Género</label>
            <Select value={draft.genre_id} onChange={(e) => setDraft((d) => ({ ...d, genre_id: e.target.value }))}>
              <option value="">(sin género)</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300">Año</label>
            <Input
              inputMode="numeric"
              value={draft.release_year}
              onChange={(e) => setDraft((d) => ({ ...d, release_year: e.target.value.replace(/[^\d]/g, '') }))}
              placeholder="1998"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300">Carátula (archivo, opcional)</label>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) =>
                setDraft((d) => ({ ...d, cover: e.target.files?.[0] || null, remove_cover: false }))
              }
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-300">Carátula (URL, opcional)</label>
            <Input
              value={draft.cover_url}
              onChange={(e) => setDraft((d) => ({ ...d, cover_url: e.target.value, remove_cover: false }))}
              placeholder="https://.../cover.jpg"
            />
            <p className="text-xs text-gray-400">
              Si subes archivo, el upload sobrescribe la URL.
            </p>
          </div>

          {draft.id && draft.cover_current ? (
            <div className="space-y-2 md:col-span-2">
              <div className="text-xs text-gray-300">Carátula actual</div>
              <div className="flex items-center gap-3">
                <img
                  alt=""
                  className="h-20 w-14 rounded border border-retro-border object-cover"
                  src={getCoverUrl(draft.cover_current)}
                  loading="lazy"
                />
                <Button
                  variant="danger"
                  type="button"
                  disabled={saving}
                  onClick={() => setDraft((d) => ({ ...d, remove_cover: true, cover: null, cover_url: '' }))}
                >
                  Eliminar carátula
                </Button>
              </div>
              {draft.remove_cover ? (
                <p className="text-xs text-gray-400">
                  Se eliminará al guardar.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-300">Descripción</label>
            <Textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-end gap-2 md:col-span-2">
            {draft.id ? (
              <Button variant="danger" disabled={saving} onClick={() => onDelete(draft.id)}>
                Eliminar
              </Button>
            ) : null}
            <Button variant="secondary" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-retro-border bg-retro-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-retro-border text-xs text-gray-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Plataforma</th>
                <th className="px-4 py-3">Género</th>
                <th className="px-4 py-3">Año</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-retro-border">
              {sortedItems.map((g) => (
                <tr key={g.id} className="hover:bg-retro-surface/70">
                  <td className="px-4 py-3 text-xs text-gray-300">{g.id}</td>
                  <td className="px-4 py-3">{g.title}</td>
                  <td className="px-4 py-3 text-xs text-gray-300">{g.platform_name || g.platform_id}</td>
                  <td className="px-4 py-3 text-xs text-gray-300">{g.genre_name || '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-300">{g.release_year || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="secondary" onClick={() => startEdit(g)} disabled={saving}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
              {sortedItems.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-gray-300" colSpan={6}>
                    No hay juegos.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

