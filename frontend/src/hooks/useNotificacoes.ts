import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { nfsService, contasService, feriasService } from '../services/api';
import { useAuthStore, useNotifStore } from '../store';

export interface Notificacoes {
  nfsVencidas: number;
  contasAtrasadas: number;
  feriasAguardando: number;
  total: number;
}

const INTERVALO_MS = 30_000; // atualiza a cada 30s

export function useNotificacoes(): Notificacoes {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const notifTick = useNotifStore((s) => s.notifTick);
  const location = useLocation();
  const [dados, setDados] = useState<Notificacoes>({
    nfsVencidas: 0,
    contasAtrasadas: 0,
    feriasAguardando: 0,
    total: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const buscar = async () => {
      try {
        const hoje = new Date().toISOString().split('T')[0];
        const [nfsRes, contasRes, feriasRes] = await Promise.all([
          nfsService.listar(0, 200, undefined, undefined, 'vencida'),
          contasService.listar(0, 200),
          feriasService.listar(0, 200),
        ]);

        const nfsVencidas = Array.isArray(nfsRes.data) ? nfsRes.data.length : 0;
        const contasAtrasadas = Array.isArray(contasRes.data)
          ? contasRes.data.filter((c: any) => !c.pago && c.data_vencimento < hoje).length
          : 0;
        const feriasAguardando = Array.isArray(feriasRes.data)
          ? feriasRes.data.filter((f: any) => !f.aprovado).length
          : 0;

        setDados({
          nfsVencidas,
          contasAtrasadas,
          feriasAguardando,
          total: nfsVencidas + contasAtrasadas + feriasAguardando,
        });
      } catch {
        // silencioso — não interrompe o layout
      }
    };

    buscar();
    const timer = setInterval(buscar, INTERVALO_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated, location.pathname, notifTick]);

  return dados;
}
