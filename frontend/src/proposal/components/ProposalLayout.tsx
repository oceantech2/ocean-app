import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProposalAuthStore } from '../store';

export default function ProposalLayout({ children }: { children: ReactNode }) {
  const { usuario, logout } = useProposalAuthStore();
  const navigate = useNavigate();

  const sair = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Ocean" className="h-9 w-auto" />
            <span className="text-lg font-semibold text-ocean-900">Proposal</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">{usuario}</span>
            <Link to="/perfil" className="text-sm text-ocean-700 hover:underline">
              Meu perfil
            </Link>
            <button
              onClick={sair}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
