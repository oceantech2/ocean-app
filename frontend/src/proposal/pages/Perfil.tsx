import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import { EMAIL_RE, telefoneValido } from '../modelos/formatacao';
import {
  ConexoesClaude,
  desconectarClaude,
  listarConexoesClaude,
  mensagemErro,
  obterPerfil,
  salvarPerfil,
} from '../services/proposalApi';
import { formatarDataHora } from '../utils/propostaCalculo';

interface Form {
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
}

type Erros = Partial<Record<keyof Form, string>>;

const vazio: Form = { nome: '', cargo: '', telefone: '', email: '' };

function validar(form: Form): Erros {
  const erros: Erros = {};
  if (form.telefone.trim() && !telefoneValido(form.telefone)) erros.telefone = 'Telefone inválido';
  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) erros.email = 'E-mail inválido';
  return erros;
}

export default function Perfil() {
  const [form, setForm] = useState<Form>(vazio);
  const [erros, setErros] = useState<Erros>({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    obterPerfil()
      .then((p) => setForm({ nome: p.nome ?? '', cargo: p.cargo ?? '', telefone: p.telefone ?? '', email: p.email ?? '' }))
      .catch((e) => toast.error(mensagemErro(e, 'Não foi possível carregar o perfil')))
      .finally(() => setLoading(false));
  }, []);

  const set = (campo: keyof Form, valor: string) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const encontrados = validar(form);
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;
    setSalvando(true);
    try {
      const p = await salvarPerfil({
        nome: form.nome.trim() || null,
        cargo: form.cargo.trim() || null,
        telefone: form.telefone.trim() || null,
        email: form.email.trim() || null,
      });
      setForm({ nome: p.nome ?? '', cargo: p.cargo ?? '', telefone: p.telefone ?? '', email: p.email ?? '' });
      toast.success('Perfil salvo');
    } catch (err) {
      toast.error(mensagemErro(err, 'Não foi possível salvar o perfil'));
    } finally {
      setSalvando(false);
    }
  };

  const inputCls = (erro?: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-600 ${
      erro ? 'border-red-400' : 'border-gray-300'
    }`;

  const campo = (chave: keyof Form, rotulo: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{rotulo}</label>
      <input
        value={form[chave]}
        onChange={(e) => set(chave, e.target.value)}
        className={inputCls(erros[chave])}
        maxLength={255}
        {...extra}
      />
      {erros[chave] && <p className="text-sm text-red-600 mt-1">{erros[chave]}</p>}
    </div>
  );

  return (
    <ProposalLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Meu perfil</h1>
        <Link to="/" className="text-sm text-ocean-700 hover:underline">
          Voltar para a lista
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
        </div>
      ) : (
        <form
          onSubmit={salvar}
          noValidate
          className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <p className="text-sm text-gray-600">
            Esses dados preenchem automaticamente o consultor nas novas propostas. Alterar o perfil não muda propostas
            já criadas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campo('nome', 'Nome')}
            {campo('cargo', 'Cargo')}
            {campo('telefone', 'Telefone', { inputMode: 'tel', maxLength: 30, placeholder: '(21) 99999-9999' })}
            {campo('email', 'E-mail', { type: 'email', inputMode: 'email' })}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg bg-ocean-700 text-white font-semibold hover:bg-ocean-800 disabled:bg-gray-400 transition"
            >
              {salvando ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </div>
        </form>
      )}

      <SecaoClaude />
    </ProposalLayout>
  );
}

function SecaoClaude() {
  const [dados, setDados] = useState<ConexoesClaude | null>(null);
  const [removendo, setRemovendo] = useState<number | null>(null);

  const carregar = () =>
    listarConexoesClaude()
      .then(setDados)
      .catch((e) => toast.error(mensagemErro(e, 'Não foi possível carregar as conexões com o Claude')));

  useEffect(() => {
    carregar();
  }, []);

  const copiar = async () => {
    if (!dados) return;
    try {
      await navigator.clipboard.writeText(dados.mcp_url);
      toast.success('Endereço copiado');
    } catch {
      toast.error('Não foi possível copiar. Selecione e copie o endereço manualmente.');
    }
  };

  const desconectar = async (id: number, nome: string) => {
    if (!window.confirm(`Desconectar ${nome}? O Claude perde o acesso ao painel até você conectar de novo.`)) return;
    setRemovendo(id);
    try {
      await desconectarClaude(id);
      toast.success('Claude desconectado');
      await carregar();
    } catch (e) {
      toast.error(mensagemErro(e, 'Não foi possível desconectar'));
    } finally {
      setRemovendo(null);
    }
  };

  return (
    <section className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 mt-6">
      <h2 className="text-lg font-semibold text-gray-900">Claude</h2>
      {!dados ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-700" />
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Peça ao Claude Desktop para consultar e criar propostas e vagas por você. No Claude, abra Configurações →
            Conectores → Adicionar conector personalizado, cole o endereço abaixo e clique em Conectar. O Claude age
            com as suas permissões no painel.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={dados.mcp_url}
              onFocus={(e) => e.target.select()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            />
            <button
              type="button"
              onClick={copiar}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              Copiar
            </button>
          </div>
          {dados.items.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum Claude conectado à sua conta.</p>
          ) : (
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
              {dados.items.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{c.cliente_nome}</p>
                    <p className="text-gray-500">
                      Conectado em {formatarDataHora(c.criado_em)} · último uso{' '}
                      {c.ultimo_uso_em ? formatarDataHora(c.ultimo_uso_em) : '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => desconectar(c.id, c.cliente_nome)}
                    disabled={removendo === c.id}
                    className="px-3 py-1.5 rounded-lg border border-red-300 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
                  >
                    {removendo === c.id ? 'Desconectando...' : 'Desconectar'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
