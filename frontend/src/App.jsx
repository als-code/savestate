import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { HomePage } from './pages/HomePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useAuth } from './context/useAuth';
import { MyBacklogPage } from './pages/MyBacklogPage';
import { AdminGamesPage } from './pages/AdminGamesPage';

export default function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const allowDevRegister = import.meta.env.DEV;

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/:id" element={<GameDetailPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        {allowDevRegister ? (
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
          />
        ) : null}

        <Route element={<PrivateRoute />}>
          <Route path="/my-backlog" element={<MyBacklogPage />} />
        </Route>

        <Route element={<PrivateRoute adminOnly />}>
          <Route path="/admin/games" element={<AdminGamesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace state={{ from: location }} />} />
      </Routes>
    </MainLayout>
  );
}
