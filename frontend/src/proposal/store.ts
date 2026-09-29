import { create } from 'zustand';
import { PAPEL_KEY, TOKEN_KEY, USUARIO_KEY } from './services/proposalApi';

interface ProposalAuthState {
  isAuthenticated: boolean;
  usuario: string | null;
  papel: string | null;
  login: (token: string, usuario: string, papel: string) => void;
  logout: () => void;
}

export const useProposalAuthStore = create<ProposalAuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  usuario: localStorage.getItem(USUARIO_KEY),
  papel: localStorage.getItem(PAPEL_KEY),
  login: (token, usuario, papel) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, usuario);
    localStorage.setItem(PAPEL_KEY, papel);
    set({ isAuthenticated: true, usuario, papel });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    localStorage.removeItem(PAPEL_KEY);
    set({ isAuthenticated: false, usuario: null, papel: null });
  },
}));
