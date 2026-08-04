import { useState, useEffect } from 'react';
import { configuracoesService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { UsuarioApp } from '../types';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const MENUS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'calendario', label: 'Calendário' },
  { key: 'nfs', label: 'Contas a Receber' },
  { key: 'contas', label: 'Contas a Pagar' },
  { key: 'fluxo_caixa', label: 'Fluxo de Caixa' },
  { key: 'impostos', label: 'Impostos' },
  { key: 'retiradas', label: 'Retiradas (Sócios)' },
  { key: 'bonus', label: 'Bônus' },
  { key: 'dh', label: 'DH' },
  { key: 'colaboradores', label: 'Colaboradores' },
  { key: 'ferias', label: 'Férias' },
  { key: 'relatorios', label: 'Relatórios' },
];

const PERMS_ADMIN = Object.fromEntries(MENUS.map((m) => [m.key, true]));
const PERMS_DEFAULT = Object.fromEntries(MENUS.map((m) => [m.key, false]));

function parsePerms(json?: string | null): Record<string, boolean> {
  try { return json ? { ...PERMS_DEFAULT, ...JSON.parse(json) } : { ...PERMS_DEFAULT }; }
  catch { return { ...PERMS_DEFAULT }; }
}

const FORM_INICIAL = { usuario: '', senha: '', papel: 'visualizador', permissoes: { ...PERMS_DEFAULT } };

export default function ConfiguracoesPage() {
  const papel = useAuthStore((s) => s.papel);
  const [usuarios, setUsuarios] = useState<UsuarioApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<UsuarioApp | null>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregarUsuarios(); }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await configuracoesService.listar();
      setUsuarios(res.data);
    } catch { toast.error('Erro ao carregar usuários'); }
    finally { setLoading(false); }
  };

  const abrirCriar = () => {
    setEditando(null);
    setForm({ ...FORM_INICIAL, permissoes: { ...PERMS_DEFAULT } });
    setModalAberto(true);
  };

  const abrirEditar = (u: UsuarioApp) => {
    setEditando(u);
    setForm({
      usuario: u.usuario,
      senha: '',
      papel: u.papel,
      permissoes: u.papel === 'admin' ? { ...PERMS_ADMIN } : parsePerms(u.permissoes),
    });
    setModalAberto(true);
  };

  const togglePermissao = (key: string) => {
    setForm((f) => ({ ...f, permissoes: { ...f.permissoes, [key]: !f.permissoes[key] } }));
  };

  const salvar = async () => {
    if (!form.usuario) { toast.error('Usuário obrigatório'); return; }
    if (!editando && !form.senha) { toast.error('Senha obrigatória para novo usuário'); return; }
    try {
      setSalvando(true);
      const permissoesJson = JSON.stringify(form.papel === 'admin' ? PERMS_ADMIN : form.permissoes);
      if (editando) {
        const dados: any = { papel: form.papel, permissoes: permissoesJson };
        if (form.senha) dados.senha = form.senha;
        await configuracoesService.atualizar(editando.id, dados);
        toast.success('Usuário atualizado!');
      } else {
        await configuracoesService.criar({ usuario: form.usuario, senha: form.senha, papel: form.papel, permissoes: permissoesJson });
        toast.success('Usuário criado!');
      }
      setModalAberto(false);
      carregarUsuarios();
    } catch (e: any) { toast.error(mensagemErro(e, 'Erro ao salvar')); }
    finally { setSalvando(false); }
  };

  const desativar = async (u: UsuarioApp) => {
    if (!confirm(`${u.ativo ? 'Desativar' : 'Reativar'} usuário "${u.usuario}"?`)) return;
    try {
      await configuracoesService.atualizar(u.id, { ativo: !u.ativo });
      toast.success(u.ativo ? 'Usuário desativado' : 'Usuário reativado');
      carregarUsuarios();
    } catch { toast.error('Erro ao atualizar'); }
  };

  const deletar = async (u: UsuarioApp) => {
    if (!confirm(`Deletar permanentemente "${u.usuario}"?`)) return;
    try {
      await configuracoesService.deletar(u.id);
      toast.success('Usuário removido');
      carregarUsuarios();
    } catch (e: any) { toast.error(mensagemErro(e, 'Erro ao deletar')); }
  };

  if (papel !== 'admin') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Acesso restrito a administradores.</p>
      </div>
    );
  }

  const INPUT = 'w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Configurações <span className="text-gray-500 dark:text-gray-400 font-normal text-base">— Gerenciamento de usuários e permissões</span></h1>
        </div>
        <button onClick={abrirCriar} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
          + Novo Usuário
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : usuarios.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">Nenhum usuário cadastrado</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                {['Usuário', 'Papel', 'Permissões de Menu', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {usuarios.map((u) => {
                const perms = parsePerms(u.permissoes);
                const menusAtivos = u.papel === 'admin' ? MENUS.map((m) => m.label) : MENUS.filter((m) => perms[m.key]).map((m) => m.label);
                return (
                  <tr key={u.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!u.ativo ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{u.usuario}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.papel === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                        {u.papel === 'admin' ? 'Admin' : 'Visualizador'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.papel === 'admin' ? (
                        <span className="text-xs text-blue-600 dark:text-blue-400">Acesso total</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {menusAtivos.length === 0
                            ? <span className="text-xs text-gray-400">Sem acesso</span>
                            : menusAtivos.map((m) => (
                              <span key={m} className="px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs">{m}</span>
                            ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.ativo ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => abrirEditar(u)} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200">Editar</button>
                        <button onClick={() => desativar(u)} className={`text-xs px-2 py-1 rounded ${u.ativo ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 hover:bg-yellow-200' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 hover:bg-green-200'}`}>
                          {u.ativo ? 'Desativar' : 'Reativar'}
                        </button>
                        <button onClick={() => deletar(u)} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200">Deletar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{editando ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Login / Usuário *</label>
                <input className={INPUT} value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} disabled={!!editando} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Senha {editando ? '(deixe em branco para não alterar)' : '*'}</label>
                <input type="password" className={INPUT} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Papel *</label>
                <select className={INPUT} value={form.papel} onChange={(e) => setForm({ ...form, papel: e.target.value })}>
                  <option value="visualizador">Visualizador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {form.papel !== 'admin' && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2">Acesso aos menus</label>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    {MENUS.map((m, i) => (
                      <label key={m.key} className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${i > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{m.label}</span>
                        <div
                          onClick={() => togglePermissao(m.key)}
                          className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.permissoes[m.key] ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.permissoes[m.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {form.papel === 'admin' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400">
                  Administradores têm acesso total a todos os menus.
                </div>
              )}
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
              <button onClick={salvar} disabled={salvando} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
