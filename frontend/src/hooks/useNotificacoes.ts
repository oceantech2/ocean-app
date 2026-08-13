import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { nfsService, contasService, feriasService } from '../services/api';
import { useAuthStore, useNotifStore } from '../store';
import { hojeISO, compararVencimento, venceEmMenosDe7Dias } from '../utils/dataCivil';

export interface Notificacoes {
  nfsVencidas: number;
  contasVencidas: number;
  contasVenceHoje: number;
  contasVence7Dias: number;
  contasAlertasTotal: number;
  nfsSemNumero: number;
  feriasAguardando: number;
  total: number;
}

const INTERVALO_MS = 30_000;

const VAZIO: Notificacoes = {
  nfsVencidas: 0,
  contasVencidas: 0,
  contasVenceHoje: 0,
  contasVence7Dias: 0,
  contasAlertasTotal: 0,
  nfsSemNumero: 0,
  feriasAguardando: 0,
  total: 0,
};

export function useNotificacoes(): Notificacoes {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const notifTick = useNotifStore((s) => s.notifTick);
  const location = useLocation();
  const [dados, setDados] = useState<Notificacoes>(VAZIO);

  useEffect(() => {
    if (!isAuthenticated) return;

    const buscar = async () => {
      try {
        const hoje = hojeISO();
        const [nfsVencidasRes, nfsTodasRes, contasRes, feriasRes] = await Promise.all([
          nfsService.listar(0, 200, undefined, undefined, 'vencida'),
          nfsService.listar(0, 200, undefined, undefined, undefined, false),
          contasService.listar(0, 200),
          feriasService.listar(0, 200),
        ]);

        const nfsVencidas = Array.isArray(nfsVencidasRes.data) ? nfsVencidasRes.data.length : 0;
        const nfsSemNumero = Array.isArray(nfsTodasRes.data)
          ? nfsTodasRes.data.filter((n: { numero?: string | null; status?: string; arquivada?: boolean }) =>
            !n.arquivada
            && n.status !== 'cancelada'
            && !(n.numero ?? '').trim())
            .length
          : 0;
        const contas = Array.isArray(contasRes.data) ? contasRes.data : [];
        const contasVencidas = contas.filter((c: { pago?: boolean; data_vencimento?: string | null }) =>
          !c.pago && compararVencimento(c.data_vencimento, hoje) === -1).length;
        const contasVenceHoje = contas.filter((c: { pago?: boolean; data_vencimento?: string | null }) =>
          !c.pago && compararVencimento(c.data_vencimento, hoje) === 0).length;
        const contasVence7Dias = contas.filter((c: { pago?: boolean; data_vencimento?: string | null }) =>
          !c.pago && venceEmMenosDe7Dias(c.data_vencimento, hoje)).length;
        const feriasAguardando = Array.isArray(feriasRes.data)
          ? feriasRes.data.filter((f: { aprovado?: boolean }) => !f.aprovado).length
          : 0;

        setDados({
          nfsVencidas,
          contasVencidas,
          contasVenceHoje,
          contasVence7Dias,
          contasAlertasTotal: contasVencidas + contasVenceHoje + contasVence7Dias,
          nfsSemNumero,
          feriasAguardando,
          total: nfsVencidas + contasVencidas + contasVenceHoje + contasVence7Dias + nfsSemNumero + feriasAguardando,
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
