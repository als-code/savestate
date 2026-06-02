import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { Textarea } from '../components/ui/Textarea';
import * as myGamesService from '../services/myGamesService';

const statuses = [
  { id: 'pending', label: 'Pendiente', tone: 'pending' },
  { id: 'playing', label: 'Jugando', tone: 'playing' },
  { id: 'tested', label: 'Probado', tone: 'tested' },
  { id: 'completed', label: 'Completado', tone: 'completed' },
  { id: 'abandoned', label: 'Abandonado', tone: 'abandoned' },
];

function statusMeta(status) {
  return statuses.find((s) => s.id === status) || statuses[0];
}

export function MyBacklogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let alive = true;

    myGamesService
      .listMyGames()
      .then((rows) => {
        if (!alive) return;
        setItems(rows);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message || 'No se pudo cargar tu backlog');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const m = new Map(statuses.map((s) => [s.id, []]));
    items.forEach((it) => {
      if (!m.has(it.status)) m.set(it.status, []);
      m.get(it.status).push(it);
    });
    return m;
  }, [items]);

  function updateLocal(gameId, patch) {
    setItems((prev) => prev.map((x) => (x.game_id === gameId ? { ...x, ...patch } : x)));
  }

  async function saveRow(gameId, draft) {
    setSavingId(gameId);
    setFeedback(null);
    try {
      const updated = await myGamesService.patchMyGameStatus(gameId, draft);
      updateLocal(gameId, updated);
      setFeedback({ ok: true, message: 'Guardado.' });
    } catch (err) {
      setFeedback({ ok: false, message: err?.message || 'No se pudo guardar.' });
    } finally {
      setSavingId(null);
    }
  }

  async function removeRow(gameId) {
    setSavingId(gameId);
    setFeedback(null);
    try {
      await myGamesService.removeMyGame(gameId);
      setItems((prev) => prev.filter((x) => x.game_id !== gameId));
      setFeedback({ ok: true, message: 'Eliminado del backlog.' });
    } catch (err) {
      setFeedback({ ok: false, message: err?.message || 'No se pudo eliminar.' });
    } finally {
      setSavingId(null);
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
          <h1 className="text-2xl font-bold text-retro-accent">Mi backlog</h1>
          <p className="text-sm text-gray-300">Gestiona estado, horas y notas.</p>
        </div>
        <Link className="text-sm text-retro-accent hover:underline" to="/">
          Ir al catálogo
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((st) => {
          const count = (grouped.get(st.id) || []).length;
          return (
            <div
              key={st.id}
              className="rounded-lg border border-retro-border bg-retro-surface px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Badge tone={st.tone}>{st.label}</Badge>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {feedback ? <Alert variant={feedback.ok ? 'info' : 'error'}>{feedback.message}</Alert> : null}

      {items.length === 0 ? (
        <Alert variant="info">Aún no has añadido juegos.</Alert>
      ) : (
        <div className="space-y-6">
          {statuses.map((st) => {
            const rows = grouped.get(st.id) || [];
            if (rows.length === 0) return null;

            return (
              <div key={st.id} className="rounded-lg border border-retro-border bg-retro-surface">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={st.tone}>{st.label}</Badge>
                    <span className="text-xs text-gray-300">{rows.length}</span>
                  </div>
                </div>

                <div className="divide-y divide-retro-border">
                  {rows.map((it) => (
                    <BacklogRow
                      key={it.game_id}
                      item={it}
                      saving={savingId === it.game_id}
                      onSave={(draft) => saveRow(it.game_id, draft)}
                      onRemove={() => removeRow(it.game_id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function BacklogRow({ item, saving, onSave, onRemove }) {
  const [status, setStatus] = useState(item.status);
  const [hours, setHours] = useState(String(item.hours_played ?? 0));
  const [notes, setNotes] = useState(item.notes ?? '');

  const dirty =
    status !== item.status ||
    Number(hours || 0) !== Number(item.hours_played ?? 0) ||
    (notes || '') !== (item.notes ?? '');

  const meta = statusMeta(status);

  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-[1fr,260px] md:items-start">
      <div className="min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Link className="truncate text-sm font-semibold hover:underline" to={`/games/${item.game_id}`}>
            {item.title}
          </Link>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[180px,120px]">
          <div className="space-y-1">
            <label className="text-xs text-gray-300">Estado</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-300">Horas</label>
            <Input
              inputMode="numeric"
              value={hours}
              onChange={(e) => setHours(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-300">Notas</label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional…" />
        </div>
      </div>

      <div className="flex flex-col gap-2 md:items-end">
        <Button
          variant="secondary"
          className="w-full md:w-auto"
          disabled={!dirty || saving}
          onClick={() => onSave({ status, hours_played: Number(hours || 0), notes: notes || null })}
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button
          variant="danger"
          className="w-full md:w-auto"
          disabled={saving}
          onClick={onRemove}
        >
          Quitar
        </Button>
      </div>
    </div>
  );
}

