import { useCallback, useEffect, useMemo, useState } from 'react';
import { getToken, setToken } from '../services/api';
import * as authService from '../services/authService';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return null;
    }
    const me = await authService.me();
    setUser(me);
    return me;
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedUser } = await authService.login(email, password);
    // Si el backend devolvió user (login) lo usamos; si no, pedimos /me
    if (loggedUser) {
      setUser(loggedUser);
      return loggedUser;
    }
    return await refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await refreshMe();
      } catch {
        // token inválido/expirado: el apiFetch ya hace logout en 401
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const onForcedLogout = () => logout();
    window.addEventListener('auth:logout', onForcedLogout);

    return () => {
      alive = false;
      window.removeEventListener('auth:logout', onForcedLogout);
    };
  }, [logout, refreshMe]);

  const value = useMemo(() => {
    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';
    return {
      user,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      refreshMe,
    };
  }, [user, loading, login, logout, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
