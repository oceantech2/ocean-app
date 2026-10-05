import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProposalLayout from '../components/ProposalLayout';
import { EMAIL_RE, telefoneValido } from '../modelos/formatacao';
import { mensagemErro, obterPerfil, salvarPerfil } from '../services/proposalApi';

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
    </ProposalLayout>
  );
}
