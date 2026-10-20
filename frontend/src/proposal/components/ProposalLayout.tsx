import { ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useProposalAuthStore } from '../store';

const navCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
    isActive ? 'bg-ocean-50 text-ocean-800' : 'text-gray-600 hover:bg-gray-100'
  }`;

export default function ProposalLayout({ children }: { children: ReactNode }) {
  const { usuario, logout } = useProposalAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const emModelos = pathname.startsWith('/modelos');

  const sair = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src="/logo.png" alt="Ocean" className="h-9 w-auto" />
              <span className="hidden md:inline text-lg font-semibold text-ocean-900 whitespace-nowrap">Consultant Panel</span>
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink to="/" className={navCls({ isActive: !emModelos && pathname !== '/perfil' })}>
                Propostas
              </NavLink>
              <NavLink to="/modelos" className={navCls}>
                Modelos
              </NavLink>
            </nav>
          </div>
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
