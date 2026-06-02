import { apiFetch } from './api';

export async function createGame(payload) {
  const res = await apiFetch('/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateGame(id, payload) {
  const res = await apiFetch(`/games/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteGame(id) {
  const res = await apiFetch(`/games/${id}`, { method: 'DELETE' });
  return res.data;
}

export async function uploadGameCover(id, file) {
  const fd = new FormData();
  fd.append('cover', file);

  const res = await apiFetch(`/games/${id}/cover`, {
    method: 'PATCH',
    body: fd,
  });
  return res.data;
}

