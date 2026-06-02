import { apiFetch } from './api';

export async function listReviewsByGameId(gameId) {
  const res = await apiFetch(`/games/${gameId}/reviews`);
  return res.data;
}

export async function createReview(payload) {
  const res = await apiFetch('/game-reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateOwnReview(payload) {
  const res = await apiFetch('/game-reviews', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.data;
}

