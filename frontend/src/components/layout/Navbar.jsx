import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/useAuth';

export function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  return (
    <header className="border-b border-retro-border/70 bg-retro-surface/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-retro-accent shadow-[0_0_0_3px_rgba(59,130,246,0.16)]" />
          <Link className="font-semibold tracking-wide hover:opacity-90" to="/">
            SaveState Retro Backlog
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link className="text-sm text-retro-accent hover:underline" to="/">
                Inicio
              </Link>
              <Link className="text-sm text-retro-accent hover:underline" to="/my-backlog">
                Mi backlog
              </Link>
              {isAdmin ? (
                <Link className="text-sm text-retro-accent hover:underline" to="/admin/games">
                  Admin
                </Link>
              ) : null}
              <div className="hidden text-xs text-gray-300 sm:block">
                {user?.display_name || user?.email}
                {isAdmin ? ' (admin)' : ''}
              </div>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link className="text-sm text-retro-accent hover:underline" to="/">
                Inicio
              </Link>
              <Link className="text-sm text-retro-accent hover:underline" to="/login">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

