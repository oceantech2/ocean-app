import { lazy, ReactNode, Suspense, useState } from 'react';
import { registroDoModelo } from '../modelos';
import { contarCaracteres, LIMITE_ESCOPO, MSG_ESCOPO_LONGO } from '../modelos/escopo';
import { EMAIL_RE, formatarPagamento, formatarTaxa, telefoneValido } from '../modelos/formatacao';
import {
  formatoNovo,
  LIMITE_PROJETOS,
  mesesPorExtenso,
  projetosDaProposta,
  TEXTOS_PADRAO_GARANTIAS,
  VALIDADE_DIAS_MAX,
} from '../modelos/formatoProposta';
import { IDIOMAS_FORM, idiomaDaProposta, MOEDAS_FORM, PREFIXO_MOEDA } from '../modelos/idioma';
import { TIPOS } from '../modelos/investimentos';
import { SETORES } from '../modelos/setores';
import type {
  Idioma,
  Investimento,
  ModeloId,
  Moeda,
  PerfilConsultor,
  Projeto,
  Proposta,
  PropostaModeloPayload,
  SetorId,
  TaxaTipo,
  TipoInvestimento,
} from '../services/proposalApi';
import {
  centavosParaDecimal,
  DIAS_VALIDADE_PADRAO,
  formatarData,
  hojeSP,
  parseNumeroBR,
  somarDias,
} from '../utils/propostaCalculo';

// Carregado sob demanda: o editor não entra no código da página pública do cliente
const EditorEscopo = lazy(() => import('./EditorEscopo'));

export interface InvestimentoForm {
  ativo: boolean;
  taxa_tipo: TaxaTipo;
  taxa: string;
  entrada: string;
}

export interface ProjetoForm {
  // Identidade estável para a lista do React ao reordenar
  chave: number;
  nome: string;
  investimentos: Record<TipoInvestimento, InvestimentoForm>;
}

export interface FormModelo {
  idioma: Idioma;
  moeda: Moeda;
  cliente_nome: string;
  data_proposta: string;
  setor: SetorId | '';
  consultor_nome: string;
  consultor_cargo: string;
  consultor_telefone: string;
  consultor_email: string;
  projeto_escopo: string;
  projetos: ProjetoForm[];
  shortlist: string;
  sla: string;
  garantia: string;
  validade_dias: string;
}

type Erros = Record<string, string | undefined>;

const LIMITE_VALOR_CENTAVOS = 100_000_000_000_000;

let ultimaChave = 0;
const novaChave = () => ++ultimaChave;

const investimentoVazio = (): InvestimentoForm => ({ ativo: false, taxa_tipo: 'percentual', taxa: '', entrada: '' });

const investimentosVazios = (): Record<TipoInvestimento, InvestimentoForm> => ({
  retainer: investimentoVazio(),
  sucesso: investimentoVazio(),
  'valor-fechado': investimentoVazio(),
});

const projetoVazio = (): ProjetoForm => ({ chave: novaChave(), nome: '', investimentos: investimentosVazios() });

export const formModeloInicial = (consultor?: PerfilConsultor | null): FormModelo => ({
  idioma: 'pt-BR',
  moeda: 'BRL',
  cliente_nome: '',
  data_proposta: hojeSP(),
  setor: '',
  consultor_nome: consultor?.nome ?? '',
  consultor_cargo: consultor?.cargo ?? '',
  consultor_telefone: consultor?.telefone ?? '',
  consultor_email: consultor?.email ?? '',
  projeto_escopo: '',
  projetos: [projetoVazio()],
  shortlist: TEXTOS_PADRAO_GARANTIAS['pt-BR'].shortlist,
  sla: TEXTOS_PADRAO_GARANTIAS['pt-BR'].sla,
  garantia: '',
  validade_dias: String(DIAS_VALIDADE_PADRAO),
});

const taxaParaBR = (taxa: string) => Number(taxa).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

function projetoParaForm(projeto: Projeto): ProjetoForm {
  const investimentos = investimentosVazios();
  for (const inv of projeto.investimentos) {
    investimentos[inv.tipo] = {
      ativo: true,
      taxa_tipo: inv.taxa_tipo,
      taxa: taxaParaBR(inv.taxa),
      entrada: inv.entrada ? String(inv.entrada) : '',
    };
  }
  return { chave: novaChave(), nome: projeto.nome, investimentos };
}

function diasEntre(inicio: string, fim: string): number {
  return Math.round((Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) / 86_400_000);
}

/** Formulário a partir de uma proposta; propostas no formato antigo (ES v1/v2) são convertidas. */
export function formDeModelo(p: Proposta, opcoes: { copia?: boolean } = {}): FormModelo {
  const idioma = idiomaDaProposta(p);
  const novo = formatoNovo(p);
  const projetos = projetosDaProposta(p).map(projetoParaForm);
  const dias = opcoes.copia
    ? DIAS_VALIDADE_PADRAO
    : p.validade_dias ?? (p.data_proposta ? diasEntre(p.data_proposta, p.validade) : DIAS_VALIDADE_PADRAO);
  return {
    idioma,
    moeda: p.moeda ?? 'BRL',
    cliente_nome: p.cliente_nome,
    data_proposta: opcoes.copia || !p.data_proposta ? hojeSP() : p.data_proposta,
    setor: p.setor ?? '',
    consultor_nome: p.consultor_nome ?? '',
    consultor_cargo: p.consultor_cargo ?? '',
    consultor_telefone: p.consultor_telefone ?? '',
    consultor_email: p.consultor_email ?? '',
    projeto_escopo: p.projeto_escopo ?? '',
    projetos: projetos.length ? projetos : [projetoVazio()],
    shortlist: novo ? p.shortlist ?? '' : TEXTOS_PADRAO_GARANTIAS[idioma].shortlist,
    sla: novo ? p.sla ?? '' : TEXTOS_PADRAO_GARANTIAS[idioma].sla,
    garantia: novo ? p.garantia ?? '' : p.garantia_meses ? mesesPorExtenso(p.garantia_meses, idioma) : '',
    validade_dias: String(dias),
  };
}

const parseTaxa = (texto: string) => parseNumeroBR(texto, 2);

function parseEntrada(texto: string): number | null | undefined {
  const t = texto.trim();
  if (!t) return null;
  if (!/^\d{1,2}$/.test(t)) return undefined;
  return Number(t) || null;
}

function investimentoDoForm(tipo: TipoInvestimento, inv: InvestimentoForm): Investimento | null {
  const centesimos = parseTaxa(inv.taxa);
  const entrada = parseEntrada(inv.entrada);
  if (!centesimos || entrada === undefined) return null;
  return { tipo, taxa_tipo: inv.taxa_tipo, taxa: centavosParaDecimal(centesimos), entrada };
}

function investimentosDoProjeto(projeto: ProjetoForm): Investimento[] {
  return TIPOS.filter(({ tipo }) => projeto.investimentos[tipo].ativo)
    .map(({ tipo }) => investimentoDoForm(tipo, projeto.investimentos[tipo]))
    .filter((inv): inv is Investimento => inv !== null);
}

/** Validade calculada (data da proposta + dias) ou null quando os dias são inválidos. */
function validadeCalculada(form: FormModelo): string | null {
  const dias = Number(form.validade_dias);
  if (!form.data_proposta || !/^\d+$/.test(form.validade_dias) || dias < 1 || dias > VALIDADE_DIAS_MAX) return null;
  return somarDias(form.data_proposta, dias);
}

function validar(form: FormModelo): Erros {
  const erros: Erros = {};
  if (!form.cliente_nome.trim()) erros.cliente_nome = 'Informe a empresa';
  if (!form.data_proposta) erros.data_proposta = 'Informe a data da proposta';
  if (!form.setor) erros.setor = 'Selecione o setor';
  if (!form.consultor_nome.trim()) erros.consultor_nome = 'Informe o nome do consultor';
  if (!form.consultor_cargo.trim()) erros.consultor_cargo = 'Informe o cargo do consultor';
  if (!telefoneValido(form.consultor_telefone)) erros.consultor_telefone = 'Telefone do consultor inválido';
  if (!EMAIL_RE.test(form.consultor_email.trim())) erros.consultor_email = 'E-mail do consultor inválido';
  if (contarCaracteres(form.projeto_escopo) > LIMITE_ESCOPO) erros.projeto_escopo = MSG_ESCOPO_LONGO;

  form.projetos.forEach((projeto, i) => {
    const p = `projeto.${i}`;
    if (!projeto.nome.trim()) erros[`${p}.nome`] = 'Informe o nome do projeto';
    const ativos = TIPOS.filter(({ tipo }) => projeto.investimentos[tipo].ativo);
    if (!ativos.length) erros[`${p}.investimentos`] = 'Selecione de 1 a 3 modelos de investimento';
    for (const { tipo, rotulo } of ativos) {
      const inv = projeto.investimentos[tipo];
      const centesimos = parseTaxa(inv.taxa);
      if (inv.taxa_tipo === 'percentual') {
        if (!centesimos || centesimos >= 10000) {
          erros[`${p}.${tipo}.taxa`] = `Taxa do ${rotulo} deve ser maior que 0 e menor que 100%`;
        }
      } else if (!centesimos || centesimos >= LIMITE_VALOR_CENTAVOS) {
        erros[`${p}.${tipo}.taxa`] = `Taxa do ${rotulo} deve ser maior que zero`;
      }
      if (parseEntrada(inv.entrada) === undefined) {
        erros[`${p}.${tipo}.entrada`] = `Entrada do ${rotulo} deve estar entre 0 e 99%`;
      }
    }
  });

  if (form.data_proposta) {
    const validade = validadeCalculada(form);
    if (!validade) erros.validade_dias = `Validade deve ser de 1 a ${VALIDADE_DIAS_MAX} dias`;
    else if (validade <= hojeSP()) erros.validade_dias = 'A validade calculada já passou. Ajuste a data ou os dias.';
  }
  return erros;
}

function Erro({ msg }: { msg?: string }) {
  return msg ? <p className="text-sm text-red-600 mt-1">{msg}</p> : null;
}

const semErrosDeProjeto = (e: Erros): Erros =>
  Object.fromEntries(Object.entries(e).filter(([chave]) => !chave.startsWith('projeto.')));

interface Props {
  inicial: FormModelo;
  modelo: ModeloId;
  rotuloSalvar: string;
  rotuloSalvando: string;
  salvando: boolean;
  onSubmit: (payload: PropostaModeloPayload) => void;
  aviso?: ReactNode;
  idiomaMoedaFixos?: boolean;
}

export default function ModeloForm({
  inicial,
  modelo,
  rotuloSalvar,
  rotuloSalvando,
  salvando,
  onSubmit,
  aviso,
  idiomaMoedaFixos,
}: Props) {
  const [form, setForm] = useState<FormModelo>(inicial);
  const [erros, setErros] = useState<Erros>({});
  const registro = registroDoModelo(modelo);

  const set = <K extends keyof FormModelo>(campo: K, valor: FormModelo[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  // Troca só os textos que ainda são o padrão do idioma anterior; o que o consultor digitou fica
  const trocarIdioma = (idioma: Idioma) => {
    setForm((f) => {
      const antes = TEXTOS_PADRAO_GARANTIAS[f.idioma];
      const depois = TEXTOS_PADRAO_GARANTIAS[idioma];
      return {
        ...f,
        idioma,
        shortlist: f.shortlist === antes.shortlist ? depois.shortlist : f.shortlist,
        sla: f.sla === antes.sla ? depois.sla : f.sla,
      };
    });
  };

  const setProjeto = (i: number, mudanca: Partial<ProjetoForm>) => {
    setForm((f) => ({ ...f, projetos: f.projetos.map((p, j) => (j === i ? { ...p, ...mudanca } : p)) }));
    setErros((e) => ({ ...e, [`projeto.${i}.nome`]: undefined }));
  };

  const setInv = (i: number, tipo: TipoInvestimento, mudanca: Partial<InvestimentoForm>) => {
    setForm((f) => ({
      ...f,
      projetos: f.projetos.map((p, j) =>
        j === i ? { ...p, investimentos: { ...p.investimentos, [tipo]: { ...p.investimentos[tipo], ...mudanca } } } : p,
      ),
    }));
    setErros((e) => ({
      ...e,
      [`projeto.${i}.investimentos`]: undefined,
      [`projeto.${i}.${tipo}.taxa`]: undefined,
      [`projeto.${i}.${tipo}.entrada`]: undefined,
    }));
  };

  // Erros de projeto são indexados pela posição: mudar a lista invalida os que estão na tela
  const mudarProjetos = (mudar: (projetos: ProjetoForm[]) => ProjetoForm[]) => {
    setForm((f) => ({ ...f, projetos: mudar(f.projetos) }));
    setErros(semErrosDeProjeto);
  };

  const adicionarProjeto = () =>
    mudarProjetos((ps) => (ps.length < LIMITE_PROJETOS ? [...ps, projetoVazio()] : ps));
  const removerProjeto = (i: number) => mudarProjetos((ps) => (ps.length > 1 ? ps.filter((_, j) => j !== i) : ps));
  const moverProjeto = (i: number, destino: number) =>
    mudarProjetos((ps) => {
      if (destino < 0 || destino >= ps.length) return ps;
      const copia = [...ps];
      [copia[i], copia[destino]] = [copia[destino], copia[i]];
      return copia;
    });

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    const encontrados = validar(form);
    setErros(encontrados);
    if (Object.values(encontrados).some(Boolean)) return;
    onSubmit({
      modelo,
      idioma: form.idioma,
      moeda: form.moeda,
      cliente_nome: form.cliente_nome.trim(),
      data_proposta: form.data_proposta,
      setor: form.setor,
      consultor_nome: form.consultor_nome.trim(),
      consultor_cargo: form.consultor_cargo.trim(),
      consultor_telefone: form.consultor_telefone.trim(),
      consultor_email: form.consultor_email.trim(),
      projeto_escopo: contarCaracteres(form.projeto_escopo) ? form.projeto_escopo : null,
      projetos: form.projetos.map((p) => ({ nome: p.nome.trim(), investimentos: investimentosDoProjeto(p) })),
      shortlist: form.shortlist.trim() || null,
      sla: form.sla.trim() || null,
      garantia: form.garantia.trim() || null,
      validade_dias: Number(form.validade_dias),
    });
  };

  const inputCls = (erro?: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-600 ${
      erro ? 'border-red-400' : 'border-gray-300'
    }`;
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const secaoCls = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4';
  const botaoProjetoCls =
    'px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition';

  const texto = (campo: 'cliente_nome' | 'consultor_nome' | 'consultor_cargo', rotulo: string) => (
    <div>
      <label className={labelCls}>{rotulo}</label>
      <input
        value={form[campo]}
        onChange={(e) => set(campo, e.target.value)}
        className={inputCls(erros[campo])}
        maxLength={255}
      />
      <Erro msg={erros[campo]} />
    </div>
  );

  const condicao = (campo: 'shortlist' | 'sla' | 'garantia', rotulo: string, placeholder: string) => (
    <div>
      <label className={labelCls}>{rotulo} (opcional)</label>
      <input
        value={form[campo]}
        onChange={(e) => set(campo, e.target.value)}
        className={inputCls()}
        maxLength={255}
        placeholder={placeholder}
      />
    </div>
  );

  const validade = validadeCalculada(form);
  const garantiaResumo = form.garantia.trim();

  return (
    <>
      {aviso}
      <form onSubmit={salvar} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className={secaoCls}>
            <h2 className="font-semibold text-gray-900">Apresentação</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Idioma da apresentação</label>
                <select
                  value={form.idioma}
                  onChange={(e) => trocarIdioma(e.target.value as Idioma)}
                  disabled={idiomaMoedaFixos}
                  className={`${inputCls()} disabled:bg-gray-100 disabled:text-gray-600`}
                >
                  {IDIOMAS_FORM.map((i) => (
                    <option key={i.idioma} value={i.idioma}>
                      {i.rotulo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Moeda</label>
                <select
                  value={form.moeda}
                  onChange={(e) => set('moeda', e.target.value as Moeda)}
                  disabled={idiomaMoedaFixos}
                  className={`${inputCls()} disabled:bg-gray-100 disabled:text-gray-600`}
                >
                  {MOEDAS_FORM.map((m) => (
                    <option key={m.moeda} value={m.moeda}>
                      {m.rotulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {idiomaMoedaFixos
                ? 'Idioma e moeda não podem ser alterados depois de criada.'
                : 'O idioma define os textos da página que o cliente recebe; a moeda, o símbolo dos valores.'}
            </p>
          </section>

          <section className={secaoCls}>
            <h2 className="font-semibold text-gray-900">Cliente</h2>
            {texto('cliente_nome', 'Empresa')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Data</label>
                <input
                  type="date"
                  value={form.data_proposta}
                  onChange={(e) => {
                    set('data_proposta', e.target.value);
                    setErros((er) => ({ ...er, validade_dias: undefined }));
                  }}
                  className={inputCls(erros.data_proposta)}
                />
                <Erro msg={erros.data_proposta} />
              </div>
              <div>
                <label className={labelCls}>Setor</label>
                <select
                  value={form.setor}
                  onChange={(e) => set('setor', e.target.value as SetorId | '')}
                  className={inputCls(erros.setor)}
                >
                  <option value="">Selecione…</option>
                  {SETORES.map((s) => (
                    <option key={s.chave} value={s.chave}>
                      {s.rotulo}
                    </option>
                  ))}
                </select>
                <Erro msg={erros.setor} />
              </div>
            </div>
          </section>

          <section className={secaoCls}>
            <h2 className="font-semibold text-gray-900">Consultor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {texto('consultor_nome', 'Nome')}
              {texto('consultor_cargo', 'Cargo')}
              <div>
                <label className={labelCls}>Telefone</label>
                <input
                  value={form.consultor_telefone}
                  onChange={(e) => set('consultor_telefone', e.target.value)}
                  className={inputCls(erros.consultor_telefone)}
                  inputMode="tel"
                  maxLength={30}
                  placeholder="(21) 99999-9999"
                />
                <Erro msg={erros.consultor_telefone} />
              </div>
              <div>
                <label className={labelCls}>E-mail</label>
                <input
                  type="email"
                  value={form.consultor_email}
                  onChange={(e) => set('consultor_email', e.target.value)}
                  className={inputCls(erros.consultor_email)}
                  inputMode="email"
                  maxLength={255}
                />
                <Erro msg={erros.consultor_email} />
              </div>
            </div>
          </section>

          <section className={secaoCls}>
            <h2 className="font-semibold text-gray-900">{registro.rotuloEscopo} (opcional)</h2>
            <div>
              <Suspense
                fallback={
                  <div className="h-[12.5rem] border border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full border-2 border-ocean-600 border-t-transparent animate-spin" />
                  </div>
                }
              >
                <EditorEscopo
                  valor={form.projeto_escopo}
                  onChange={(html) => set('projeto_escopo', html)}
                  erro={erros.projeto_escopo}
                  rotulo={registro.rotuloEscopo}
                />
              </Suspense>
              <p className="text-sm text-gray-500 mt-1">
                Aparece na seção {registro.rotuloEscopo} da proposta. Deixe em branco para não exibir a seção.
              </p>
              <Erro msg={erros.projeto_escopo} />
            </div>
          </section>

          <section className={secaoCls}>
            <h2 className="font-semibold text-gray-900">Projetos</h2>
            {form.projetos.map((projeto, i) => {
              const p = `projeto.${i}`;
              return (
                <div key={projeto.chave} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-gray-900">Projeto {i + 1}</h3>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moverProjeto(i, i - 1)}
                        disabled={i === 0}
                        className={botaoProjetoCls}
                      >
                        Subir
                      </button>
                      <button
                        type="button"
                        onClick={() => moverProjeto(i, i + 1)}
                        disabled={i === form.projetos.length - 1}
                        className={botaoProjetoCls}
                      >
                        Descer
                      </button>
                      {form.projetos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerProjeto(i)}
                          className={`${botaoProjetoCls} text-red-700 border-red-200 hover:bg-red-50`}
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Nome do projeto</label>
                    <input
                      value={projeto.nome}
                      onChange={(e) => setProjeto(i, { nome: e.target.value })}
                      className={inputCls(erros[`${p}.nome`])}
                      maxLength={255}
                    />
                    <Erro msg={erros[`${p}.nome`]} />
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-4">
                      {TIPOS.map(({ tipo, rotulo }) => (
                        <label key={tipo} className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={projeto.investimentos[tipo].ativo}
                            onChange={(e) => setInv(i, tipo, { ativo: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-ocean-700 focus:ring-ocean-600"
                          />
                          {rotulo}
                        </label>
                      ))}
                    </div>
                    <Erro msg={erros[`${p}.investimentos`]} />
                  </div>

                  {TIPOS.filter(({ tipo }) => projeto.investimentos[tipo].ativo).map(({ tipo, rotulo }) => {
                    const inv = projeto.investimentos[tipo];
                    const entrada = parseEntrada(inv.entrada);
                    return (
                      <div key={tipo} className="border border-gray-100 bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="font-medium text-gray-900">{rotulo}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelCls}>Taxa</label>
                            <div className="flex gap-2">
                              <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden shrink-0">
                                {(['percentual', 'valor'] as TaxaTipo[]).map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setInv(i, tipo, { taxa_tipo: t })}
                                    className={`px-3 text-sm font-medium transition ${
                                      inv.taxa_tipo === t
                                        ? 'bg-ocean-700 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {t === 'percentual' ? '%' : PREFIXO_MOEDA[form.moeda]}
                                  </button>
                                ))}
                              </div>
                              <input
                                value={inv.taxa}
                                onChange={(e) => setInv(i, tipo, { taxa: e.target.value.replace(/[^\d.,]/g, '') })}
                                className={`${inputCls(erros[`${p}.${tipo}.taxa`])} bg-white`}
                                inputMode="decimal"
                                placeholder={inv.taxa_tipo === 'percentual' ? '15' : '50.000,00'}
                              />
                            </div>
                            <Erro msg={erros[`${p}.${tipo}.taxa`]} />
                          </div>
                          <div>
                            <label className={labelCls}>Entrada (%) — opcional</label>
                            <input
                              value={inv.entrada}
                              onChange={(e) =>
                                setInv(i, tipo, { entrada: e.target.value.replace(/\D/g, '').slice(0, 2) })
                              }
                              className={`${inputCls(erros[`${p}.${tipo}.entrada`])} bg-white`}
                              inputMode="numeric"
                              placeholder="0"
                            />
                            <Erro msg={erros[`${p}.${tipo}.entrada`]} />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Após conclusão: {entrada === undefined ? '—' : `${100 - (entrada ?? 0)}%`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={adicionarProjeto}
                disabled={form.projetos.length >= LIMITE_PROJETOS}
                className="px-4 py-2 rounded-lg border border-ocean-700 text-ocean-700 font-medium hover:bg-ocean-50 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent transition"
              >
                Adicionar projeto
              </button>
              {form.projetos.length >= LIMITE_PROJETOS && (
                <span className="text-sm text-gray-500">Limite de {LIMITE_PROJETOS} projetos</span>
              )}
            </div>
          </section>

          <section className={secaoCls}>
            <h2 className="font-semibold text-gray-900">Garantias e condições</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {condicao('shortlist', 'Shortlist', TEXTOS_PADRAO_GARANTIAS[form.idioma].shortlist)}
              {condicao('sla', 'SLA', TEXTOS_PADRAO_GARANTIAS[form.idioma].sla)}
              {condicao('garantia', 'Garantia', form.idioma === 'en-US' ? '4 months' : '4 meses')}
            </div>
            <p className="text-sm text-gray-500">
              Campos vazios não aparecem na proposta.{' '}
              {registro.garantiasSempreVisivel
                ? 'As Observações do modelo continuam aparecendo.'
                : 'Se os três ficarem vazios, a seção não aparece.'}
            </p>
          </section>

          <section className={secaoCls}>
            <h2 className="font-semibold text-gray-900">Validade</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div>
                <label className={labelCls}>Validade (dias)</label>
                <input
                  value={form.validade_dias}
                  onChange={(e) => set('validade_dias', e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className={inputCls(erros.validade_dias)}
                  inputMode="numeric"
                />
                <Erro msg={erros.validade_dias} />
              </div>
              <p className="text-sm text-gray-700 sm:pt-8">
                {validade ? `Válida até ${formatarData(validade)}` : '—'}
              </p>
            </div>
          </section>
        </div>

        <aside className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit space-y-3 lg:sticky lg:top-6">
          <h2 className="font-semibold text-gray-900">Resumo</h2>
          {form.projetos.map((projeto, i) => {
            const ativos = TIPOS.filter(({ tipo }) => projeto.investimentos[tipo].ativo);
            return (
              <div key={projeto.chave} className="space-y-2 border-b border-gray-100 pb-3">
                <div className="text-sm font-semibold text-gray-900">{projeto.nome.trim() || `Projeto ${i + 1}`}</div>
                {ativos.length === 0 && (
                  <p className="text-sm text-gray-500">Nenhum modelo de investimento selecionado.</p>
                )}
                {ativos.map(({ tipo, rotulo }) => {
                  const inv = investimentoDoForm(tipo, projeto.investimentos[tipo]);
                  return (
                    <div key={tipo} className="text-sm text-gray-700">
                      <div className="flex justify-between font-medium text-gray-800">
                        <span>{rotulo}</span>
                        <span>{inv ? formatarTaxa(inv, { moeda: form.moeda }) : '—'}</span>
                      </div>
                      <div className="text-gray-600">{inv ? formatarPagamento(inv.entrada) : 'Preencha a taxa'}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div className="flex justify-between gap-4 text-sm text-gray-700">
            <span>Garantia</span>
            <span className="text-right">{garantiaResumo || '—'}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm text-gray-700">
            <span>Válida até</span>
            <span>{validade ? formatarData(validade) : '—'}</span>
          </div>
          <button
            type="submit"
            disabled={salvando}
            className="w-full mt-2 bg-ocean-700 text-white font-semibold py-2 rounded-lg hover:bg-ocean-800 disabled:bg-gray-400 transition"
          >
            {salvando ? rotuloSalvando : rotuloSalvar}
          </button>
        </aside>
      </form>
    </>
  );
}
