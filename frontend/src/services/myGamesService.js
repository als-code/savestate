import { apiFetch } from './api';

export async function listMyGames() {
  const res = await apiFetch('/my-games');
  return res.data;
}

export async function getMyGame(gameId) {
  const res = await apiFetch(`/my-games/${gameId}`);
  return res.data;
}

export async function patchMyGameStatus(gameId, payload) {
  const res = await apiFetch(`/my-games/${gameId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function removeMyGame(gameId) {
  const res = await apiFetch(`/my-games/${gameId}`, { method: 'DELETE' });
  return res.data;
}

