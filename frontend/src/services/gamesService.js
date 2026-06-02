import { apiFetch } from './api';

export async function listGames(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.offset) qs.set('offset', String(params.offset));

  const path = qs.toString() ? `/games?${qs.toString()}` : '/games';
  const res = await apiFetch(path);
  return res.data;
}

export async function getGameById(id) {
  const res = await apiFetch(`/games/${id}`);
  return res.data;
}

