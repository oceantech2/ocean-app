import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Label, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { relatoriosService, metasService, contasService, saldosService } from '../services/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const ANO_ATUAL = new Date().getFullYear();
const MES_ATUAL = new Date().getMonth() + 1;
const MESES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ANOS = Array.from({ length: 2100 - 2024 + 1 }, (_, i) => 2024 + i);

const fmt = (v: number) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtPct = (parte: number, total: number) => {
  if (!total || !Number.isFinite(parte) || parte === 0) return null;
  return `${((parte / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
};

/** % pré-calculada (dataKey) centrada no segmento da barra */
function DrePctLabel(props: {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
  value?: string | number | null;
}) {
  const { viewBox, value } = props;
  if (value == null || value === '' || !viewBox) return null;
  const { x = 0, y = 0, width = 0, height = 0 } = viewBox;
  if (height < 12 || width < 14) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={700}
      style={{ pointerEvents: 'none' }}
    >
      {String(value)}
    </text>
  );
}

/** Tooltip do DRE via portal — flutuante no viewport, sem scroll interno do card */
function DreFloatingTooltip({
  active,
  payload,
  label,
  mousePos,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    payload?: { lucro?: number };
    dataKey?: string;
  }>;
  label?: string;
  mousePos: { x: number; y: number };
}) {
  if (!active || !payload?.length) return null;

  const OFFSET = 16;
  const EST_W = 220;
  const EST_H = 24 + payload.length * 22;
  let left = mousePos.x + OFFSET;
  let top = mousePos.y + OFFSET;
  if (typeof window !== 'undefined') {
    if (left + EST_W > window.innerWidth - 8) left = mousePos.x - EST_W - OFFSET;
    if (top + EST_H > window.innerHeight - 8) top = mousePos.y - EST_H - OFFSET;
    left = Math.max(8, left);
    top = Math.max(8, top);
  }

  return createPortal(
    <div
      className="rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 shadow-lg text-xs text-gray-800 dark:text-gray-100"
      style={{
        position: 'fixed',
        left,
        top,
        zIndex: 9999,
        pointerEvents: 'none',
        minWidth: 160,
      }}
    >
      <p className="font-semibold mb-1.5">{label}</p>
      <ul className="space-y-1">
        {payload.map((item) => {
          const nome = item.name ?? '';
          const lucroReal = nome === 'Lucro' ? item.payload?.lucro : undefined;
          const valor = lucroReal != null ? lucroReal : Number(item.value) || 0;
          return (
            <li key={String(item.dataKey ?? nome)} className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-gray-500 dark:text-gray-400">{nome}:</span>
              <span className="font-medium ml-auto">{fmt(valor)}</span>
            </li>
          );
        })}
      </ul>
    </div>,
    document.body,
  );
}

/** % pequena no meio de cada fatia do donut (oculta fatias < 5%) */
function DonutPctLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  const pct = (Math.round(percent * 1000) / 10).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  return (
    <text
      x={x}
      y={y}
      fill="rgba(255,255,255,0.85)"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={9}
      fontWeight={500}
      style={{ pointerEvents: 'none' }}
    >
      {pct}%
    </text>
  );
}

const CENTRO_LABEL: Record<string, string> = {
  adm_financeiro: 'Adm/Financeiro',
  operacoes: 'Operações',
  marketing: 'Marketing',
  comercial: 'Comercial',
  recursos_humanos: 'Recursos Humanos',
  tecnologia: 'Tecnologia',
  impostos: 'Impostos',
  pendente: 'Pendente de reclassificação',
  // legado (compat)
  SALARIO: 'Salário', salario: 'Salário',
  BONUS: 'Bônus', bonus: 'Bônus',
  IMPOSTOS: 'Impostos',
  ADMINISTRATIVO: 'Administrativo', administrativo: 'Administrativo',
  RETIRADA_LUCRO: 'Retirada de Lucro', retirada_lucro: 'Retirada de Lucro',
  REEMBOLSOS: 'Reembolsos', reembolsos: 'Reembolsos',
  EVENTO: 'Evento', evento: 'Evento',
};

const CENTRO_COR: Record<string, string> = {
  adm_financeiro: '#F59E0B',
  operacoes: '#84CC16',
  marketing: '#EC4899',
  comercial: '#F97316',
  recursos_humanos: '#3B82F6',
  tecnologia: '#06B6D4',
  impostos: '#9CA3AF',
  pendente: '#A855F7',
  salario: '#3B82F6',
  bonus: '#8B5CF6',
  administrativo: '#F59E0B',
  retirada_lucro: '#EF4444',
  reembolsos: '#14B8A6',
  evento: '#EC4899',
};
const FALLBACK_CORES = ['#6366F1', '#84CC16', '#F97316', '#06B6D4', '#A855F7'];

const centroLabel = (v: string) => CENTRO_LABEL[v] ?? v;
const centroCor = (v: string, i: number) =>
  CENTRO_COR[v.toLowerCase()] ?? FALLBACK_CORES[i % FALLBACK_CORES.length];

type DrePonto = {
  mes: string;
  receita_bruta: number;
  despesa: number;
  impostos: number;
  lucro: number;
  lucro_empilhado: number;
  despesa_pct: string | null;
  impostos_pct: string | null;
  lucro_pct: string | null;
};

type CustoFatia = {
  categoria: string;
  nome: string;
  valor: number;
  percentual: number;
  fill: string;
};

function PencilIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function cortarEixoDre(dados: DrePonto[], anoSelecionado: number): DrePonto[] {
  if (anoSelecionado > ANO_ATUAL) return [];
  if (anoSelecionado === ANO_ATUAL) return dados.slice(0, MES_ATUAL);
  return dados;
}

/** Último mês selecionável no filtro (ano corrente: até mês atual; demais: 12). */
function maxMesPermitido(anoSelecionado: number): number {
  if (anoSelecionado === ANO_ATUAL) return MES_ATUAL;
  if (anoSelecionado < ANO_ATUAL) return 12;
  return 12; // ano futuro: opções existem, dados ficam vazios
}

function mesesPermitidos(anoSelecionado: number): number[] {
  const max = maxMesPermitido(anoSelecionado);
  return Array.from({ length: max }, (_, i) => i + 1);
}

export default function Dashboard() {
  const papel = useAuthStore((s) => s.papel);
  const [ano, setAno] = useState(ANO_ATUAL);
  const [mes, setMes] = useState(MES_ATUAL);
  const [loading, setLoading] = useState(true);
  const [mostrarAnterior, setMostrarAnterior] = useState(true);
  const [anoComparar, setAnoComparar] = useState(ANO_ATUAL - 1);
  const [faturamento, setFaturamento] = useState<any[]>([]);
  const [, setFechamentos] = useState({ retainer: 0, sucesso: 0 });
  const [resumo, setResumo] = useState({
    faturamento_liquido_pago: 0,
    faturamento_bruto_pago: 0,
    faturamento_bruto_pendente: 0,
    quantidade_pagas: 0,
    quantidade_pendentes: 0,
  });

  // Meta do mês corrente
  const [meta, setMeta] = useState<any>(null);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [valorMeta, setValorMeta] = useState('');

  // Meta anual
  const [metaAnual, setMetaAnual] = useState<any>(null);
  const [editandoMetaAnual, setEditandoMetaAnual] = useState(false);
  const [valorMetaAnual, setValorMetaAnual] = useState('');

  // Retirada de Lucro e Saldos
  const [, setTotalRetiradas] = useState(0);
  const [saldoCorrente, setSaldoCorrente] = useState<any>(null);
  const [saldoInvestimento, setSaldoInvestimento] = useState<any>(null);

  // DRE
  const [dre, setDre] = useState<DrePonto[]>([]);
  const [dreErro, setDreErro] = useState<string | null>(null);
  const [mostrarReceita, setMostrarReceita] = useState(true);
  const [mostrarDespesa, setMostrarDespesa] = useState(true);
  const [mostrarImpostos, setMostrarImpostos] = useState(true);
  const [mostrarLucro, setMostrarLucro] = useState(true);
  const dreMousePos = useRef({ x: 0, y: 0 });
  const dreRaf = useRef(0);
  const [dreTipPos, setDreTipPos] = useState({ x: 0, y: 0 });

  // Custo por categoria (donut)
  const [custoFatias, setCustoFatias] = useState<CustoFatia[]>([]);
  const [custoTotal, setCustoTotal] = useState(0);
  const [custoErro, setCustoErro] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [ano, mes, anoComparar]);

  const alterarAno = (novoAno: number) => {
    const max = maxMesPermitido(novoAno);
    setAno(novoAno);
    if (mes > max) setMes(max);
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      setDreErro(null);
      setCustoErro(null);

      const carregarCusto = ano <= ANO_ATUAL;
      const custoPromise =
        !carregarCusto
          ? Promise.resolve({ data: null as any })
          : relatoriosService
              .custoPorCategoria(ano, mes, mes)
              .catch(() => {
                setCustoErro('Não foi possível carregar o custo por categoria');
                return { data: null };
              });

      const [faturRes, faturAntRes, fechRes, resumoRes, metaRes, metaAnualRes, retiradasRes, saldosRes, dreRes, custoRes] = await Promise.all([
        relatoriosService.faturamentoLiquidoMes(ano),
        relatoriosService.faturamentoLiquidoMes(anoComparar),
        relatoriosService.fechamentosPorTipo(ano),
        relatoriosService.resumoFinanceiro(ano, mes),
        metasService.progresso(mes, ano).catch(() => ({ data: null })),
        metasService.progresso(0, ano).catch(() => ({ data: null })),
        contasService.listar(0, 500, 'recursos_humanos', undefined, 'retirada_socios').catch(() => ({ data: [] })),
        saldosService.listar(undefined, ano).catch(() => ({ data: [] })),
        relatoriosService.dreMensal(ano).catch(() => {
          setDreErro('Não foi possível carregar o DRE');
          return { data: null };
        }),
        custoPromise,
      ]);

      const ant: Record<number, number> = {};
      (faturAntRes.data.dados || []).forEach((d: any) => { ant[d.mes] = d.valor; });
      setFaturamento(
        (faturRes.data.dados || []).map((d: any) => ({
          mes: MESES_NOME[d.mes - 1] || d.mes,
          valor: d.valor,
          valorAnterior: ant[d.mes] || 0,
        }))
      );
      setFechamentos(fechRes.data || {});
      setResumo(resumoRes.data || {});
      setMeta(metaRes.data);
      setValorMeta(metaRes.data?.valor_meta ? String(metaRes.data.valor_meta) : '');
      setMetaAnual(metaAnualRes.data);
      setValorMetaAnual(metaAnualRes.data?.valor_meta ? String(metaAnualRes.data.valor_meta) : '');

      // Retirada de lucro do ano — usa data_pagamento se disponível, senão data_vencimento
      const retiradas = (retiradasRes.data || []).filter((c: any) => {
        const dataRef = c.data_pagamento || c.data_vencimento;
        return dataRef && new Date(dataRef).getFullYear() === ano;
      });
      setTotalRetiradas(retiradas.reduce((s: number, c: any) => s + c.valor, 0));

      // Saldo: mais recente ≤ mês filtrado no ano
      const saldosLista: any[] = saldosRes.data || [];
      const saldosAteMes = saldosLista.filter((s) => s.ano === ano && s.mes <= mes);
      const corrente = [...saldosAteMes].filter((s) => s.conta === 'corrente').sort((a, b) => b.mes - a.mes)[0] || null;
      const investimento = [...saldosAteMes].filter((s) => s.conta === 'investimento').sort((a, b) => b.mes - a.mes)[0] || null;
      setSaldoCorrente(corrente);
      setSaldoInvestimento(investimento);

      const dreBruto: DrePonto[] = (dreRes.data?.dados || []).map((d: any) => {
        const receita_bruta = Number(d.receita_bruta) || 0;
        const despesa = Number(d.despesa) || 0;
        const impostos = Number(d.impostos) || 0;
        const lucro = Number(d.lucro) || 0;
        return {
          mes: MESES_NOME[d.mes - 1] || String(d.mes),
          receita_bruta,
          despesa,
          impostos,
          lucro,
          lucro_empilhado: Math.max(0, lucro),
          despesa_pct: fmtPct(despesa, receita_bruta),
          impostos_pct: fmtPct(impostos, receita_bruta),
          lucro_pct: fmtPct(Math.max(0, lucro), receita_bruta),
        };
      });
      setDre(cortarEixoDre(dreBruto, ano));

      if (!carregarCusto || !custoRes.data) {
        setCustoFatias([]);
        setCustoTotal(0);
      } else {
        const total = Number(custoRes.data.total) || 0;
        const fatias: CustoFatia[] = (custoRes.data.categorias || []).map((c: any, i: number) => {
          const cat = String(c.categoria || c.centro_custo || '');
          return {
            categoria: cat,
            nome: c.label || centroLabel(cat),
            valor: Number(c.valor) || 0,
            percentual: Number(c.percentual) || 0,
            fill: centroCor(cat, i),
          };
        });
        setCustoTotal(total);
        setCustoFatias(fatias);
      }
    } catch {
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const salvarMeta = async () => {
    try {
      await metasService.definir(mes, ano, parseFloat(valorMeta) || 0);
      toast.success('Meta atualizada!');
      setEditandoMeta(false);
      carregarDados();
    } catch {
      toast.error('Erro ao salvar meta');
    }
  };

  const salvarMetaAnual = async () => {
    try {
      await metasService.definir(0, ano, parseFloat(valorMetaAnual) || 0);
      toast.success('Meta anual atualizada!');
      setEditandoMetaAnual(false);
      carregarDados();
    } catch {
      toast.error('Erro ao salvar meta anual');
    }
  };

  const metaMensalValida = Boolean(meta?.tem_meta && meta.valor_meta > 0);
  const metaAnualValida = Boolean(metaAnual?.tem_meta && metaAnual.valor_meta > 0);
  const rotuloMetaMensal = `Meta de Faturamento — ${MESES_NOME[mes - 1]}/${ano}`;
  const rotuloCusto = `Custo por categoria — ${MESES_NOME[mes - 1]}/${ano}`;
  const rotuloCustoVazio = `Sem despesas por categoria para ${MESES_NOME[mes - 1]}/${ano}`;

  const pct = metaMensalValida ? Math.min(meta.percentual, 100) : 0;
  const corBarra = pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : 'bg-orange-500';

  const totalAnualRealizado = faturamento.reduce((s, d) => s + (d.valor || 0), 0);
  const pctAnual = metaAnualValida
    ? Math.min((totalAnualRealizado / metaAnual.valor_meta) * 100, 100)
    : 0;
  const pctAnualDisplay = Math.round(pctAnual * 10) / 10;
  const corBarraAnual = pctAnual >= 100 ? 'bg-green-500' : pctAnual >= 60 ? 'bg-blue-500' : 'bg-orange-500';

  const dreTemValores = dre.some(
    (d) => d.receita_bruta || d.despesa || d.impostos || d.lucro
  );
  const algumaSerieDre =
    mostrarReceita || mostrarDespesa || mostrarImpostos || mostrarLucro;

  const toggleSerieDre = (dataKey: string) => {
    if (dataKey === 'receita_bruta') setMostrarReceita((v) => !v);
    else if (dataKey === 'despesa') setMostrarDespesa((v) => !v);
    else if (dataKey === 'impostos') setMostrarImpostos((v) => !v);
    else if (dataKey === 'lucro_empilhado') setMostrarLucro((v) => !v);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <span className="text-gray-400 dark:text-gray-500 text-lg font-light">—</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">Visão geral do desempenho financeiro</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={mostrarAnterior} onChange={(e) => setMostrarAnterior(e.target.checked)} className="rounded" />
            Comparar
          </label>
          {mostrarAnterior && (
            <select
              value={anoComparar}
              onChange={(e) => setAnoComparar(parseInt(e.target.value))}
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              {ANOS.filter((a) => a !== ano).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
          <label className="text-sm text-gray-500 dark:text-gray-400">Mês:</label>
          <select
            value={mes}
            onChange={(e) => setMes(parseInt(e.target.value, 10))}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            {mesesPermitidos(ano).map((m) => (
              <option key={m} value={m}>{MESES_NOME[m - 1]}</option>
            ))}
          </select>
          <label className="text-sm text-gray-500 dark:text-gray-400">Ano:</label>
          <select
            value={ano}
            onChange={(e) => alterarAno(parseInt(e.target.value))}
            className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Metas — anual primeiro, mensal segundo; lado a lado em md+ (~768px) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Meta Anual */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full flex flex-col">
              {editandoMetaAnual ? (
                <>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    Meta de Faturamento Anual — {ano}
                  </p>
                  <div className="flex items-end gap-3 flex-wrap">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Meta Anual (R$)</label>
                      <input
                        type="number"
                        className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-40"
                        value={valorMetaAnual}
                        onChange={(e) => setValorMetaAnual(e.target.value)}
                        placeholder="0,00"
                      />
                    </div>
                    <button onClick={salvarMetaAnual} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Salvar</button>
                    <button onClick={() => setEditandoMetaAnual(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 pr-8 mb-4">
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                      Meta de Faturamento Anual — {ano}
                    </span>
                  </div>
                  {papel === 'admin' && metaAnualValida && (
                    <button
                      type="button"
                      onClick={() => setEditandoMetaAnual(true)}
                      title="Editar meta"
                      aria-label="Editar meta anual"
                      className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <PencilIcon />
                    </button>
                  )}
                  {metaAnualValida ? (
                    <div className="mt-auto flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap shrink-0">
                        {fmt(totalAnualRealizado)}
                      </span>
                      <div className="flex-1 h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-0">
                        <div
                          className={`h-full ${corBarraAnual} transition-all flex items-center justify-end pr-2`}
                          style={{ width: `${pctAnual}%` }}
                        >
                          {pctAnual >= 18 && (
                            <span className="text-xs font-bold text-white">{pctAnualDisplay}%</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap shrink-0">
                        {fmt(metaAnual.valor_meta)}
                      </span>
                    </div>
                  ) : papel === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => setEditandoMetaAnual(true)}
                      className="mt-auto w-full py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      Criar meta
                    </button>
                  ) : (
                    <p className="mt-auto text-sm text-gray-400 dark:text-gray-500 text-center py-2">Sem meta cadastrada</p>
                  )}
                </>
              )}
            </div>

            {/* Meta de Faturamento (mês) */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full flex flex-col">
              {editandoMeta ? (
                <>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    {rotuloMetaMensal}
                  </p>
                  <div className="flex items-end gap-3 flex-wrap">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Meta (R$)</label>
                      <input
                        type="number"
                        className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-40"
                        value={valorMeta}
                        onChange={(e) => setValorMeta(e.target.value)}
                        placeholder="0,00"
                      />
                    </div>
                    <button onClick={salvarMeta} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Salvar</button>
                    <button onClick={() => setEditandoMeta(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 pr-8 mb-4">
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                      {rotuloMetaMensal}
                    </span>
                  </div>
                  {papel === 'admin' && metaMensalValida && (
                    <button
                      type="button"
                      onClick={() => setEditandoMeta(true)}
                      title="Editar meta"
                      aria-label="Editar meta do mês"
                      className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <PencilIcon />
                    </button>
                  )}
                  {metaMensalValida ? (
                    <div className="mt-auto flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap shrink-0">
                        {fmt(meta?.realizado ?? 0)}
                      </span>
                      <div className="flex-1 h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-0">
                        <div
                          className={`h-full ${corBarra} transition-all flex items-center justify-end pr-2`}
                          style={{ width: `${pct}%` }}
                        >
                          {pct >= 18 && (
                            <span className="text-xs font-bold text-white">{meta.percentual}%</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap shrink-0">
                        {fmt(meta.valor_meta)}
                      </span>
                    </div>
                  ) : papel === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => setEditandoMeta(true)}
                      className="mt-auto w-full py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      Criar meta
                    </button>
                  ) : (
                    <p className="mt-auto text-sm text-gray-400 dark:text-gray-500 text-center py-2">Sem meta cadastrada</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* KPI Cards — ordem: Bruto / Líquido / NFs com pagamento pendente (R$) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Faturamento Bruto</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {fmt(resumo.faturamento_bruto_pago)}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Valor total</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Faturamento Líquido</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {fmt(resumo.faturamento_liquido_pago)}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">{resumo.quantidade_pagas} NFs pagas</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">NFs com pagamento pendente (R$)</h3>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {fmt(resumo.faturamento_bruto_pendente ?? 0)}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                {resumo.quantidade_pendentes ?? 0} NFs pendentes
              </p>
            </div>
          </div>

          {/* Saldos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
              <h3 className="text-blue-600 dark:text-blue-400 text-sm font-medium">Saldo Conta Corrente</h3>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                {saldoCorrente ? fmt(saldoCorrente.saldo) : '—'}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                {saldoCorrente ? `${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][saldoCorrente.mes - 1]}/${saldoCorrente.ano}` : 'Sem registro'}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-5">
              <h3 className="text-green-600 dark:text-green-400 text-sm font-medium">Conta Investimento</h3>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                {saldoInvestimento ? fmt(saldoInvestimento.saldo) : '—'}
              </p>
              <p className="text-xs text-green-500 mt-1">
                {saldoInvestimento ? `${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][saldoInvestimento.mes - 1]}/${saldoInvestimento.ano}` : 'Sem registro'}
              </p>
            </div>
          </div>

          {/* DRE — abaixo dos saldos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">DRE — {ano}</h2>
            {dreErro ? (
              <p className="text-sm text-red-600 dark:text-red-400 py-8 text-center">{dreErro}</p>
            ) : !dreTemValores || dre.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
                Sem dados de DRE para {ano}
              </p>
            ) : !algumaSerieDre ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
                Nenhum aspecto selecionado — use a legenda para exibir séries
              </p>
            ) : (
              <div
                className="min-w-[320px]"
                onMouseMove={(e) => {
                  dreMousePos.current = { x: e.clientX, y: e.clientY };
                  if (dreRaf.current) return;
                  dreRaf.current = requestAnimationFrame(() => {
                    dreRaf.current = 0;
                    setDreTipPos(dreMousePos.current);
                  });
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dre} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      width={72}
                      tickFormatter={(v) =>
                        Number(v).toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
                      }
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(156, 163, 175, 0.12)' }}
                      wrapperStyle={{ visibility: 'hidden', pointerEvents: 'none' }}
                      content={<DreFloatingTooltip mousePos={dreTipPos} />}
                    />
                    <Legend
                      onClick={(e: any) => {
                        if (e?.dataKey) toggleSerieDre(String(e.dataKey));
                      }}
                      wrapperStyle={{ cursor: 'pointer' }}
                    />
                    <Bar
                      dataKey="receita_bruta"
                      name="Receita bruta"
                      stackId="receita"
                      fill="#3B82F6"
                      hide={!mostrarReceita}
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey="despesa"
                      name="Despesa"
                      stackId="composicao"
                      fill="#EF4444"
                      hide={!mostrarDespesa}
                      isAnimationActive={false}
                    >
                      <LabelList dataKey="despesa_pct" content={DrePctLabel} />
                    </Bar>
                    <Bar
                      dataKey="impostos"
                      name="Impostos"
                      stackId="composicao"
                      fill="#9CA3AF"
                      hide={!mostrarImpostos}
                      isAnimationActive={false}
                    >
                      <LabelList dataKey="impostos_pct" content={DrePctLabel} />
                    </Bar>
                    <Bar
                      dataKey="lucro_empilhado"
                      name="Lucro"
                      stackId="composicao"
                      fill="#22C55E"
                      hide={!mostrarLucro}
                      isAnimationActive={false}
                    >
                      <LabelList dataKey="lucro_pct" content={DrePctLabel} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {dre.some((d) => d.lucro < 0) && mostrarLucro && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Meses com prejuízo: Lucro negativo aparece no tooltip (sem segmento empilhado).
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Custo por categoria — donut abaixo do DRE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                {rotuloCusto}
              </h2>
              {custoErro ? (
                <p className="text-sm text-red-600 dark:text-red-400 py-8 text-center">{custoErro}</p>
              ) : custoTotal <= 0 || custoFatias.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
                  {rotuloCustoVazio}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={custoFatias}
                      dataKey="valor"
                      nameKey="nome"
                      cx="50%"
                      cy="45%"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={1}
                      label={DonutPctLabel}
                      labelLine={false}
                    >
                      {custoFatias.map((f) => (
                        <Cell key={f.categoria} fill={f.fill} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
                          const { cx, cy } = viewBox as { cx: number; cy: number };
                          return (
                            <g>
                              <text
                                x={cx}
                                y={cy - 8}
                                textAnchor="middle"
                                fill="#9CA3AF"
                                style={{ fontSize: 10 }}
                              >
                                Total
                              </text>
                              <text
                                x={cx}
                                y={cy + 10}
                                textAnchor="middle"
                                fill="#1F2937"
                                style={{ fontSize: 12, fontWeight: 600 }}
                              >
                                {fmt(custoTotal)}
                              </text>
                            </g>
                          );
                        }}
                      />
                    </Pie>
                    <Tooltip
                      formatter={(_value: any, _name: string, item: any) => {
                        const p = item?.payload as CustoFatia | undefined;
                        if (!p) return ['', ''];
                        const pct = (Math.round(p.percentual * 10) / 10).toLocaleString('pt-BR', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        });
                        return [`${fmt(p.valor)} (${pct}%)`, p.nome];
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      formatter={(value: string, entry: any) => {
                        const p = entry?.payload as CustoFatia | undefined;
                        const pct = p
                          ? (Math.round(p.percentual * 10) / 10).toLocaleString('pt-BR', {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })
                          : '';
                        return pct ? `${value} (${pct}%)` : value;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Slot reservado (half-width desktop) */}
            <div className="hidden md:block" aria-hidden="true" />
          </div>

          {/* Gráficos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Faturamento Líquido por Mês</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={faturamento}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                  <Legend />
                  {mostrarAnterior && (
                    <Line type="monotone" dataKey="valorAnterior" stroke="#9CA3AF" strokeDasharray="5 5" dot={{ r: 2 }} name={`${anoComparar}`} />
                  )}
                  <Line type="monotone" dataKey="valor" stroke="#3B82F6" dot={{ r: 3 }} name={`${ano}`} />
                </LineChart>
              </ResponsiveContainer>
          </div>

          {/* Próximas Ações */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Próximas Ações</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-1">
              <p>• Acompanhar {resumo.quantidade_pendentes} NFs pendentes</p>
              <p>• Revisar prazos de vencimento</p>
              <p>• Processar bônus do mês</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
