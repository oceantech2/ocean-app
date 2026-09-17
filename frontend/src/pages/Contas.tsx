import { useState, useEffect, useRef, Fragment } from 'react';
import { contasService, colaboradoresService, contasCorrentesService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { ContaPagar, Colaborador, CatalogoCategoriasContas, ContaCorrente } from '../types';
import { usePageFilters, useAuthStore, useNotifStore } from '../store';
import { exportarCSV } from '../utils/export';
import { formatarMoedaInput, isValorMoedaValido, numberParaMoedaInput, parseMoedaInput } from '../utils/moeda';
import ImportCSV from '../components/ImportCSV';
import { hojeISO, compararVencimento, venceEmMenosDe7Dias } from '../utils/dataCivil';
import { CHAVE_SEM_VENCIMENTO, chaveMesVencimento, rotuloMesAnoColuna } from '../utils/contasPagarAgrupamento';
import { anosPermitidosContasPagar, mesesDisponiveis, passaFiltroMesAno } from '../utils/contasPagarFiltroMes';
import { caixaInicialForm, codigoPadrao, rotuloContaOrigem } from '../utils/fluxoCaixaMovimentos';
import { ACCEPT_NF, motivoArquivoNf } from '../utils/anexoNf';
import toast from 'react-hot-toast';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';
import { TABLE_SCROLL_CONTAINER_CLASS, TH_STICKY_CLASS } from '../utils/tableScroll';

const SENTINELA_NOVA = '__nova__';
const SENTINELA_NOVA_SUB = '__nova_sub__';

const MESES_NOME_LONGO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function mesAnoCorrentes() {
  const agora = new Date();
  return { mes: agora.getMonth() + 1, ano: agora.getFullYear() };
}

const LABELS_LEGADO: Record<string, string> = {
  administrativo: 'Administrativo (legado)',
  salario: 'Salário (legado)',
  bonus: 'Comissões (legado)',
  retirada_lucro: 'Retirada de Lucro (legado)',
  impostos: 'Impostos (legado)',
  imposto: 'Imposto (legado)',
  reembolsos: 'Reembolsos (legado)',
  evento: 'Evento (legado)',
};

const ALIASES_SUB_BONUS = new Set([
  'bônus',
  'bonus',
  'comissões',
  'comissoes',
  'bônus & comissão',
  'bonus & comissao',
  'bônus e comissão',
  'bonus e comissao',
]);

function resolverSubcategoriaImport(
  catalog: CatalogoCategoriasContas | null,
  bruto: string,
): string | null {
  const chave = bruto.trim().toLowerCase();
  if (!chave) return null;
  const doCatalogo = catalog?.subcategorias_rh.find(
    (s) => s.codigo.toLowerCase() === chave || s.nome.toLowerCase() === chave,
  );
  if (doCatalogo) return doCatalogo.codigo;
  if (ALIASES_SUB_BONUS.has(chave)) return 'bonus';
  return chave;
}

function nomeCategoriaCatalogo(
  catalog: CatalogoCategoriasContas | null,
  cat: string | null | undefined,
  sub?: string | null,
  pendente?: boolean,
) {
  if (!cat) return '—';
  if (pendente) return LABELS_LEGADO[cat] ?? cat;
  const oficial = catalog?.oficiais.find((o) => o.codigo === cat);
  const cadastrada = catalog?.cadastradas.find((o) => o.codigo === cat);
  const base = oficial?.nome ?? cadastrada?.nome ?? LABELS_LEGADO[cat] ?? cat;
  if (cat === 'recursos_humanos' && sub) {
    const subL = catalog?.subcategorias_rh.find((o) => o.codigo === sub)?.nome ?? sub;
    return `${base} / ${subL}`;
  }
  return base;
}

function validarNomeCategoriaLocal(nomeBruto: string): string | null {
  const nome = nomeBruto.trim();
  if (!nome) return 'Nome é obrigatório';
  if (nome.length > 20) return 'Nome deve ter no máximo 20 caracteres';
  if (['impostos', 'imposto'].includes(nome.toLowerCase())) {
    return 'Categoria Impostos não é mais válida; use o Tipo Imposto / DAS';
  }
  for (const ch of nome) {
    if (ch === '_' || !/^[\p{L}\p{N} \-/&]$/u.test(ch)) {
      return 'Use apenas letras, números, espaços, hífen, barra e &';
    }
  }
  return null;
}

const FORM_INICIAL = {
  descricao: '',
  categoria: 'adm_financeiro',
  subcategoria: '',
  valor: '',
  data_vencimento: '',
  data_pagamento: '',
  fornecedor_id: '',
  caixa: '',
  tipo_despesa: 'variavel' as 'fixo' | 'variavel' | 'imposto_das',
};

function labelTipoDespesa(tipo?: string | null) {
  const t = String(tipo || '').trim().toLowerCase();
  if (t === 'fixo') return 'Fixo';
  if (t === 'imposto_das') return 'Imposto / DAS';
  return 'Variável';
}

function ordemTipoDespesa(tipo?: string | null) {
  const t = String(tipo || '').trim().toLowerCase();
  if (t === 'fixo') return 0;
  if (t === 'imposto_das') return 2;
  return 1;
}

export default function Contas() {
  const papel = useAuthStore((s) => s.papel);
  const { contasCategoria, contasSubcategoria, contasPago, contasAlertaVencimento, setContasFilters } = usePageFilters();
  const triggerNotifRefresh = useNotifStore((s) => s.triggerNotifRefresh);
  const triggerCalendarioRefresh = useNotifStore((s) => s.triggerCalendarioRefresh);

  const xlsxInputRef = useRef<HTMLInputElement>(null);
  const comprovanteInputRef = useRef<HTMLInputElement>(null);
  const [uploadingComprovante, setUploadingComprovante] = useState<number | null>(null);
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [importandoXlsx, setImportandoXlsx] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [importAberto, setImportAberto] = useState(false);
  const [buscaDescricao, setBuscaDescricao] = useState('');
  const [arquivoNf, setArquivoNf] = useState<File | null>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [editando, setEditando] = useState<ContaPagar | null>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [fornecedores, setFornecedores] = useState<Colaborador[]>([]);
  const [contasCorrentes, setContasCorrentes] = useState<ContaCorrente[]>([]);
  const [pagoModal, setPagoModal] = useState<ContaPagar | null>(null);
  const [dataPagoForm, setDataPagoForm] = useState('');
  const [caixaPagoForm, setCaixaPagoForm] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sortField, setSortField] = useState<string>('data_vencimento');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [catalog, setCatalog] = useState<CatalogoCategoriasContas | null>(null);
  const [novaAberto, setNovaAberto] = useState(false);
  const [novaNome, setNovaNome] = useState('');
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);
  const [editCatId, setEditCatId] = useState<number | null>(null);
  const [editCatNome, setEditCatNome] = useState('');
  const [novaSubAberto, setNovaSubAberto] = useState(false);
  const [novaSubNome, setNovaSubNome] = useState('');
  const [editSubId, setEditSubId] = useState<number | null>(null);
  const [editSubNome, setEditSubNome] = useState('');
  const [salvandoSub, setSalvandoSub] = useState(false);
  const [contasMesTodos, setContasMesTodos] = useState(false);
  const [contasMes, setContasMes] = useState(() => mesAnoCorrentes().mes);
  const [contasAno, setContasAno] = useState(() => mesAnoCorrentes().ano);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [modalDatasAberto, setModalDatasAberto] = useState(false);
  const [modalDatasPasso, setModalDatasPasso] = useState<'form' | 'confirm'>('form');
  const [loteVencimento, setLoteVencimento] = useState('');
  const [lotePagamento, setLotePagamento] = useState('');
  const [processandoLote, setProcessandoLote] = useState(false);
  const alertaAnteriorRef = useRef(contasAlertaVencimento);
  const isAdmin = papel === 'admin';
  const selecionadosCount = selecionados.size;

  const carregarCatalogo = async () => {
    try {
      const res = await contasService.catalogoCategorias();
      setCatalog(res.data);
    } catch {
      toast.error('Erro ao carregar categorias');
    }
  };

  const categoriaLabel = (c: ContaPagar | string, sub?: string | null, pendente?: boolean) => {
    if (typeof c === 'string') return nomeCategoriaCatalogo(catalog, c, sub, pendente);
    return nomeCategoriaCatalogo(catalog, c.categoria, c.subcategoria, c.categoria_pendente);
  };

  useEffect(() => { carregarContas(); }, [contasCategoria, contasSubcategoria, contasPago]);
  useEffect(() => { carregarCatalogo(); }, []);
  useEffect(() => {
    colaboradoresService.listar(0, 500, true, { tipo: 'fornecedor' }).then((r) => setFornecedores(r.data || [])).catch(() => {});
  }, []);
  useEffect(() => {
    contasCorrentesService.listar(true).then((r) => setContasCorrentes(r.data || [])).catch(() => setContasCorrentes([]));
  }, []);

  const carregarContas = async () => {
    try {
      setLoading(true);
      const pago = contasPago === 'true' ? true : contasPago === 'false' ? false : undefined;
      const res = await contasService.listar(
        0,
        500,
        contasCategoria || undefined,
        pago,
        contasSubcategoria || undefined,
      );
      setContas(res.data);
    } catch { toast.error('Erro ao carregar contas'); }
    finally { setLoading(false); }
  };

  const isVencida = (c: ContaPagar) => !c.pago && compararVencimento(c.data_vencimento, hojeISO()) === -1;

  const contasFiltradas = contas.filter((c) => {
    if (buscaDescricao && !c.descricao.toLowerCase().includes(buscaDescricao.toLowerCase())) return false;
    if (dataInicio && c.data_vencimento && c.data_vencimento < dataInicio) return false;
    if (dataFim && c.data_vencimento && c.data_vencimento > dataFim) return false;
    if (contasAlertaVencimento === 'vencida') {
      return !c.pago && compararVencimento(c.data_vencimento, hojeISO()) === -1;
    }
    if (contasAlertaVencimento === 'hoje') {
      return !c.pago && compararVencimento(c.data_vencimento, hojeISO()) === 0;
    }
    if (contasAlertaVencimento === '7dias') {
      return !c.pago && venceEmMenosDe7Dias(c.data_vencimento, hojeISO());
    }
    if (!passaFiltroMesAno(c, contasMes, contasAno, contasMesTodos)) return false;
    return true;
  });

  useEffect(() => {
    const alertaAtivo = contasAlertaVencimento === 'hoje'
      || contasAlertaVencimento === '7dias'
      || contasAlertaVencimento === 'vencida';
    if (alertaAtivo) {
      setContasMesTodos(true);
    } else if (
      alertaAnteriorRef.current === 'hoje'
      || alertaAnteriorRef.current === '7dias'
      || alertaAnteriorRef.current === 'vencida'
    ) {
      const { mes, ano } = mesAnoCorrentes();
      setContasMesTodos(false);
      setContasMes(mes);
      setContasAno(ano);
    }
    alertaAnteriorRef.current = contasAlertaVencimento;
  }, [contasAlertaVencimento]);

  useEffect(() => {
    setSortField('data_vencimento');
    setSortDir('asc');
  }, [
    contasMesTodos, contasMes, contasAno,
    contasCategoria, contasSubcategoria, contasPago, contasAlertaVencimento,
    buscaDescricao, dataInicio, dataFim,
  ]);

  useEffect(() => {
    setSelecionados(new Set());
  }, [
    contasMesTodos, contasMes, contasAno,
    contasCategoria, contasSubcategoria, contasPago, contasAlertaVencimento,
    buscaDescricao, dataInicio, dataFim,
  ]);

  const toggleSelecionado = (id: number) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGrupo = (ids: number[]) => {
    const todosMarcados = ids.length > 0 && ids.every((id) => selecionados.has(id));
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (todosMarcados) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const abrirModalDatas = () => {
    if (!selecionadosCount) return;
    setLoteVencimento('');
    setLotePagamento('');
    setModalDatasPasso('form');
    setModalDatasAberto(true);
  };

  const fecharModalDatas = () => {
    if (processandoLote) return;
    setModalDatasAberto(false);
    setModalDatasPasso('form');
    setLoteVencimento('');
    setLotePagamento('');
  };

  const avancarConfirmacaoDatas = () => {
    if (!loteVencimento && !lotePagamento) {
      toast.error('Informe data de vencimento e/ou data de pagamento');
      return;
    }
    setModalDatasPasso('confirm');
  };

  const confirmarLoteDatas = async () => {
    const ids = Array.from(selecionados);
    if (!ids.length) return;
    if (!loteVencimento && !lotePagamento) {
      toast.error('Informe data de vencimento e/ou data de pagamento');
      return;
    }
    const datas: { data_vencimento?: string; data_pagamento?: string } = {};
    if (loteVencimento) datas.data_vencimento = loteVencimento;
    if (lotePagamento) datas.data_pagamento = lotePagamento;
    try {
      setProcessandoLote(true);
      const res = await contasService.editarDatasLote(ids, datas);
      toast.success(`${res.data.processados} atualizada(s), ${res.data.ignorados} ignorada(s)`);
      setSelecionados(new Set());
      setModalDatasAberto(false);
      setModalDatasPasso('form');
      setLoteVencimento('');
      setLotePagamento('');
      await carregarContas();
      triggerNotifRefresh();
      triggerCalendarioRefresh();
    } catch (e: unknown) {
      toast.error(mensagemErro(e, 'Erro ao editar datas em massa'));
    } finally {
      setProcessandoLote(false);
    }
  };

  const alternarOrdenacao = (campo: string) => {
    if (sortField === campo) { setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(campo); setSortDir('asc'); }
  };

  const statusRank = (c: ContaPagar) => (c.pago ? 2 : isVencida(c) ? 0 : 1);

  const valorOrdenacao = (c: ContaPagar, campo: string): string | number => {
    if (campo === 'status') return statusRank(c);
    if (campo === 'categoria') return categoriaLabel(c);
    if (campo === 'mes_ano') return chaveMesVencimento(c.data_vencimento);
    if (campo === 'caixa') return rotuloContaOrigem(c.caixa, contasCorrentes);
    if (campo === 'tipo_despesa') return ordemTipoDespesa(c.tipo_despesa);
    if (campo === 'criado_em') return c.criado_em || '';
    const raw = (c as unknown as Record<string, string | number | null | undefined>)[campo];
    return raw ?? '';
  };

  const ordenar = (items: ContaPagar[]) => [...items].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'criado_em') {
      const ta = a.criado_em ? new Date(a.criado_em).getTime() : 0;
      const tb = b.criado_em ? new Date(b.criado_em).getTime() : 0;
      if (ta !== tb) return (ta - tb) * mult;
      return (a.id - b.id) * mult;
    }
    if (sortField === 'data_vencimento' || sortField === 'mes_ano') {
      const ka = chaveMesVencimento(a.data_vencimento);
      const kb = chaveMesVencimento(b.data_vencimento);
      const semA = ka === CHAVE_SEM_VENCIMENTO;
      const semB = kb === CHAVE_SEM_VENCIMENTO;
      if (semA && semB) return 0;
      if (semA) return 1;
      if (semB) return -1;
      if (sortField === 'mes_ano') {
        const cmp = ka.localeCompare(kb);
        if (cmp !== 0) return mult * cmp;
      }
      const da = a.data_vencimento || '';
      const db = b.data_vencimento || '';
      return mult * da.localeCompare(db);
    }
    const va = valorOrdenacao(a, sortField);
    const vb = valorOrdenacao(b, sortField);
    if (typeof va === 'number' && typeof vb === 'number') return mult * (va - vb);
    return mult * String(va).localeCompare(String(vb), 'pt-BR');
  });

  const SortIcon = ({ campo }: { campo: string }) => (
    <span className="ml-1 text-xs opacity-50">{sortField === campo ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}</span>
  );

  const totaisCards = (() => {
    const totalPagoVal = contasFiltradas.filter((c) => c.pago).reduce((s, c) => s + c.valor, 0);
    const totalVencidoVal = contasFiltradas.filter((c) => isVencida(c)).reduce((s, c) => s + c.valor, 0);
    const totalAPagarVal = contasFiltradas.filter((c) => !c.pago && !isVencida(c)).reduce((s, c) => s + c.valor, 0);
    return {
      totalPago: totalPagoVal,
      totalVencido: totalVencidoVal,
      totalAPagar: totalAPagarVal,
      totalGeral: totalPagoVal + totalAPagarVal + totalVencidoVal,
    };
  })();

  const contasOrdenadas = ordenar(contasFiltradas);
  const anosFiltro = anosPermitidosContasPagar(new Date().getFullYear());

  const gruposMesAno = (() => {
    const grupos: { chave: string; rotulo: string; contas: ContaPagar[] }[] = [];
    for (const c of contasOrdenadas) {
      const chave = chaveMesVencimento(c.data_vencimento);
      const ultimo = grupos[grupos.length - 1];
      if (!ultimo || ultimo.chave !== chave) {
        grupos.push({
          chave,
          rotulo: chave === CHAVE_SEM_VENCIMENTO ? 'Sem vencimento' : rotuloMesAnoColuna(c.data_vencimento),
          contas: [c],
        });
      } else {
        ultimo.contas.push(c);
      }
    }
    return grupos;
  })();

  const idsVisiveis = contasOrdenadas.map((c) => c.id);
  const todosVisiveisMarcados = idsVisiveis.length > 0 && idsVisiveis.every((id) => selecionados.has(id));

  const abrirCriar = () => {
    setEditando(null);
    setForm({ ...FORM_INICIAL, caixa: codigoPadrao(contasCorrentes), tipo_despesa: 'variavel' });
    setArquivoNf(null);
    setNovaAberto(false);
    setNovaNome('');
    setModalAberto(true);
  };
  const abrirEditar = (c: ContaPagar) => {
    setEditando(c);
    setArquivoNf(null);
    setNovaAberto(false);
    setNovaNome('');
    setForm({
      descricao: c.descricao,
      categoria: c.categoria_pendente ? 'adm_financeiro' : (c.categoria || ''),
      subcategoria: c.categoria_pendente ? '' : (c.subcategoria || ''),
      valor: numberParaMoedaInput(c.valor),
      data_vencimento: c.data_vencimento ?? '',
      data_pagamento: c.data_pagamento || '',
      fornecedor_id: c.fornecedor_id ? String(c.fornecedor_id) : '',
      caixa: caixaInicialForm(c.caixa, contasCorrentes),
      tipo_despesa: (c.tipo_despesa === 'fixo' || c.tipo_despesa === 'imposto_das')
        ? c.tipo_despesa
        : 'variavel',
    });
    setModalAberto(true);
  };

  const confirmarNovaCategoria = async () => {
    const local = validarNomeCategoriaLocal(novaNome);
    if (local) {
      toast.error(local);
      return;
    }
    try {
      setSalvandoCategoria(true);
      const res = await contasService.criarCategoria(novaNome.trim());
      await carregarCatalogo();
      setForm({ ...form, categoria: res.data.codigo, subcategoria: '' });
      setNovaAberto(false);
      setNovaNome('');
      toast.success('Categoria cadastrada');
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Não foi possível cadastrar a categoria'));
    } finally {
      setSalvandoCategoria(false);
    }
  };

  const cadastradaSelecionada = catalog?.cadastradas.find((c) => c.codigo === form.categoria) ?? null;

  const iniciarEditarCategoria = () => {
    if (!cadastradaSelecionada) return;
    setEditCatId(cadastradaSelecionada.id);
    setEditCatNome(cadastradaSelecionada.nome);
    setNovaAberto(false);
  };

  const confirmarEditarCategoria = async () => {
    if (editCatId == null) return;
    const local = validarNomeCategoriaLocal(editCatNome);
    if (local) {
      toast.error(local);
      return;
    }
    try {
      setSalvandoCategoria(true);
      await contasService.atualizarCategoria(editCatId, editCatNome.trim());
      await carregarCatalogo();
      setEditCatId(null);
      setEditCatNome('');
      toast.success('Categoria atualizada');
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Não foi possível atualizar a categoria'));
    } finally {
      setSalvandoCategoria(false);
    }
  };

  const excluirCategoriaSelecionada = async () => {
    if (!cadastradaSelecionada) return;
    if (!confirm(`Excluir a categoria "${cadastradaSelecionada.nome}"?`)) return;
    try {
      await contasService.excluirCategoria(cadastradaSelecionada.id);
      await carregarCatalogo();
      setForm({ ...form, categoria: 'adm_financeiro', subcategoria: '' });
      toast.success('Categoria excluída');
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Não foi possível excluir a categoria'));
    }
  };

  const confirmarNovaSubcategoria = async () => {
    const local = validarNomeCategoriaLocal(novaSubNome);
    if (local) {
      toast.error(local);
      return;
    }
    try {
      setSalvandoSub(true);
      const res = await contasService.criarSubcategoriaRh(novaSubNome.trim());
      await carregarCatalogo();
      setForm({ ...form, subcategoria: res.data.codigo });
      setNovaSubAberto(false);
      setNovaSubNome('');
      toast.success('Subcategoria cadastrada');
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Não foi possível cadastrar a subcategoria'));
    } finally {
      setSalvandoSub(false);
    }
  };

  const subSelecionada = catalog?.subcategorias_rh.find((s) => s.codigo === form.subcategoria) ?? null;

  const iniciarEditarSub = () => {
    if (!subSelecionada?.id) return;
    setEditSubId(subSelecionada.id);
    setEditSubNome(subSelecionada.nome);
    setNovaSubAberto(false);
  };

  const confirmarEditarSub = async () => {
    if (editSubId == null) return;
    const local = validarNomeCategoriaLocal(editSubNome);
    if (local) {
      toast.error(local);
      return;
    }
    try {
      setSalvandoSub(true);
      await contasService.atualizarSubcategoriaRh(editSubId, editSubNome.trim());
      await carregarCatalogo();
      setEditSubId(null);
      setEditSubNome('');
      toast.success('Subcategoria atualizada');
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Não foi possível atualizar a subcategoria'));
    } finally {
      setSalvandoSub(false);
    }
  };

  const excluirSubSelecionada = async () => {
    if (!subSelecionada?.id || subSelecionada.sistema) return;
    if (!confirm(`Excluir a subcategoria "${subSelecionada.nome}"?`)) return;
    try {
      await contasService.excluirSubcategoriaRh(subSelecionada.id);
      await carregarCatalogo();
      setForm({ ...form, subcategoria: '' });
      toast.success('Subcategoria excluída');
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Não foi possível excluir a subcategoria'));
    }
  };

  const aplicarFormPosMaisUmPagar = () => {
    setEditando(null);
    setArquivoNf(null);
    setForm((prev) => ({ ...prev, data_pagamento: '' }));
  };

  const salvar = async (continuar = false) => {
    if (!form.descricao || !form.data_vencimento) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    if (!isValorMoedaValido(form.valor)) {
      toast.error('Informe um valor válido maior que zero');
      return;
    }
    if (form.categoria === SENTINELA_NOVA) {
      toast.error('Selecione uma categoria');
      return;
    }
    if (!form.tipo_despesa) {
      toast.error('Selecione o Tipo (Fixo, Variável ou Imposto / DAS)');
      return;
    }
    const ehImpostoDas = form.tipo_despesa === 'imposto_das';
    if (!ehImpostoDas && !form.categoria) {
      toast.error('Selecione uma categoria');
      return;
    }
    if (form.categoria === 'recursos_humanos' && !form.subcategoria) {
      toast.error('Recursos Humanos exige uma subcategoria');
      return;
    }
    const valorNum = parseMoedaInput(form.valor);
    if (valorNum === null || valorNum <= 0) {
      toast.error('Informe um valor válido maior que zero');
      return;
    }
    try {
      setSalvando(true);
      const dados: {
        descricao: string;
        categoria: string | null;
        subcategoria: string | null;
        valor: number;
        data_vencimento: string;
        data_pagamento: string | null;
        fornecedor_id: number | null;
        pago?: boolean;
        caixa: string;
        tipo_despesa: 'fixo' | 'variavel' | 'imposto_das';
      } = {
        descricao: form.descricao,
        categoria: form.categoria || null,
        subcategoria: form.categoria === 'recursos_humanos' ? form.subcategoria : null,
        valor: valorNum,
        data_vencimento: form.data_vencimento,
        data_pagamento: form.data_pagamento || null,
        fornecedor_id: form.fornecedor_id ? parseInt(form.fornecedor_id, 10) : null,
        caixa: form.caixa || codigoPadrao(contasCorrentes),
        tipo_despesa: form.tipo_despesa,
      };
      if (editando) {
        dados.pago = !!form.data_pagamento;
        await contasService.atualizar(editando.id, dados);
        if (arquivoNf) {
          const motivo = motivoArquivoNf(arquivoNf);
          if (!motivo) {
            try {
              await contasService.uploadComprovante(editando.id, arquivoNf);
            } catch (e: any) {
              toast.error(mensagemErro(e, 'Conta atualizada, mas a nota fiscal não foi anexada'));
              setModalAberto(false); carregarContas(); triggerNotifRefresh(); triggerCalendarioRefresh();
              return;
            }
          } else {
            toast.error(`${motivo}. A conta foi salva sem alterar o arquivo.`);
          }
        }
        toast.success('Conta atualizada!');
        setModalAberto(false); setArquivoNf(null); carregarContas(); triggerNotifRefresh(); triggerCalendarioRefresh();
      } else {
        const res = await contasService.criar(dados);
        const novaId = res.data?.id;
        let anexoOk = true;
        if (arquivoNf && novaId) {
          const motivo = motivoArquivoNf(arquivoNf);
          if (!motivo) {
            try {
              await contasService.uploadComprovante(novaId, arquivoNf);
            } catch (e: any) {
              anexoOk = false;
              toast.error(mensagemErro(e, 'Conta criada, mas a nota fiscal não foi anexada'));
            }
          } else {
            anexoOk = false;
            toast.error(`${motivo}. A conta foi salva sem arquivo.`);
          }
        }
        if (anexoOk) toast.success('Conta criada!');
        carregarContas();
        triggerNotifRefresh();
        triggerCalendarioRefresh();
        if (continuar) {
          aplicarFormPosMaisUmPagar();
        } else {
          setModalAberto(false);
          setArquivoNf(null);
        }
      }
    } catch (e: any) { toast.error(mensagemErro(e, 'Erro ao salvar')); }
    finally { setSalvando(false); }
  };

  const abrirPago = (conta: ContaPagar) => {
    const agora = new Date();
    const hoje = [
      agora.getFullYear(),
      String(agora.getMonth() + 1).padStart(2, '0'),
      String(agora.getDate()).padStart(2, '0'),
    ].join('-');
    setDataPagoForm(hoje);
    setCaixaPagoForm(caixaInicialForm(conta.caixa, contasCorrentes));
    setPagoModal(conta);
  };

  const confirmarPago = async () => {
    if (!pagoModal) return;
    if (!dataPagoForm) {
      toast.error('Informe a data de pagamento');
      return;
    }
    if (!caixaPagoForm) {
      toast.error('Selecione a conta corrente');
      return;
    }
    try {
      await contasService.atualizar(pagoModal.id, {
        pago: true,
        data_pagamento: dataPagoForm,
        caixa: caixaPagoForm,
      });
      toast.success('Marcada como paga!');
      setPagoModal(null);
      carregarContas();
      triggerNotifRefresh();
      triggerCalendarioRefresh();
    } catch { toast.error('Erro ao atualizar'); }
  };

  const deletar = async (conta: ContaPagar) => {
    if (!confirm(`Excluir "${conta.descricao}"?`)) return;
    try { await contasService.deletar(conta.id); toast.success('Conta excluída'); carregarContas(); triggerNotifRefresh(); triggerCalendarioRefresh(); }
    catch { toast.error('Erro ao excluir'); }
  };

  const importarXlsx = async (arquivo: File) => {
    try {
      setImportandoXlsx(true);
      const res = await contasService.importarXlsx(arquivo);
      const { ok, erros } = res.data;
      if (ok > 0) {
        toast.success(`${ok} conta(s) importada(s) do Excel`);
        carregarContas(); triggerNotifRefresh(); triggerCalendarioRefresh();
      }
      if (erros?.length > 0) {
        toast.error(`${erros.length} aviso(s)/erro(s) na importação`);
        console.warn('Avisos importação contas:', erros);
      }
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao importar arquivo Excel'));
    } finally {
      setImportandoXlsx(false);
    }
  };

  const exportarXlsx = () => contasService.exportarXlsx({
    categoria: contasCategoria || undefined,
    subcategoria: contasSubcategoria || undefined,
    pago: contasPago === '' ? undefined : contasPago === 'true',
    mes: contasMesTodos ? undefined : contasMes,
    ano: contasMesTodos ? undefined : contasAno,
  });

  const abrirUploadComprovante = (conta: ContaPagar) => {
    setUploadingComprovante(conta.id);
    comprovanteInputRef.current?.click();
  };

  const handleComprovanteFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo || !uploadingComprovante) return;
    const motivo = motivoArquivoNf(arquivo);
    if (motivo) {
      toast.error(motivo);
      setUploadingComprovante(null);
      return;
    }
    try {
      await contasService.uploadComprovante(uploadingComprovante, arquivo);
      toast.success('Nota fiscal vinculada!');
      carregarContas();
    } catch (err: any) { toast.error(mensagemErro(err, 'Erro ao anexar nota fiscal')); }
    finally { setUploadingComprovante(null); }
  };

  const removerNotaFiscal = async (conta: ContaPagar) => {
    if (!confirm(`Remover a nota fiscal de "${conta.descricao}"?`)) return;
    try {
      await contasService.removerComprovante(conta.id);
      toast.success('Nota fiscal removida');
      if (editando?.id === conta.id) setEditando({ ...editando, comprovante_nome: undefined });
      carregarContas();
    } catch (err: any) { toast.error(mensagemErro(err, 'Erro ao remover nota fiscal')); }
  };

  const exportar = () => exportarCSV(contasOrdenadas.map((c) => ({
    Descrição: c.descricao,
    Categoria: categoriaLabel(c),
    'Mês/Ano': rotuloMesAnoColuna(c.data_vencimento),
    Fornecedor: c.fornecedor_nome || '',
    Valor: c.valor,
    Vencimento: c.data_vencimento,
    Pagamento: c.data_pagamento || '',
    Conta: rotuloContaOrigem(c.caixa, contasCorrentes),
    Tipo: labelTipoDespesa(c.tipo_despesa),
    Status: c.pago ? 'Pago' : isVencida(c) ? 'Vencida' : 'Pendente',
    Pendente_reclassificacao: c.categoria_pendente ? 'sim' : 'nao',
  })), 'contas_a_pagar');

  const fmt = (v: number) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00';
  const INPUT = 'w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';

  const COLUNAS_TABELA = [
    { label: 'Descrição', campo: 'descricao' },
    { label: 'Categoria', campo: 'categoria' },
    { label: 'Mês/Ano', campo: 'mes_ano' },
    { label: 'Fornecedor', campo: 'fornecedor_nome' },
    { label: 'Valor', campo: 'valor' },
    { label: 'Vencimento', campo: 'data_vencimento' },
    { label: 'Pagamento', campo: 'data_pagamento' },
    { label: 'Lançamento', campo: 'criado_em' },
    { label: 'Conta', campo: 'caixa' },
    { label: 'Tipo', campo: 'tipo_despesa' },
    { label: 'Status', campo: 'status' },
    { label: 'Nota fiscal', campo: null },
    { label: '', campo: null },
  ] as const;

  const colSpanTabela = COLUNAS_TABELA.length + (isAdmin ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="print-only mb-4">
        <h1 className="text-2xl font-bold">Contas a Pagar</h1>
        <p className="text-sm text-gray-600">
          {contasMesTodos ? 'Todos os meses' : `${MESES_NOME_LONGO[contasMes - 1]}/${contasAno}`}
          {' · '}{contasOrdenadas.length} conta(s)
        </p>
      </div>
      <div className="no-print bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">Contas a Pagar - <span className="text-lg font-normal text-gray-500 dark:text-gray-400">{contas.length} conta(s) registrada(s)</span></h1>
        <div className="flex gap-2 flex-wrap justify-end">
          {papel === 'admin' && (
            <ActionButton variant="importar" context="header" label="Importar CSV" onClick={() => setImportAberto(true)} />
          )}
          {contas.length > 0 && (
            <ActionButton variant="exportar-csv" context="header" label="Exportar CSV" onClick={exportar} />
          )}
          {papel === 'admin' && (
            <>
              <input
                ref={xlsxInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) importarXlsx(f); e.target.value = ''; }}
              />
              <input
                ref={comprovanteInputRef}
                type="file"
                accept={ACCEPT_NF}
                className="hidden"
                onChange={handleComprovanteFile}
              />
              <ActionButton
                variant="importar"
                context="header"
                label={importandoXlsx ? 'Importando...' : 'Importar Excel (.xlsx)'}
                onClick={() => xlsxInputRef.current?.click()}
                disabled={importandoXlsx}
              />
            </>
          )}
          <ActionButton variant="exportar-xlsx" context="header" label="Exportar Excel (.xlsx)" onClick={exportarXlsx} />
          <ActionButton variant="exportar-pdf" context="header" label="Exportar PDF" onClick={() => window.print()} />
          {papel === 'admin' && (
            <ActionButton variant="criar" context="header" label="Nova conta a pagar" onClick={abrirCriar} />
          )}
        </div>
      </div>

      <div className="no-print grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Total</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{fmt(totaisCards.totalGeral)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs text-green-700 dark:text-green-400 font-medium">Pago</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{fmt(totaisCards.totalPago)}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">A pagar</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{fmt(totaisCards.totalAPagar)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Vencido</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{fmt(totaisCards.totalVencido)}</p>
        </div>
      </div>

      <div className="no-print bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Categorias</label>
          <select
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
            value={contasCategoria}
            onChange={(e) => setContasFilters(e.target.value, contasPago, e.target.value === 'recursos_humanos' ? contasSubcategoria : '')}
          >
            <option value="">Todas</option>
            {(catalog?.oficiais || []).filter((c) => c.codigo !== 'impostos' && c.codigo !== 'imposto').map((c) => (
              <option key={c.codigo} value={c.codigo}>{c.nome}</option>
            ))}
            {(catalog?.cadastradas || []).filter((c) => c.codigo !== 'impostos' && c.codigo !== 'imposto').map((c) => (
              <option key={c.codigo} value={c.codigo}>{c.nome}</option>
            ))}
          </select>
        </div>
        {contasCategoria === 'recursos_humanos' && (
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Subcategoria RH</label>
            <select
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
              value={contasSubcategoria}
              onChange={(e) => setContasFilters(contasCategoria, contasPago, e.target.value)}
            >
              <option value="">Todas de RH</option>
              {(catalog?.subcategorias_rh || []).map((s) => <option key={s.codigo} value={s.codigo}>{s.nome}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Status</label>
          <select className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm" value={
            contasAlertaVencimento === 'hoje' ? 'alerta-hoje'
              : contasAlertaVencimento === '7dias' ? 'alerta-7dias'
                : contasAlertaVencimento === 'vencida' ? 'alerta-vencida'
                  : contasPago
          } onChange={(e) => {
            const v = e.target.value;
            if (v === 'alerta-hoje') setContasFilters(contasCategoria, 'false', contasSubcategoria, 'hoje');
            else if (v === 'alerta-7dias') setContasFilters(contasCategoria, 'false', contasSubcategoria, '7dias');
            else if (v === 'alerta-vencida') setContasFilters(contasCategoria, 'false', contasSubcategoria, 'vencida');
            else setContasFilters(contasCategoria, v as '' | 'true' | 'false', contasSubcategoria, '');
          }}>
            <option value="">Todos</option>
            <option value="false">Pendente</option>
            <option value="alerta-hoje">Vence hoje</option>
            <option value="alerta-7dias">Vence em menos de 7 dias</option>
            <option value="alerta-vencida">Vencida</option>
            <option value="true">Pago</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1" htmlFor="contas-filtro-todos">Mês/Ano</label>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
              <input
                id="contas-filtro-todos"
                type="checkbox"
                checked={contasMesTodos}
                onChange={(e) => setContasMesTodos(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              Todos
            </label>
            <select
              id="contas-filtro-mes"
              aria-label="Mês de vencimento"
              disabled={contasMesTodos}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
              value={contasMes}
              onChange={(e) => setContasMes(Number(e.target.value))}
            >
              {mesesDisponiveis().map((m) => (
                <option key={m} value={m}>{MESES_NOME_LONGO[m - 1]}</option>
              ))}
            </select>
            <select
              id="contas-filtro-ano"
              aria-label="Ano de vencimento"
              disabled={contasMesTodos}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm disabled:opacity-50"
              value={contasAno}
              onChange={(e) => setContasAno(Number(e.target.value))}
            >
              {anosFiltro.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Descrição</label>
          <input type="text" className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-44"
            value={buscaDescricao} onChange={(e) => setBuscaDescricao(e.target.value)} placeholder="Buscar..." />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Venc. de</label>
          <input type="date" className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
            value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Venc. até</label>
          <input type="date" className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
            value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
        {(buscaDescricao || dataInicio || dataFim) && (
          <button onClick={() => { setBuscaDescricao(''); setDataInicio(''); setDataFim(''); }}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-4">✕ Limpar</button>
        )}
      </div>

      {isAdmin && selecionadosCount > 0 && (
        <div className="no-print flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
          <span className="text-sm text-blue-800 dark:text-blue-300">{selecionadosCount} selecionada(s)</span>
          <button
            type="button"
            onClick={abrirModalDatas}
            className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Editar datas em massa
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
      ) : contasOrdenadas.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-400 dark:text-gray-500">Nenhuma conta encontrada</div>
      ) : (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${TABLE_SCROLL_CONTAINER_CLASS} print-area`}>
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="border-b border-gray-200 dark:border-gray-600">
              <tr>
                {isAdmin && (
                  <th className={`${TH_STICKY_CLASS} px-3 py-3 w-8`}>
                    <input
                      type="checkbox"
                      checked={todosVisiveisMarcados}
                      onChange={() => toggleGrupo(idsVisiveis)}
                      aria-label="Selecionar todas as contas visíveis"
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                )}
                {COLUNAS_TABELA.map(({ label, campo }) => (
                  <th
                    key={label || 'acoes'}
                    onClick={campo ? () => alternarOrdenacao(campo) : undefined}
                    className={`${TH_STICKY_CLASS} px-4 py-3 text-gray-500 dark:text-gray-400 font-medium text-xs whitespace-nowrap ${label === 'Valor' ? 'text-right' : 'text-left'} ${campo ? 'cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                  >
                    {label}{campo && <SortIcon campo={campo} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {gruposMesAno.map((grupo) => {
                const idsGrupo = grupo.contas.map((c) => c.id);
                const grupoMarcado = idsGrupo.length > 0 && idsGrupo.every((id) => selecionados.has(id));
                return (
                  <Fragment key={`g-${grupo.chave}`}>
                    <tr className="bg-gray-100/80 dark:bg-gray-700/60">
                      {isAdmin && (
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={grupoMarcado}
                            onChange={() => toggleGrupo(idsGrupo)}
                            aria-label={`Selecionar todas de ${grupo.rotulo}`}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                        </td>
                      )}
                      <td
                        colSpan={isAdmin ? colSpanTabela - 1 : colSpanTabela}
                        className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200"
                      >
                        {grupo.rotulo}
                        <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">
                          ({grupo.contas.length})
                        </span>
                      </td>
                    </tr>
                    {grupo.contas.map((conta) => (
                <tr key={conta.id} className={`transition-colors ${conta.pago ? 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100/80 dark:hover:bg-green-900/20' : isVencida(conta) ? 'bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100/80 dark:hover:bg-orange-900/20' : 'bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/20'}`}>
                  {isAdmin && (
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selecionados.has(conta.id)}
                        onChange={() => toggleSelecionado(conta.id)}
                        aria-label={`Selecionar ${conta.descricao}`}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {conta.descricao}
                    {conta.categoria_pendente && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        Reclassificar
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                    {categoriaLabel(conta)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">
                    {rotuloMesAnoColuna(conta.data_vencimento)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                    {conta.fornecedor_nome || '—'}
                    {conta.fornecedor_id && conta.fornecedor_ativo === false && (
                      <span className="ml-1 text-gray-400">(inativo)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{fmt(conta.valor)}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                    {conta.data_vencimento || '—'}
                    {isVencida(conta) && <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">VENCIDA</span>}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {conta.pago && conta.data_pagamento ? (
                      <span className="text-green-600 dark:text-green-400">{conta.data_pagamento}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                    {conta.criado_em ? new Date(conta.criado_em).toLocaleString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {rotuloContaOrigem(conta.caixa, contasCorrentes)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {labelTipoDespesa(conta.tipo_despesa)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conta.pago ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' : isVencida(conta) ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'}`}>
                      {conta.pago ? 'Pago' : isVencida(conta) ? 'Vencida' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {conta.comprovante_nome ? (
                      <div className="flex flex-col gap-1 items-start">
                        <button
                          onClick={() => contasService.downloadComprovante(conta.id, conta.comprovante_nome)}
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                          title={conta.comprovante_nome}
                        >
                          <span>📎</span>
                          <span className="max-w-[80px] truncate">{conta.comprovante_nome}</span>
                        </button>
                        {papel === 'admin' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => abrirUploadComprovante(conta)}
                              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                              title="Substituir nota fiscal"
                            >
                              Substituir
                            </button>
                            <button
                              onClick={() => removerNotaFiscal(conta)}
                              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                              title="Remover nota fiscal"
                            >
                              Remover
                            </button>
                          </div>
                        )}
                      </div>
                    ) : papel === 'admin' ? (
                      <ActionButton
                        variant="anexar"
                        context="row"
                        label="Anexar"
                        onClick={() => abrirUploadComprovante(conta)}
                      />
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 no-print">
                    {papel === 'admin' && (
                      <div className="flex gap-1 items-center justify-end flex-nowrap">
                        {!conta.pago && (
                          <ActionButton variant="fluxo" context="row" label="Pagar" onClick={() => abrirPago(conta)} />
                        )}
                        <ActionButton variant="editar" context="row" label="Editar" onClick={() => abrirEditar(conta)} />
                        <ActionButton variant="excluir" context="row" label="Excluir" onClick={() => deletar(conta)} />
                      </div>
                    )}
                  </td>
                </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {importAberto && (
        <ImportCSV
          titulo="Contas a Pagar"
          colunas={['descricao', 'categoria', 'subcategoria', 'valor', 'data_vencimento', 'tipo']}
          exemplo={{ descricao: 'DAS', categoria: '', subcategoria: '', valor: '5000', data_vencimento: '2026-07-10', tipo: 'imposto_das' }}
          mapear={(l) => {
            if (!l.descricao || !l.valor || !l.data_vencimento) throw new Error('descricao, valor e data_vencimento são obrigatórios');
            const tipoRaw = (l.tipo || l.tipo_despesa || 'variavel').trim().toLowerCase();
            const tipoAlias: Record<string, 'fixo' | 'variavel' | 'imposto_das'> = {
              fixo: 'fixo',
              variavel: 'variavel',
              variável: 'variavel',
              imposto_das: 'imposto_das',
              'imposto / das': 'imposto_das',
              'imposto/das': 'imposto_das',
              imposto: 'imposto_das',
              impostos: 'imposto_das',
              das: 'imposto_das',
            };
            const tipo = tipoAlias[tipoRaw] || (['fixo', 'variavel', 'imposto_das'].includes(tipoRaw) ? tipoRaw as 'fixo' | 'variavel' | 'imposto_das' : null);
            if (!tipo) throw new Error('tipo inválido (use Fixo, Variável ou Imposto / DAS)');
            const bruto = (l.categoria || '').trim();
            const chave = bruto.toLowerCase();
            if (chave === 'impostos' || chave === 'imposto') {
              throw new Error('categoria Impostos não é mais válida; use tipo Imposto / DAS');
            }
            if (!bruto) {
              if (tipo !== 'imposto_das') throw new Error('categoria é obrigatória (exceto Tipo Imposto / DAS)');
              return {
                descricao: l.descricao,
                categoria: null,
                subcategoria: null,
                valor: parseFloat(l.valor.replace(',', '.')),
                data_vencimento: l.data_vencimento,
                tipo_despesa: tipo,
              };
            }
            const oficial = catalog?.oficiais.find((o) => o.codigo === chave || o.nome.toLowerCase() === chave);
            const cadastrada = catalog?.cadastradas.find((o) => o.codigo.toLowerCase() === chave || o.nome.toLowerCase() === chave);
            const cat = oficial?.codigo || cadastrada?.codigo;
            if (!cat) throw new Error(`categoria inválida: ${l.categoria}`);
            if (cat === 'impostos' || cat === 'imposto') {
              throw new Error('categoria Impostos não é mais válida; use tipo Imposto / DAS');
            }
            const subRaw = (l.subcategoria || '').trim();
            if (cat === 'recursos_humanos' && !subRaw) throw new Error('Recursos Humanos exige subcategoria');
            const sub = cat === 'recursos_humanos' ? resolverSubcategoriaImport(catalog, subRaw) : null;
            return {
              descricao: l.descricao,
              categoria: cat,
              subcategoria: sub,
              valor: parseFloat(l.valor.replace(',', '.')),
              data_vencimento: l.data_vencimento,
              tipo_despesa: tipo,
            };
          }}
          criar={(payload) => contasService.criar(payload)}
          onConcluido={carregarContas}
          onFechar={() => setImportAberto(false)}
        />
      )}

      {modalAberto && (
        <Modal
          maxWidth="max-w-md"
          bodyClassName="p-6 space-y-4"
          footerClassName="p-6 border-t dark:border-gray-700 flex justify-end gap-3 text-sm"
          header={(
            <>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{editando ? 'Editar conta a pagar' : 'Nova conta a pagar'}</h2>
              {editando?.categoria_pendente && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Esta conta está pendente de reclassificação (legado: {editando.categoria}). Escolha uma categoria válida para limpar o aviso.
                </p>
              )}
            </>
          )}
          footer={(
            <>
              <button onClick={() => { setModalAberto(false); setArquivoNf(null); }} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              {!editando && (
                <button
                  type="button"
                  onClick={() => salvar(true)}
                  disabled={salvando}
                  title="Salvar e cadastrar mais um"
                  aria-label="Salvar e cadastrar mais um"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  +1
                </button>
              )}
              <button onClick={() => salvar(false)} disabled={salvando} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          )}
        >
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Descrição *</label>
                <input className={INPUT} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Fornecedor</label>
                <select
                  className={INPUT}
                  value={form.fornecedor_id}
                  onChange={(e) => setForm({ ...form, fornecedor_id: e.target.value })}
                  disabled={papel !== 'admin'}
                >
                  <option value="">Sem fornecedor</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={String(f.id)}>{f.nome}</option>
                  ))}
                  {editando?.fornecedor_id && !fornecedores.some((f) => f.id === editando.fornecedor_id) && editando.fornecedor_nome && (
                    <option value={String(editando.fornecedor_id)}>{editando.fornecedor_nome} (inativo)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Categorias{form.tipo_despesa === 'imposto_das' ? '' : ' *'}
                </label>
                <select
                  className={INPUT}
                  value={form.categoria}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === SENTINELA_NOVA) {
                      setNovaAberto(true);
                      setNovaNome('');
                      setEditCatId(null);
                      return;
                    }
                    setNovaAberto(false);
                    setEditCatId(null);
                    setForm({
                      ...form,
                      categoria: v,
                      subcategoria: v === 'recursos_humanos' ? form.subcategoria : '',
                    });
                  }}
                  disabled={papel !== 'admin' && !editando}
                >
                  {form.tipo_despesa === 'imposto_das' && (
                    <option value="">Sem categoria</option>
                  )}
                  {(catalog?.oficiais || []).filter((c) => c.codigo !== 'impostos' && c.codigo !== 'imposto').map((c) => (
                    <option key={c.codigo} value={c.codigo}>{c.nome}</option>
                  ))}
                  {(catalog?.cadastradas || []).filter((c) => c.codigo !== 'impostos' && c.codigo !== 'imposto').map((c) => (
                    <option key={c.codigo} value={c.codigo}>{c.nome}</option>
                  ))}
                  {papel === 'admin' && <option value={SENTINELA_NOVA}>Nova categoria…</option>}
                </select>
                {papel === 'admin' && cadastradaSelecionada && !novaAberto && editCatId == null && (
                  <div className="flex gap-2 mt-2">
                    <button type="button" className="text-xs text-blue-600 dark:text-blue-400 hover:underline" onClick={iniciarEditarCategoria}>Editar nome</button>
                    <button type="button" className="text-xs text-red-600 dark:text-red-400 hover:underline" onClick={excluirCategoriaSelecionada}>Excluir</button>
                  </div>
                )}
              </div>
              {novaAberto && papel === 'admin' && (
                <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 p-3 space-y-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block">Nome da nova categoria *</label>
                  <input
                    className={INPUT}
                    value={novaNome}
                    maxLength={20}
                    placeholder="Até 20 caracteres"
                    onChange={(e) => setNovaNome(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="text-xs px-3 py-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => { setNovaAberto(false); setNovaNome(''); }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={salvandoCategoria}
                      className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      onClick={confirmarNovaCategoria}
                    >
                      {salvandoCategoria ? 'Salvando...' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              )}
              {editCatId != null && papel === 'admin' && (
                <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 p-3 space-y-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block">Editar nome da categoria *</label>
                  <input className={INPUT} value={editCatNome} maxLength={20} onChange={(e) => setEditCatNome(e.target.value)} />
                  <div className="flex justify-end gap-2">
                    <button type="button" className="text-xs px-3 py-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setEditCatId(null); setEditCatNome(''); }}>Cancelar</button>
                    <button type="button" disabled={salvandoCategoria} className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" onClick={confirmarEditarCategoria}>
                      {salvandoCategoria ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              )}
              {form.categoria === 'recursos_humanos' && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Subcategoria RH *</label>
                  <select
                    className={INPUT}
                    value={form.subcategoria}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === SENTINELA_NOVA_SUB) {
                        setNovaSubAberto(true);
                        setNovaSubNome('');
                        setEditSubId(null);
                        return;
                      }
                      setNovaSubAberto(false);
                      setEditSubId(null);
                      setForm({ ...form, subcategoria: v });
                    }}
                  >
                    <option value="">Selecione...</option>
                    {(catalog?.subcategorias_rh || []).map((s) => <option key={s.codigo} value={s.codigo}>{s.nome}</option>)}
                    {papel === 'admin' && <option value={SENTINELA_NOVA_SUB}>Nova subcategoria…</option>}
                  </select>
                  {papel === 'admin' && subSelecionada?.id && !novaSubAberto && editSubId == null && (
                    <div className="flex gap-2 mt-2">
                      <button type="button" className="text-xs text-blue-600 dark:text-blue-400 hover:underline" onClick={iniciarEditarSub}>Editar nome</button>
                      {!subSelecionada.sistema && (
                        <button type="button" className="text-xs text-red-600 dark:text-red-400 hover:underline" onClick={excluirSubSelecionada}>Excluir</button>
                      )}
                    </div>
                  )}
                  {novaSubAberto && papel === 'admin' && (
                    <div className="mt-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 p-3 space-y-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400 block">Nome da nova subcategoria *</label>
                      <input className={INPUT} value={novaSubNome} maxLength={20} onChange={(e) => setNovaSubNome(e.target.value)} />
                      <div className="flex justify-end gap-2">
                        <button type="button" className="text-xs px-3 py-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setNovaSubAberto(false); setNovaSubNome(''); }}>Cancelar</button>
                        <button type="button" disabled={salvandoSub} className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" onClick={confirmarNovaSubcategoria}>
                          {salvandoSub ? 'Salvando...' : 'Confirmar'}
                        </button>
                      </div>
                    </div>
                  )}
                  {editSubId != null && papel === 'admin' && (
                    <div className="mt-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 p-3 space-y-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400 block">Editar nome da subcategoria *</label>
                      <input className={INPUT} value={editSubNome} maxLength={20} onChange={(e) => setEditSubNome(e.target.value)} />
                      <div className="flex justify-end gap-2">
                        <button type="button" className="text-xs px-3 py-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { setEditSubId(null); setEditSubNome(''); }}>Cancelar</button>
                        <button type="button" disabled={salvandoSub} className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" onClick={confirmarEditarSub}>
                          {salvandoSub ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tipo *</label>
                <select
                  className={INPUT}
                  value={form.tipo_despesa}
                  onChange={(e) => {
                    const tipo = e.target.value as 'fixo' | 'variavel' | 'imposto_das';
                    setForm({
                      ...form,
                      tipo_despesa: tipo,
                      categoria: tipo === 'imposto_das' ? form.categoria : (form.categoria || 'adm_financeiro'),
                    });
                  }}
                  disabled={papel !== 'admin'}
                >
                  <option value="fixo">Fixo</option>
                  <option value="variavel">Variável</option>
                  <option value="imposto_das">Imposto / DAS</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Conta *</label>
                <select
                  className={INPUT}
                  value={form.caixa || codigoPadrao(contasCorrentes)}
                  onChange={(e) => setForm({ ...form, caixa: e.target.value })}
                  disabled={papel !== 'admin'}
                >
                  {contasCorrentes.filter((c) => c.ativo).map((c) => (
                    <option key={c.codigo} value={c.codigo}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={INPUT}
                  value={form.valor}
                  placeholder="R$ 0,00"
                  onChange={(e) => setForm({ ...form, valor: formatarMoedaInput(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Vencimento *</label>
                <input type="date" className={INPUT} value={form.data_vencimento} onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de Pagamento</label>
                <input type="date" className={INPUT} value={form.data_pagamento} onChange={(e) => setForm({ ...form, data_pagamento: e.target.value })} />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Preencher apenas se já foi pago</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Nota fiscal (PDF, JPEG ou PNG)</label>
                {editando?.comprovante_nome && (
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                    <button
                      type="button"
                      onClick={() => contasService.downloadComprovante(editando.id, editando.comprovante_nome)}
                      className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                    >
                      {editando.comprovante_nome}
                    </button>
                    <button
                      type="button"
                      onClick={() => removerNotaFiscal(editando)}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept={ACCEPT_NF}
                  className="block w-full text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border file:border-gray-200 dark:file:border-gray-600 file:bg-white dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    e.target.value = '';
                    if (f) {
                      const motivo = motivoArquivoNf(f);
                      if (motivo) {
                        toast.error(motivo);
                        setArquivoNf(null);
                        return;
                      }
                    }
                    setArquivoNf(f);
                  }}
                />
                {arquivoNf && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selecionado: {arquivoNf.name}</p>
                )}
              </div>
        </Modal>
      )}

      {pagoModal && (
        <Modal
          maxWidth="max-w-sm"
          bodyClassName="p-6 space-y-4"
          footerClassName="p-6 border-t dark:border-gray-700 flex justify-end gap-3 text-sm"
          header={(
            <>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Marcar como paga</h2>
              <p className="text-sm text-gray-500 mt-1">{pagoModal.descricao}</p>
            </>
          )}
          footer={(
            <>
              <button onClick={() => setPagoModal(null)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={confirmarPago} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Confirmar pagamento</button>
            </>
          )}
        >
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de pagamento *</label>
                <input type="date" className={INPUT} value={dataPagoForm} onChange={(e) => setDataPagoForm(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Conta *</label>
                <select className={INPUT} value={caixaPagoForm} onChange={(e) => setCaixaPagoForm(e.target.value)}>
                  {contasCorrentes.filter((c) => c.ativo).map((c) => (
                    <option key={c.codigo} value={c.codigo}>{c.nome}</option>
                  ))}
                </select>
              </div>
        </Modal>
      )}

      {modalDatasAberto && (
        <Modal
          maxWidth="max-w-md"
          bodyClassName={modalDatasPasso === 'form' ? 'p-6 space-y-4' : 'p-6 space-y-2 text-sm text-gray-700 dark:text-gray-200'}
          footerClassName="p-6 border-t dark:border-gray-700 flex justify-end gap-3 text-sm"
          header={(
            <>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {modalDatasPasso === 'form' ? 'Editar datas em massa' : 'Confirmar alteração'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{selecionadosCount} conta(s) selecionada(s)</p>
            </>
          )}
          footer={(
            <>
              {modalDatasPasso === 'confirm' && (
                <button
                  type="button"
                  disabled={processandoLote}
                  onClick={() => setModalDatasPasso('form')}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Voltar
                </button>
              )}
              <button
                type="button"
                disabled={processandoLote}
                onClick={fecharModalDatas}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancelar
              </button>
              {modalDatasPasso === 'form' ? (
                <button
                  type="button"
                  onClick={avancarConfirmacaoDatas}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  disabled={processandoLote}
                  onClick={confirmarLoteDatas}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {processandoLote ? 'Aplicando...' : 'Confirmar'}
                </button>
              )}
            </>
          )}
        >
            {modalDatasPasso === 'form' ? (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Deixe em branco o campo que não quiser alterar. Não é possível limpar datas neste lote.
                </p>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de vencimento</label>
                  <input
                    type="date"
                    className={INPUT}
                    value={loteVencimento}
                    onChange={(e) => setLoteVencimento(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de pagamento</label>
                  <input
                    type="date"
                    className={INPUT}
                    value={lotePagamento}
                    onChange={(e) => setLotePagamento(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <p>
                  Aplicar a <strong>{selecionadosCount}</strong> conta(s):
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {loteVencimento && <li>Vencimento → {loteVencimento}</li>}
                  {lotePagamento && <li>Pagamento → {lotePagamento} (marca como paga)</li>}
                </ul>
              </>
            )}
        </Modal>
      )}
    </div>
  );
}
