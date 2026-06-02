import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'Login inválido');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-card border border-retro-border/80 bg-retro-surface/75 p-6 shadow-card backdrop-blur">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-retro-accent">Login</h1>
          <p className="text-sm text-gray-300">Accede con un usuario ya creado en la BD.</p>
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-xs text-gray-300">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-300">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        {import.meta.env.DEV ? (
          <p className="text-xs text-gray-300">
            ¿No tienes usuario?{' '}
            <Link className="text-retro-accent hover:underline" to="/register">
              Crear (dev)
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

