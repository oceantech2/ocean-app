import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { paginaVisivelGlobal } from '../utils/paginasCatalogo';

interface PaginaVisivelGuardProps {
  permKey: string;
  children: ReactNode;
}

export default function PaginaVisivelGuard({ permKey, children }: PaginaVisivelGuardProps) {
  const papel = useAuthStore((s) => s.papel);
  const paginasVisibilidade = useAuthStore((s) => s.paginasVisibilidade);

  if (!paginaVisivelGlobal(paginasVisibilidade, permKey) && papel === 'visualizador') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
