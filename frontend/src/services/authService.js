import { apiFetch, setToken } from './api';

export async function login(email, password) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const token = res?.data?.token;
  const user = res?.data?.user;
  if (token) setToken(token);
  return { token, user };
}

export async function me() {
  const res = await apiFetch('/auth/me');
  return res.data.user;
}

// En este proyecto el registro v1 está cerrado. Para práctica local,
// usamos la ruta de desarrollo que inserta en `users` y puede devolver 409.
export async function register({ email, display_name }) {
  if (!import.meta.env.DEV) {
    throw new Error('Registro deshabilitado en producción');
  }
  const res = await apiFetch('/dev/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, display_name }),
  });
  return res.data;
}

