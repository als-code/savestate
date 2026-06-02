import { apiFetch } from './api';

export async function listPlatforms() {
  const res = await apiFetch('/platforms');
  return res.data;
}

