import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useIrParaContato() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (e?: MouseEvent) => {
    e?.preventDefault();
    if (pathname === '/') {
      document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#contato');
    }
  };
}
