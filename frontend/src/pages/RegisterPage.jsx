import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import * as authService from '../services/authService';

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await authService.register({ email: email.trim(), display_name: displayName.trim() });
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 300);
    } catch (err) {
      setError(err?.message || 'No se pudo crear el usuario');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-card border border-retro-border/80 bg-retro-surface/75 p-6 shadow-card backdrop-blur">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-retro-accent">Registro (dev)</h1>
          <p className="text-sm text-gray-300">
            En v1 el registro está cerrado; esto usa <code className="text-xs">/api/dev/users</code> solo para practicar.
          </p>
        </div>

        {error ? <Alert>{error}</Alert> : null}
        {done ? <Alert variant="info">Usuario creado. Ve a login.</Alert> : null}

        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-xs text-gray-300">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nuevo@email.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-300">Nombre</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear usuario'}
          </Button>
        </form>

        <p className="text-xs text-gray-300">
          ¿Ya tienes usuario? <Link className="text-retro-accent hover:underline" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

