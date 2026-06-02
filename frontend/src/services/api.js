const API_URL = import.meta.env.VITE_API_URL;

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (!token) localStorage.removeItem('token');
  else localStorage.setItem('token', token);
}

export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL no está configurado');
  }

  const token = getToken();
  const hasBody = options.body != null;
  const isFormData = hasBody && typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  // Si usamos FormData, NO forzamos Content-Type (fetch lo añade con boundary).
  if (isFormData && headers['Content-Type']) delete headers['Content-Type'];

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (res.status === 401) {
    setToken(null);
    window.dispatchEvent(new Event('auth:logout'));
  }

  if (!res.ok) {
    const err = data || { success: false, message: 'Error de red' };
    throw err;
  }

  return data;
}

