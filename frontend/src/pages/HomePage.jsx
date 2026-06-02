import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listGames } from '../services/gamesService';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { GameCard } from '../components/games/GameCard';
import { GameCardSkeleton } from '../components/games/GameCardSkeleton';
import { getCoverUrl } from '../utils/coverUrl';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const q = searchParams.get('q') || '';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = 20;
  const offset = (page - 1) * limit;

  useEffect(() => {
    let alive = true;

    listGames({ q: q || undefined, limit, offset })
      .then((rows) => {
        if (!alive) return;
        setItems(rows);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message || 'Error cargando juegos');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [q, offset]);

  const genreId = searchParams.get('genre');
  const platformId = searchParams.get('platform');

  const genreOptions = useMemo(() => {
    const m = new Map();
    items.forEach((g) => {
      if (g.genre_id && g.genre_name) m.set(String(g.genre_id), g.genre_name);
    });
    return Array.from(m.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => ({ id, name }));
  }, [items]);

  const platformOptions = useMemo(() => {
    const m = new Map();
    items.forEach((g) => {
      if (g.platform_id && g.platform_name) m.set(String(g.platform_id), g.platform_name);
    });
    return Array.from(m.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([id, name]) => ({ id, name }));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((g) => {
      if (genreId && String(g.genre_id) !== String(genreId)) return false;
      if (platformId && String(g.platform_id) !== String(platformId)) return false;
      return true;
    });
  }, [items, genreId, platformId]);

  const hasActiveFilters = Boolean(q || genreId || platformId || page > 1);

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete('page');
    setSearchParams(next);
  }

  function setSearch(value) {
    const next = new URLSearchParams(searchParams);
    const v = (value || '').trim();
    if (!v) next.delete('q');
    else next.set('q', v);
    next.delete('page');
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  function setPage(nextPage) {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) next.delete('page');
    else next.set('page', String(nextPage));
    setSearchParams(next);
  }

  const heroCover = items.find((g) => g.cover)?.cover || null;
  const heroCoverUrl = getCoverUrl(heroCover);

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-card border border-retro-border/70 bg-retro-surface/35 shadow-card backdrop-blur">
        {heroCoverUrl ? (
          <img
            alt=""
            className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-35 blur-sm"
            src={heroCoverUrl}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_400px_at_20%_0%,rgba(59,130,246,0.22),transparent_60%),radial-gradient(900px_400px_at_80%_0%,rgba(99,102,241,0.16),transparent_60%)]" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/60 to-black/75" />

        <div className="p-6 sm:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Retro <span className="text-retro-accent">Backlog</span>
            </h1>
            <p className="max-w-2xl text-sm text-gray-200">
              Haz un seguimiento de tus juegos retro.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="w-full sm:w-72">
          <Input
            value={q}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título…"
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={genreId || ''} onChange={(e) => setFilter('genre', e.target.value)}>
            <option value="">Todos los géneros</option>
            {genreOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-56">
          <Select value={platformId || ''} onChange={(e) => setFilter('platform', e.target.value)}>
            <option value="">Todas las plataformas</option>
            {platformOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="button"
          className="w-full rounded-card border border-retro-border/80 bg-retro-surface/70 px-3 py-2 text-sm text-gray-100 transition hover:border-retro-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
        >
          Limpiar filtros
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <Alert>{error}</Alert>
      ) : filtered.length === 0 ? (
        <Alert variant="info">No hay juegos todavía.</Alert>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-gray-300">
              Página {page}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-card border border-retro-border/80 bg-retro-surface/70 px-3 py-2 text-sm text-gray-100 transition disabled:cursor-not-allowed disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              <button
                type="button"
                className="rounded-card border border-retro-border/80 bg-retro-surface/70 px-3 py-2 text-sm text-gray-100 transition disabled:cursor-not-allowed disabled:opacity-50"
                disabled={items.length < limit}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

