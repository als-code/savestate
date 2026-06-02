import { apiFetch } from './api';

export async function listGenres() {
  const res = await apiFetch('/genres');
  return res.data;
}

