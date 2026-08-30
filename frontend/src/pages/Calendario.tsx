import { useState, useEffect } from 'react';
import { nfsService, contasService } from '../services/api';
import { NF, ContaPagar } from '../types';
import { useNotifStore } from '../store';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';
import ActionButton from '../components/ActionButton';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Evento {
  tipo: 'nf' | 'conta';
  titulo: string;
  valor: number;
  pago: boolean;
}

/** Classes Tailwind: chip da grade e bolinha do detalhe (Recebido/Pago = mesmo verde). */
function classesEvento(ev: Evento): { chip: string; dot: string } {
  if (ev.pago) {
    return {
      chip: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
      dot: 'bg-green-500',
    };
  }
  if (ev.tipo === 'nf') {
    return {
      chip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      dot: 'bg-blue-500',
    };
  }
  return {
    chip: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    dot: 'bg-orange-500',
  };
}

const LEGENDA = [
  { label: 'A receber', color: 'bg-blue-500' },
  { label: 'Recebido', color: 'bg-green-500' },
  { label: 'A pagar', color: 'bg-orange-500' },
  { label: 'Pago', color: 'bg-green-500' },
] as const;

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Calendario() {
  const calendarioTick = useNotifStore((s) => s.calendarioTick);

  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [loading, setLoading] = useState(true);
  const [nfs, setNfs] = useState<NF[]>([]);
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  useEffect(() => { carregar(); }, [calendarioTick]);

  const carregar = async () => {
    try {
      setLoading(true);
      const [nfsRes, contasRes] = await Promise.all([
        nfsService.listar(0, 500),
        contasService.listar(0, 500),
      ]);
      setNfs(nfsRes.data);
      setContas(contasRes.data);
    } catch {
      toast.error('Erro ao carregar calendário');
    } finally {
      setLoading(false);
    }
  };

  // Mapa de data (YYYY-MM-DD) -> eventos (NFs canceladas excluídas)
  const eventosPorDia: Record<string, Evento[]> = {};
  const addEvento = (data: string | undefined, ev: Evento) => {
    if (!data) return;
    const chave = data.split('T')[0];
    (eventosPorDia[chave] = eventosPorDia[chave] || []).push(ev);
  };
  nfs.forEach((nf) => {
    if (nf.status === 'cancelada' || !nf.data_vencimento) return;
    addEvento(nf.data_vencimento, {
      tipo: 'nf',
      titulo: `NF ${nf.numero} — ${nf.razao_social}`,
      valor: nf.valor_liquido,
      pago: nf.status === 'paga',
    });
  });
  contas.forEach((c) => c.data_vencimento && addEvento(c.data_vencimento, {
    tipo: 'conta',
    titulo: c.fornecedor_nome ? `${c.fornecedor_nome} — ${c.descricao}` : c.descricao,
    valor: c.valor,
    pago: c.pago,
  }));

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  const celulas: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  const chaveDia = (dia: number) => `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

  const navegar = (delta: number) => {
    let m = mes + delta, a = ano;
    if (m < 0) { m = 11; a--; } else if (m > 11) { m = 0; a++; }
    setMes(m); setAno(a); setDiaSelecionado(null);
  };

  const eventosSelecionados = diaSelecionado ? eventosPorDia[diaSelecionado] || [] : [];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Calendário de Vencimentos <span className="text-gray-500 dark:text-gray-400 font-normal text-base">— NFs e contas a pagar por data</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navegar(-1)} className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">←</button>
          <span className="font-semibold text-gray-800 dark:text-gray-100 w-40 text-center">{MESES[mes]} {ano}</span>
          <button onClick={() => navegar(1)} className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">→</button>
          <ActionButton
            variant="importar"
            context="header"
            label="Importar CSV"
            onClick={() => toast('Use as páginas NFs e Contas para importar dados', { icon: 'ℹ️' })}
          />
          <ActionButton
            variant="exportar-csv"
            context="header"
            label="Exportar CSV"
            onClick={() => exportarCSV(
              Object.entries(eventosPorDia).flatMap(([data, evts]) =>
                evts.map((e) => ({ Data: data, Tipo: e.tipo === 'nf' ? 'NF' : 'Conta', Título: e.titulo, Valor: e.valor, Status: e.pago ? 'Pago' : 'Pendente' }))
              ).sort((a, b) => a.Data.localeCompare(b.Data)),
              `calendario_${MESES[mes]}_${ano}`
            )}
          />
          <ActionButton variant="exportar-pdf" context="header" label="Exportar PDF" onClick={() => window.print()} />
        </div>
      </div>

      {/* Legenda — A receber / Recebido / A pagar / Pago */}
      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
        {LEGENDA.map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
            {item.label}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">{d}</div>
            ))}
          </div>
          {/* Grade de dias */}
          <div className="grid grid-cols-7 gap-1">
            {celulas.map((dia, i) => {
              if (dia === null) return <div key={i} className="min-h-[90px]"></div>;
              const chave = chaveDia(dia);
              const eventos = eventosPorDia[chave] || [];
              const ehHoje = chave === hojeStr;
              return (
                <button
                  key={i}
                  onClick={() => setDiaSelecionado(chave)}
                  className={`min-h-[90px] p-1.5 rounded-lg border text-left align-top transition ${
                    ehHoje ? 'border-blue-500 dark:border-blue-400' : 'border-gray-100 dark:border-gray-700'
                  } ${diaSelecionado === chave ? 'ring-2 ring-blue-400' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                >
                  <div className={`text-xs font-medium mb-1 ${ehHoje ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>{dia}</div>
                  <div className="space-y-0.5">
                    {eventos.slice(0, 3).map((ev, j) => (
                      <div
                        key={j}
                        className={`text-[10px] truncate px-1 py-0.5 rounded ${classesEvento(ev).chip}`}
                        title={ev.titulo}
                      >
                        {ev.titulo}
                      </div>
                    ))}
                    {eventos.length > 3 && (
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">+{eventos.length - 3} mais</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Detalhe do dia selecionado */}
      {diaSelecionado && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
            {new Date(diaSelecionado + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          {eventosSelecionados.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">Nenhum vencimento neste dia.</p>
          ) : (
            <div className="space-y-2">
              {eventosSelecionados.map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${classesEvento(ev).dot}`}></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{ev.titulo}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">({ev.tipo === 'nf' ? 'NF' : 'Conta'})</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{fmt(ev.valor)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
