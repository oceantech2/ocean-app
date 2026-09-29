import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatarCNPJ, validarCNPJ } from '../../utils/documento';
import ProposalLayout from '../components/ProposalLayout';
import { criarProposta, mensagemErro, obterProposta, Proposta } from '../services/proposalApi';
import {
  calcularImpostoCentavos,
  centavosParaDecimal,
  copiarTexto,
  formatarData,
  formatarMoeda,
  formatarMoedaCentavos,
  hojeSP,
  montarLinkPublico,
  parseAliquotaCentesimos,
  parseMoedaCentavos,
  somarDias,
  validadePadrao,
} from '../utils/propostaCalculo';

interface Form {
  cliente_nome: string;
  cnpj: string;
  valor: string;
  imposto_ativo: boolean;
  aliquota: string;
  validade: string;
}

type Erros = Partial<Record<keyof Form, string>>;

const formInicial = (): Form => ({
  cliente_nome: '',
  cnpj: '',
  valor: '',
  imposto_ativo: false,
  aliquota: '',
  validade: validadePadrao(),
});

const decimalParaBR = (v: string | null) =>
  v ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';

function Erro({ msg }: { msg?: string }) {
  return msg ? <p className="text-sm text-red-600 mt-1">{msg}</p> : null;
}

function validar(form: Form, valorCent: number | null, aliqCent: number | null): Erros {
  const erros: Erros = {};
  if (!form.cliente_nome.trim()) erros.cliente_nome = 'Informe o nome do cliente';
  if (!validarCNPJ(form.cnpj)) erros.cnpj = 'CNPJ inválido';
  if (!valorCent || valorCent <= 0) erros.valor = 'Valor deve ser maior que zero';
  if (form.imposto_ativo && (!aliqCent || aliqCent <= 0 || aliqCent >= 10000)) {
    erros.aliquota = 'Alíquota deve ser maior que 0 e menor que 100';
  }
  if (!form.validade || form.validade <= hojeSP()) {
    erros.validade = 'Validade deve ser posterior à data de emissão';
  }
  return erros;
}

export default function Nova() {
  const [params, setParams] = useSearchParams();
  const copiarId = params.get('copiar');
  const [form, setForm] = useState<Form>(formInicial);
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);
  const [carregandoCopia, setCarregandoCopia] = useState(false);
  const [criada, setCriada] = useState<Proposta | null>(null);

  useEffect(() => {
    if (!copiarId) return;
    setCarregandoCopia(true);
    obterProposta(copiarId)
      .then((p) =>
        setForm({
          cliente_nome: p.cliente_nome,
          cnpj: p.cnpj,
          valor: decimalParaBR(p.valor),
          imposto_ativo: p.imposto_ativo,
          aliquota: decimalParaBR(p.aliquota),
          validade: validadePadrao(),
        }),
      )
      .catch((e) => toast.error(mensagemErro(e, 'Não foi possível carregar a proposta de origem')))
      .finally(() => setCarregandoCopia(false));
  }, [copiarId]);

  const valorCent = useMemo(() => parseMoedaCentavos(form.valor), [form.valor]);
  const aliqCent = useMemo(() => parseAliquotaCentesimos(form.aliquota), [form.aliquota]);
  const impostoCent = form.imposto_ativo && valorCent && aliqCent ? calcularImpostoCentavos(valorCent, aliqCent) : 0;
  const totalCent = (valorCent || 0) + impostoCent;

  const set = <K extends keyof Form>(campo: K, valor: Form[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const encontrados = validar(form, valorCent, aliqCent);
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;
    setSalvando(true);
    try {
      const p = await criarProposta({
        cliente_nome: form.cliente_nome.trim(),
        cnpj: form.cnpj,
        valor: centavosParaDecimal(valorCent!),
        imposto_ativo: form.imposto_ativo,
        aliquota: form.imposto_ativo ? centavosParaDecimal(aliqCent!) : null,
        validade: form.validade,
      });
      setCriada(p);
      toast.success('Proposta criada');
    } catch (err) {
      toast.error(mensagemErro(err, 'Não foi possível criar a proposta'));
    } finally {
      setSalvando(false);
    }
  };

  const novaProposta = () => {
    setCriada(null);
    setForm(formInicial());
    setErros({});
    if (copiarId) setParams({});
  };

  const copiarLink = async (codigo: string) => {
    if (await copiarTexto(montarLinkPublico(codigo))) toast.success('Link copiado');
    else toast.error('Não foi possível copiar o link');
  };

  if (criada) {
    const link = montarLinkPublico(criada.codigo);
    return (
      <ProposalLayout>
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Proposta criada</h1>
            <p className="text-sm text-gray-600 mt-1">
              {criada.cliente_nome} · {formatarMoeda(criada.total)} · válida até {formatarData(criada.validade)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link para o cliente</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={link}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={() => copiarLink(criada.codigo)}
                className="px-4 py-2 rounded-lg bg-ocean-700 text-white font-medium hover:bg-ocean-800 transition"
              >
                Copiar link
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/propostas/${criada.id}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Ver proposta
            </Link>
            <button
              onClick={novaProposta}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Nova proposta
            </button>
          </div>
        </div>
      </ProposalLayout>
    );
  }

  const inputCls = (erro?: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-600 ${
      erro ? 'border-red-400' : 'border-gray-300'
    }`;
  return (
    <ProposalLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Nova proposta</h1>
        <Link to="/" className="text-sm text-ocean-700 hover:underline">
          Voltar para a lista
        </Link>
      </div>

      {carregandoCopia ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : (
        <form onSubmit={salvar} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do cliente</label>
              <input
                value={form.cliente_nome}
                onChange={(e) => set('cliente_nome', e.target.value)}
                className={inputCls(erros.cliente_nome)}
                maxLength={255}
              />
              <Erro msg={erros.cliente_nome} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input
                value={form.cnpj}
                onChange={(e) => set('cnpj', formatarCNPJ(e.target.value))}
                className={inputCls(erros.cnpj)}
                placeholder="00.000.000/0000-00"
              />
              <Erro msg={erros.cnpj} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input
                value={form.valor}
                onChange={(e) => set('valor', e.target.value.replace(/[^\d.,]/g, ''))}
                onBlur={() => valorCent && set('valor', decimalParaBR(centavosParaDecimal(valorCent)))}
                className={inputCls(erros.valor)}
                inputMode="decimal"
                placeholder="0,00"
              />
              <Erro msg={erros.valor} />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-gray-700">Incluir imposto</span>
              <button
                type="button"
                role="switch"
                aria-checked={form.imposto_ativo}
                onClick={() => set('imposto_ativo', !form.imposto_ativo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  form.imposto_ativo ? 'bg-ocean-700' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    form.imposto_ativo ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {form.imposto_ativo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alíquota (%)</label>
                <input
                  value={form.aliquota}
                  onChange={(e) => set('aliquota', e.target.value.replace(/[^\d.,]/g, ''))}
                  className={inputCls(erros.aliquota)}
                  inputMode="decimal"
                  placeholder="0,00"
                />
                <Erro msg={erros.aliquota} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
              <input
                type="date"
                value={form.validade}
                min={somarDias(hojeSP(), 1)}
                onChange={(e) => set('validade', e.target.value)}
                className={inputCls(erros.validade)}
              />
              <Erro msg={erros.validade} />
            </div>
          </div>

          <aside className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit space-y-3">
            <h2 className="font-semibold text-gray-900">Resumo</h2>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Valor</span>
              <span>{formatarMoedaCentavos(valorCent || 0)}</span>
            </div>
            {form.imposto_ativo && (
              <div className="flex justify-between text-sm text-gray-700">
                <span>Imposto{aliqCent ? ` (${(aliqCent / 100).toLocaleString('pt-BR')}%)` : ''}</span>
                <span>{formatarMoedaCentavos(impostoCent)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatarMoedaCentavos(totalCent)}</span>
            </div>
            <button
              type="submit"
              disabled={salvando}
              className="w-full mt-2 bg-ocean-700 text-white font-semibold py-2 rounded-lg hover:bg-ocean-800 disabled:bg-gray-400 transition"
            >
              {salvando ? 'Gerando...' : 'Gerar proposta'}
            </button>
          </aside>
        </form>
      )}
    </ProposalLayout>
  );
}
