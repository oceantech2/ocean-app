import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIdioma } from './idioma';
import { paginaDoCaminho } from './rotas';

export function useIrParaContato() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { caminho } = useIdioma();
  return (e?: MouseEvent) => {
    e?.preventDefault();
    if (paginaDoCaminho(pathname) === 'home') {
      document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(caminho('home', 'contato'));
    }
  };
}
