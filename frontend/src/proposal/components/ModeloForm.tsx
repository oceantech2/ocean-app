import { lazy, ReactNode, Suspense, useState } from 'react';
import { contarCaracteres, LIMITE_ESCOPO, MSG_ESCOPO_LONGO } from '../modelos/escopo';
import { EMAIL_RE, formatarGarantia, formatarPagamento, formatarTaxa, telefoneValido } from '../modelos/formatacao';
import { MOEDAS_FORM, PREFIXO_MOEDA } from '../modelos/idioma';
import { TIPOS } from '../modelos/investimentos';
import { SETORES } from '../modelos/setores';
import type {
  Investimento,
  ModeloId,
  Moeda,
  PerfilConsultor,
  Proposta,
  PropostaModeloPayload,
  SetorId,
  TaxaTipo,
  TipoInvestimento,
} from '../services/proposalApi';
import { centavosParaDecimal, hojeSP, parseNumeroBR, somarDias, validadePadrao } from '../utils/propostaCalculo';

// Carregado sob demanda: o editor não entra no código da página pública do cliente
const EditorEscopo = lazy(() => import('./EditorEscopo'));

export interface InvestimentoForm {
  ativo: boolean;
  taxa_tipo: TaxaTipo;
  taxa: string;
  entrada: string;
}

export interface FormModelo {
  modelo: ModeloId;
  moeda: Moeda;
  cliente_nome: string;
  data_proposta: string;
  setor: SetorId | '';
  consultor_nome: string;
  consultor_cargo: string;
  consultor_telefone: string;
  consultor_email: string;
  projeto_nome: string;
  projeto_escopo: string;
  garantia_meses: string;
  validade: string;
  investimentos: Record<TipoInvestimento, InvestimentoForm>;
}

type Erros = Record<string, string | undefined>;

const LIMITE_VALOR_CENTAVOS = 100_000_000_000_000;

const investimentoVazio = (): InvestimentoForm => ({ ativo: false, taxa_tipo: 'percentual', taxa: '', entrada: '' });

const investimentosVazios = (): Record<TipoInvestimento, InvestimentoForm> => ({
  retainer: investimentoVazio(),
  sucesso: investimentoVazio(),
  'valor-fechado': investimentoVazio(),
});

export const formModeloInicial = (consultor?: PerfilConsultor | null, modelo: ModeloId = 'executive-search'): FormModelo => ({
  modelo,
  moeda: 'BRL',
  cliente_nome: '',
  data_proposta: hojeSP(),
  setor: '',
  consultor_nome: consultor?.nome ?? '',
  consultor_cargo: consultor?.cargo ?? '',
  consultor_telefone: consultor?.telefone ?? '',
  consultor_email: consultor?.email ?? '',
  projeto_nome: '',
  projeto_escopo: '',
  garantia_meses: '',
  validade: validadePadrao(),
  investimentos: investimentosVazios(),
});

const taxaParaBR = (taxa: string) => Number(taxa).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function formDeModelo(p: Proposta, opcoes: { dataHoje?: boolean; validadePadrao?: boolean } = {}): FormModelo {
  const investimentos = investimentosVazios();
  for (const inv of p.investimentos ?? []) {
    investimentos[inv.tipo] = {
      ativo: true,
      taxa_tipo: inv.taxa_tipo,
      taxa: taxaParaBR(inv.taxa),
      entrada: inv.entrada ? String(inv.entrada) : '',
    };
  }
  return {
    modelo: p.modelo as ModeloId,
    moeda: p.moeda ?? 'BRL',
    cliente_nome: p.cliente_nome,
    data_proposta: opcoes.dataHoje || !p.data_proposta ? hojeSP() : p.data_proposta,
    setor: p.setor ?? '',
    consultor_nome: p.consultor_nome ?? '',
    consultor_cargo: p.consultor_cargo ?? '',
    consultor_telefone: p.consultor_telefone ?? '',
    consultor_email: p.consultor_email ?? '',
    projeto_nome: p.projeto_nome ?? '',
    projeto_escopo: p.projeto_escopo ?? '',
    garantia_meses: p.garantia_meses ? String(p.garantia_meses) : '',
    validade: opcoes.validadePadrao ? validadePadrao() : p.validade,
    investimentos,
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

function validar(form: FormModelo): Erros {
  const erros: Erros = {};
  if (!form.cliente_nome.trim()) erros.cliente_nome = 'Informe a empresa';
  if (!form.data_proposta) erros.data_proposta = 'Informe a data da proposta';
  else if (form.validade && form.data_proposta > form.validade) {
    erros.data_proposta = 'Data da proposta não pode ser posterior à validade';
  }
  if (!form.setor) erros.setor = 'Selecione o setor';
  if (!form.consultor_nome.trim()) erros.consultor_nome = 'Informe o nome do consultor';
  if (!form.consultor_cargo.trim()) erros.consultor_cargo = 'Informe o cargo do consultor';
  if (!telefoneValido(form.consultor_telefone)) erros.consultor_telefone = 'Telefone do consultor inválido';
  if (!EMAIL_RE.test(form.consultor_email.trim())) erros.consultor_email = 'E-mail do consultor inválido';
  if (!form.projeto_nome.trim()) erros.projeto_nome = 'Informe o nome do projeto';
  if (contarCaracteres(form.projeto_escopo) > LIMITE_ESCOPO) erros.projeto_escopo = MSG_ESCOPO_LONGO;
  const garantia = Number(form.garantia_meses);
  if (!/^\d+$/.test(form.garantia_meses.trim()) || garantia < 1 || garantia > 120) {
    erros.garantia_meses = 'Garantia deve ser um número de meses maior que zero';
  }
  if (!form.validade || form.validade <= hojeSP()) erros.validade = 'Validade deve ser posterior a hoje';

  const ativos = TIPOS.filter(({ tipo }) => form.investimentos[tipo].ativo);
  if (!ativos.length) erros.investimentos = 'Selecione de 1 a 3 modelos de investimento';
  for (const { tipo, rotulo } of ativos) {
    const inv = form.investimentos[tipo];
    const centesimos = parseTaxa(inv.taxa);
    if (inv.taxa_tipo === 'percentual') {
      if (!centesimos || centesimos >= 10000) {
        erros[`${tipo}.taxa`] = `Taxa do ${rotulo} deve ser maior que 0 e menor que 100%`;
      }
    } else if (!centesimos || centesimos >= LIMITE_VALOR_CENTAVOS) {
      erros[`${tipo}.taxa`] = `Taxa do ${rotulo} deve ser maior que zero`;
    }
    if (parseEntrada(inv.entrada) === undefined) {
      erros[`${tipo}.entrada`] = `Entrada do ${rotulo} deve estar entre 0 e 99%`;
    }
  }
  return erros;
}

function Erro({ msg }: { msg?: string }) {
  return msg ? <p className="text-sm text-red-600 mt-1">{msg}</p> : null;
}

interface Props {
  inicial: FormModelo;
  rotuloSalvar: string;
  rotuloSalvando: string;
  salvando: boolean;
  onSubmit: (payload: PropostaModeloPayload) => void;
  aviso?: ReactNode;
  moedaFixa?: boolean;
}

export default function ModeloForm({ inicial, rotuloSalvar, rotuloSalvando, salvando, onSubmit, aviso, moedaFixa }: Props) {
  const [form, setForm] = useState<FormModelo>(inicial);
  const [erros, setErros] = useState<Erros>({});

  const set = <K extends keyof FormModelo>(campo: K, valor: FormModelo[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const setInv = (tipo: TipoInvestimento, mudanca: Partial<InvestimentoForm>) => {
    setForm((f) => ({ ...f, investimentos: { ...f.investimentos, [tipo]: { ...f.investimentos[tipo], ...mudanca } } }));
    setErros((e) => ({ ...e, investimentos: undefined, [`${tipo}.taxa`]: undefined, [`${tipo}.entrada`]: undefined }));
  };

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    const encontrados = validar(form);
    setErros(encontrados);
    if (Object.values(encontrados).some(Boolean)) return;
    onSubmit({
      modelo: form.modelo,
      moeda: form.moeda,
      cliente_nome: form.cliente_nome.trim(),
      data_proposta: form.data_proposta,
      setor: form.setor,
      consultor_nome: form.consultor_nome.trim(),
      consultor_cargo: form.consultor_cargo.trim(),
      consultor_telefone: form.consultor_telefone.trim(),
      consultor_email: form.consultor_email.trim(),
      projeto_nome: form.projeto_nome.trim(),
      projeto_escopo: contarCaracteres(form.projeto_escopo) ? form.projeto_escopo : null,
      garantia_meses: Number(form.garantia_meses),
      validade: form.validade,
      investimentos: TIPOS.filter(({ tipo }) => form.investimentos[tipo].ativo)
        .map(({ tipo }) => investimentoDoForm(tipo, form.investimentos[tipo]))
        .filter((inv): inv is Investimento => inv !== null),
    });
  };

  const inputCls = (erro?: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-600 ${
      erro ? 'border-red-400' : 'border-gray-300'
    }`;
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const secaoCls = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4';

  const texto = (campo: 'cliente_nome' | 'consultor_nome' | 'consultor_cargo' | 'projeto_nome', rotulo: string) => (
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

  const resumo = TIPOS.filter(({ tipo }) => form.investimentos[tipo].ativo).map(({ tipo, rotulo }) => {
    const inv = investimentoDoForm(tipo, form.investimentos[tipo]);
    return { tipo, rotulo, inv };
  });
  const garantia = Number(form.garantia_meses);

  return (
    <>
      {aviso}
      <form onSubmit={salvar} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className={secaoCls}>
            <h2 className="font-semibold text-gray-900">Moeda</h2>
            <div>
              <select
                value={form.moeda}
                onChange={(e) => set('moeda', e.target.value as Moeda)}
                disabled={moedaFixa}
                className={`${inputCls()} disabled:bg-gray-100 disabled:text-gray-600`}
              >
                {MOEDAS_FORM.map((m) => (
                  <option key={m.moeda} value={m.moeda}>
                    {m.rotulo}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {moedaFixa
                  ? 'A moeda não pode ser alterada depois de criada.'
                  : 'Define a moeda dos valores e o idioma da página que o cliente recebe.'}
              </p>
            </div>
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
                  max={form.validade || undefined}
                  onChange={(e) => set('data_proposta', e.target.value)}
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
            <h2 className="font-semibold text-gray-900">Projeto</h2>
            {texto('projeto_nome', 'Nome do projeto')}
            <div>
              <label className={labelCls}>Escopo do Projeto (opcional)</label>
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
                />
              </Suspense>
              <p className="text-sm text-gray-500 mt-1">
                Aparece na seção Escopo do Projeto da proposta. Deixe em branco para não exibir a seção.
              </p>
              <Erro msg={erros.projeto_escopo} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Garantia (meses)</label>
                <input
                  value={form.garantia_meses}
                  onChange={(e) => set('garantia_meses', e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className={inputCls(erros.garantia_meses)}
                  inputMode="numeric"
                />
                <Erro msg={erros.garantia_meses} />
              </div>
              <div>
                <label className={labelCls}>Validade</label>
                <input
                  type="date"
                  value={form.validade}
                  min={somarDias(hojeSP(), 1)}
                  onChange={(e) => {
                    set('validade', e.target.value);
                    setErros((er) => ({ ...er, data_proposta: undefined }));
                  }}
                  className={inputCls(erros.validade)}
                />
                <Erro msg={erros.validade} />
              </div>
            </div>
          </section>

          <section className={secaoCls}>
            <h2 className="font-semibold text-gray-900">Investimento</h2>
            <div className="flex flex-wrap gap-4">
              {TIPOS.map(({ tipo, rotulo }) => (
                <label key={tipo} className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.investimentos[tipo].ativo}
                    onChange={(e) => setInv(tipo, { ativo: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-ocean-700 focus:ring-ocean-600"
                  />
                  {rotulo}
                </label>
              ))}
            </div>
            <Erro msg={erros.investimentos} />

            {TIPOS.filter(({ tipo }) => form.investimentos[tipo].ativo).map(({ tipo, rotulo }) => {
              const inv = form.investimentos[tipo];
              const entrada = parseEntrada(inv.entrada);
              return (
                <div key={tipo} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-900">{rotulo}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Taxa</label>
                      <div className="flex gap-2">
                        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden shrink-0">
                          {(['percentual', 'valor'] as TaxaTipo[]).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setInv(tipo, { taxa_tipo: t })}
                              className={`px-3 text-sm font-medium transition ${
                                inv.taxa_tipo === t ? 'bg-ocean-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {t === 'percentual' ? '%' : PREFIXO_MOEDA[form.moeda]}
                            </button>
                          ))}
                        </div>
                        <input
                          value={inv.taxa}
                          onChange={(e) => setInv(tipo, { taxa: e.target.value.replace(/[^\d.,]/g, '') })}
                          className={inputCls(erros[`${tipo}.taxa`])}
                          inputMode="decimal"
                          placeholder={inv.taxa_tipo === 'percentual' ? '15' : '50.000,00'}
                        />
                      </div>
                      <Erro msg={erros[`${tipo}.taxa`]} />
                    </div>
                    <div>
                      <label className={labelCls}>Entrada (%) — opcional</label>
                      <input
                        value={inv.entrada}
                        onChange={(e) => setInv(tipo, { entrada: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                        className={inputCls(erros[`${tipo}.entrada`])}
                        inputMode="numeric"
                        placeholder="0"
                      />
                      <Erro msg={erros[`${tipo}.entrada`]} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Após conclusão: {entrada === undefined ? '—' : `${100 - (entrada ?? 0)}%`}
                  </p>
                </div>
              );
            })}
          </section>
        </div>

        <aside className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit space-y-3 lg:sticky lg:top-6">
          <h2 className="font-semibold text-gray-900">Resumo</h2>
          {resumo.length === 0 && <p className="text-sm text-gray-500">Nenhum modelo de investimento selecionado.</p>}
          {resumo.map(({ tipo, rotulo, inv }) => (
            <div key={tipo} className="text-sm text-gray-700 border-b border-gray-100 pb-2">
              <div className="flex justify-between font-medium text-gray-900">
                <span>{rotulo}</span>
                <span>{inv ? formatarTaxa(inv, { moeda: form.moeda }) : '—'}</span>
              </div>
              <div className="text-gray-600">{inv ? formatarPagamento(inv.entrada) : 'Preencha a taxa'}</div>
            </div>
          ))}
          <div className="flex justify-between text-sm text-gray-700">
            <span>Garantia</span>
            <span>{garantia >= 1 ? formatarGarantia(garantia) : '—'}</span>
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
