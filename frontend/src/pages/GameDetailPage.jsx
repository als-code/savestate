import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { getGameById } from '../services/gamesService';
import { createReview, listReviewsByGameId, updateOwnReview } from '../services/reviewsService';
import { useAuth } from '../context/useAuth';
import { apiFetch } from '../services/api';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { getCoverUrl } from '../utils/coverUrl';
import * as myGamesService from '../services/myGamesService';

export function GameDetailPage() {
  const { id } = useParams();
  const gameId = Number(id);
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addResult, setAddResult] = useState(null);
  const [backlogLoading, setBacklogLoading] = useState(false);
  const [backlogItem, setBacklogItem] = useState(null);
  const [backlogOwned, setBacklogOwned] = useState(false);
  const [backlogStatus, setBacklogStatus] = useState('pending');
  const [backlogSaving, setBacklogSaving] = useState(false);
  const [backlogFeedback, setBacklogFeedback] = useState(null);
  const [reviewRating, setReviewRating] = useState('10');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState(null);

  useEffect(() => {
    let alive = true;

    Promise.all([getGameById(gameId), listReviewsByGameId(gameId)])
      .then(([g, r]) => {
        if (!alive) return;
        setGame(g);
        setReviews(r);
        const mine = user?.id ? r.find((x) => x.user_id === user.id) : null;
        if (mine) {
          setReviewRating(String(mine.rating));
          setReviewComment(mine.comment || '');
        }
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message || 'No se pudo cargar el juego');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [gameId, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let alive = true;
    Promise.resolve().then(() => {
      if (!alive) return;
      setBacklogLoading(true);
      setBacklogFeedback(null);
    });

    myGamesService
      .getMyGame(gameId)
      .then((it) => {
        if (!alive) return;
        setBacklogItem(it);
        setBacklogOwned(Boolean(it.owned));
        setBacklogStatus(it.status || 'pending');
      })
      .catch((err) => {
        if (!alive) return;
        // 404 => no está en backlog
        if (err?.message?.includes('No está en tu backlog')) {
          setBacklogItem(null);
          setBacklogOwned(false);
          setBacklogStatus('pending');
        }
      })
      .finally(() => {
        if (!alive) return;
        setBacklogLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [gameId, isAuthenticated]);

  async function addToBacklog() {
    setAdding(true);
    setAddResult(null);
    try {
      const created = await apiFetch(`/my-games/${gameId}`, { method: 'POST' });
      setBacklogItem(created.data);
      setBacklogOwned(Boolean(created.data?.owned));
      setBacklogStatus(created.data?.status || 'pending');
      setAddResult({ ok: true, message: 'Añadido a tu backlog.' });
    } catch (err) {
      setAddResult({ ok: false, message: err?.message || 'No se pudo añadir.' });
    } finally {
      setAdding(false);
    }
  }

  const backlogDirty = useMemo(() => {
    if (!backlogItem) return false;
    if (Boolean(backlogItem.owned) !== Boolean(backlogOwned)) return true;
    if (String(backlogItem.status || 'pending') !== String(backlogStatus)) return true;
    return false;
  }, [backlogItem, backlogOwned, backlogStatus]);

  async function saveBacklog() {
    if (!backlogItem) return;
    setBacklogSaving(true);
    setBacklogFeedback(null);
    try {
      const updated = await myGamesService.patchMyGameStatus(gameId, {
        owned: backlogOwned,
        status: backlogStatus,
        hours_played: backlogItem.hours_played ?? 0,
        notes: backlogItem.notes ?? null,
      });
      setBacklogItem(updated);
      setBacklogFeedback({ ok: true, message: 'Backlog actualizado.' });
    } catch (err) {
      setBacklogFeedback({ ok: false, message: err?.message || 'No se pudo actualizar.' });
    } finally {
      setBacklogSaving(false);
    }
  }

  const myExistingReview = user?.id ? reviews.find((r) => r.user_id === user.id) : null;

  async function submitReview(e) {
    e.preventDefault();
    setReviewSaving(true);
    setReviewFeedback(null);
    try {
      const payload = { game_id: gameId, rating: Number(reviewRating), comment: reviewComment || null };
      if (myExistingReview) {
        await updateOwnReview(payload);
        setReviewFeedback({ ok: true, message: 'Reseña actualizada.' });
      } else {
        await createReview(payload);
        setReviewFeedback({ ok: true, message: 'Reseña publicada.' });
      }
      const r = await listReviewsByGameId(gameId);
      setReviews(r);
    } catch (err) {
      setReviewFeedback({ ok: false, message: err?.message || 'No se pudo guardar la reseña.' });
    } finally {
      setReviewSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <Link className="text-sm text-retro-accent hover:underline" to="/">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (!game) return null;

  const coverUrl = getCoverUrl(game.cover);
  const adminEditUrl = `/admin/games?edit=${game.id}${
    searchParams.toString() ? `&from=${encodeURIComponent(`?${searchParams.toString()}`)}` : ''
  }`;

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-card border border-retro-border/70 bg-retro-surface/35 shadow-card backdrop-blur">
        {coverUrl ? (
          <img
            alt=""
            className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-40 blur-sm"
            src={coverUrl}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_400px_at_20%_0%,rgba(59,130,246,0.22),transparent_60%),radial-gradient(900px_400px_at_80%_0%,rgba(99,102,241,0.16),transparent_60%)]" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/35 via-black/60 to-black/80" />

        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:p-8">
          <div className="min-w-0 space-y-2">
            <div className="text-xs text-gray-200">
              {game.release_year ? `Año ${game.release_year}` : 'Año desconocido'}
              {game.platform_name ? ` · ${game.platform_name}` : ''}
              {game.genre_name ? ` · ${game.genre_name}` : ''}
            </div>
            <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">{game.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link className="text-sm text-retro-accent hover:underline" to="/">
              Volver
            </Link>
            {isAdmin ? (
              <Link className="text-sm text-retro-accent hover:underline" to={adminEditUrl}>
                ✎ Editar
              </Link>
            ) : null}
            {isAuthenticated ? (
              <Button variant="secondary" disabled={adding} onClick={addToBacklog}>
                {adding ? 'Añadiendo…' : 'Añadir a mi backlog'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[140px_1fr] gap-4 sm:grid-cols-[180px_1fr] sm:gap-6">
        <div className="overflow-hidden rounded-lg border border-retro-border bg-retro-surface md:sticky md:top-6">
          <div className="aspect-[3/4] w-full bg-black/20">
            {coverUrl ? (
              <img
                alt={game.title}
                className="h-full w-full object-cover"
                src={coverUrl}
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                Sin carátula
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-lg border border-retro-border bg-retro-surface p-4">
            <h2 className="mb-2 text-sm font-semibold">Descripción</h2>
            <p className="whitespace-pre-wrap text-sm text-gray-200">
              {game.description || 'Sin descripción.'}
            </p>
          </div>

          <div className="rounded-lg border border-retro-border bg-retro-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Mi backlog</h2>
              {isAuthenticated ? null : (
                <Link className="text-sm text-retro-accent hover:underline" to="/login">
                  Login para añadir
                </Link>
              )}
            </div>
            {addResult ? (
              <div className="mt-3">
                <Alert variant={addResult.ok ? 'info' : 'error'}>{addResult.message}</Alert>
              </div>
            ) : null}

            {isAuthenticated ? (
              <div className="mt-3 space-y-3">
                {backlogFeedback ? (
                  <Alert variant={backlogFeedback.ok ? 'info' : 'error'}>{backlogFeedback.message}</Alert>
                ) : null}

                {backlogLoading ? (
                  <div className="text-sm text-gray-300">Cargando estado…</div>
                ) : !backlogItem ? (
                  <Alert variant="info">Aún no está en tu backlog. Pulsa “Añadir a mi backlog”.</Alert>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 text-sm text-gray-200">
                      <input
                        type="checkbox"
                        checked={backlogOwned}
                        onChange={(e) => setBacklogOwned(e.target.checked)}
                      />
                      En propiedad
                    </label>

                    <div className="space-y-1">
                      <div className="text-xs text-gray-300">Estado</div>
                      <Select value={backlogStatus} onChange={(e) => setBacklogStatus(e.target.value)}>
                        <option value="pending">Pendiente</option>
                        <option value="playing">Jugando</option>
                        <option value="tested">Probado</option>
                        <option value="completed">Completado (terminado)</option>
                        <option value="abandoned">Abandonado</option>
                      </Select>
                    </div>

                    <div className="sm:col-span-2 flex justify-end">
                      <Button
                        variant="secondary"
                        disabled={!backlogDirty || backlogSaving}
                        onClick={saveBacklog}
                      >
                        {backlogSaving ? 'Guardando…' : 'Guardar cambios'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-retro-border bg-retro-surface p-4">
            <h2 className="mb-3 text-sm font-semibold">Reseñas</h2>

            {isAuthenticated ? (
              <div className="mb-4 space-y-3 rounded border border-retro-border bg-retro-bg/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-300">
                    {myExistingReview ? 'Edita tu reseña' : 'Publica tu reseña'}
                  </div>
                </div>

                {reviewFeedback ? (
                  <Alert variant={reviewFeedback.ok ? 'info' : 'error'}>{reviewFeedback.message}</Alert>
                ) : null}

                <form className="space-y-3" onSubmit={submitReview}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px,1fr]">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300">Rating</label>
                      <Select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                        {Array.from({ length: 10 }).map((_, i) => {
                          const v = String(i + 1);
                          return (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          );
                        })}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300">Comentario</label>
                      <Textarea
                        rows={2}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Opcional…"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="secondary" type="submit" disabled={reviewSaving}>
                      {reviewSaving ? 'Guardando…' : myExistingReview ? 'Actualizar' : 'Publicar'}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Alert variant="info">
                <Link className="text-retro-accent hover:underline" to="/login">
                  Login
                </Link>{' '}
                para publicar una reseña.
              </Alert>
            )}

            {reviews.length === 0 ? (
              <Alert variant="info">Aún no hay reseñas.</Alert>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded border border-retro-border bg-retro-bg/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-300">
                        {r.author_name || r.author_email || `Usuario #${r.user_id}`}
                      </div>
                      <div className="text-xs text-retro-accent">★ {r.rating}/10</div>
                    </div>
                    {r.comment ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-200">{r.comment}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

