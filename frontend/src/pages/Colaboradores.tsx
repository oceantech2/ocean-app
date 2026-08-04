import { useState, useEffect, useRef } from 'react';
import { colaboradoresService, historicoService } from '../services/api';
import { mensagemErro } from '../utils/erros';
import { Colaborador } from '../types';
import { useAuthStore } from '../store';
import Pagination from '../components/Pagination';
import ImportCSV from '../components/ImportCSV';
import DocumentosModal from '../components/DocumentosModal';
import { exportarCSV } from '../utils/export';
import toast from 'react-hot-toast';

const ITENS_POR_PAGINA = 15;

function validarCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(c[i]) * (10 - i);
  let r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(c[i]) * (11 - i);
  r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
}

function formatarCPF(cpf: string): string {
  const c = cpf.replace(/\D/g, '').slice(0, 11);
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

const FORM_INICIAL = { nome: '', cpf: '', cargo: '', salario: '', data_nascimento: '', endereco_completo: '', cep: '', data_admissao: '', data_desligamento: '', observacao: '', beneficio: '' };

export default function Colaboradores() {
  const papel = useAuthStore((s) => s.papel);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [filtroCargo, setFiltroCargo] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Colaborador | null>(null);
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [salvando, setSalvando] = useState(false);
  const [importAberto, setImportAberto] = useState(false);
  const [docsColaborador, setDocsColaborador] = useState<Colaborador | null>(null);
  const [obsAberta, setObsAberta] = useState<Colaborador | null>(null);
  const [historicoColab, setHistoricoColab] = useState<Colaborador | null>(null);
  const [historicoRegistros, setHistoricoRegistros] = useState<any[]>([]);
  const [historicoForm, setHistoricoForm] = useState({ cargo: '', salario: '', data_inicio: '', data_fim: '', observacao: '' });
  const [salvandoHistorico, setSalvandoHistorico] = useState(false);
  const [importandoXlsx, setImportandoXlsx] = useState(false);
  const xlsxInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { carregarColaboradores(); }, [mostrarInativos]);

  const carregarColaboradores = async () => {
    try {
      setLoading(true);
      const res = await colaboradoresService.listar(0, 200, mostrarInativos ? undefined : true);
      setColaboradores(res.data);
    } catch { toast.error('Erro ao carregar colaboradores'); }
    finally { setLoading(false); }
  };

  const cargos = [...new Set(colaboradores.map((c) => c.cargo))].sort();
  const filtrados = colaboradores.filter((c) => {
    if (filtroCargo && c.cargo !== filtroCargo) return false;
    if (busca && !c.nome.toLowerCase().includes(busca.toLowerCase()) && !c.cpf.includes(busca)) return false;
    return true;
  });
  const paginados = filtrados.slice(pagina * ITENS_POR_PAGINA, (pagina + 1) * ITENS_POR_PAGINA);

  const abrirCriar = () => { setEditando(null); setForm({ ...FORM_INICIAL }); setModalAberto(true); };
  const abrirEditar = (col: Colaborador) => {
    setEditando(col);
    setForm({
      nome: col.nome, cpf: col.cpf, cargo: col.cargo, salario: String(col.salario),
      data_nascimento: col.data_nascimento,
      endereco_completo: col.endereco_completo || '', cep: col.cep || '',
      data_admissao: col.data_admissao ? col.data_admissao.split('T')[0] : '',
      data_desligamento: col.data_desligamento ? col.data_desligamento.split('T')[0] : '',
      observacao: col.observacao || '',
      beneficio: col.beneficio || '',
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.nome || !form.cpf || !form.cargo || !form.salario || !form.data_nascimento) { toast.error('Preencha os campos obrigatórios'); return; }
    const cpfLimpo = form.cpf.replace(/\D/g, '');
    if (!validarCPF(cpfLimpo)) { toast.error('CPF inválido'); return; }
    try {
      setSalvando(true);
      const dados: any = { nome: form.nome, cpf: formatarCPF(form.cpf), cargo: form.cargo, salario: parseFloat(form.salario), data_nascimento: form.data_nascimento, endereco_completo: form.endereco_completo || null, cep: form.cep || null, observacao: form.observacao || null, beneficio: form.beneficio || null };
      if (form.data_admissao) dados.data_admissao = form.data_admissao;
      if (form.data_desligamento) dados.data_desligamento = form.data_desligamento;
      if (editando) { await colaboradoresService.atualizar(editando.id, dados); toast.success('Colaborador atualizado!'); }
      else { await colaboradoresService.criar(dados); toast.success('Colaborador criado!'); }
      setModalAberto(false); carregarColaboradores();
    } catch (e: any) { toast.error(mensagemErro(e, 'Erro ao salvar')); }
    finally { setSalvando(false); }
  };

  const abrirHistorico = async (col: Colaborador) => {
    setHistoricoColab(col);
    setHistoricoForm({ cargo: col.cargo, salario: String(col.salario), data_inicio: new Date().toISOString().split('T')[0], data_fim: '', observacao: '' });
    try {
      const res = await historicoService.listar(col.id);
      setHistoricoRegistros(res.data);
    } catch { setHistoricoRegistros([]); }
  };

  const salvarHistorico = async () => {
    if (!historicoColab || !historicoForm.data_inicio) { toast.error('Data de início obrigatória'); return; }
    try {
      setSalvandoHistorico(true);
      await historicoService.criar(historicoColab.id, {
        cargo: historicoForm.cargo || historicoColab.cargo,
        salario: parseFloat(historicoForm.salario) || historicoColab.salario,
        data_inicio: historicoForm.data_inicio,
        data_fim: historicoForm.data_fim || undefined,
        observacao: historicoForm.observacao || undefined,
      });
      toast.success('Registro adicionado!');
      const res = await historicoService.listar(historicoColab.id);
      setHistoricoRegistros(res.data);
      setHistoricoForm({ cargo: historicoColab.cargo, salario: String(historicoColab.salario), data_inicio: new Date().toISOString().split('T')[0], data_fim: '', observacao: '' });
    } catch { toast.error('Erro ao salvar'); }
    finally { setSalvandoHistorico(false); }
  };

  const deletarHistorico = async (id: number) => {
    if (!confirm('Remover este registro?')) return;
    try {
      await historicoService.deletar(id);
      if (historicoColab) {
        const res = await historicoService.listar(historicoColab.id);
        setHistoricoRegistros(res.data);
      }
    } catch { toast.error('Erro ao remover'); }
  };

  const desligar = async (col: Colaborador) => {
    if (!confirm(`Desligar ${col.nome}?`)) return;
    try { await colaboradoresService.deletar(col.id); toast.success('Colaborador desligado'); carregarColaboradores(); }
    catch { toast.error('Erro ao desligar'); }
  };

  const reativar = async (col: Colaborador) => {
    try { await colaboradoresService.atualizar(col.id, { ativo: true, data_desligamento: null }); toast.success('Reativado!'); carregarColaboradores(); }
    catch { toast.error('Erro ao reativar'); }
  };

  const excluirPermanente = async (col: Colaborador) => {
    const msg = `⚠ EXCLUSÃO PERMANENTE\n\n"${col.nome}" e todos os seus dados (férias, bônus, DH, NFs associadas) serão removidos do banco.\n\nEssa ação é IRREVERSÍVEL. Digite CONFIRMAR para prosseguir:`;
    if (prompt(msg) !== 'CONFIRMAR') { toast.error('Operação cancelada'); return; }
    try {
      await colaboradoresService.excluirPermanente(col.id);
      toast.success(`${col.nome} removido permanentemente`);
      carregarColaboradores();
    } catch (e: any) { toast.error(mensagemErro(e, 'Erro ao excluir')); }
  };

  const exportar = () => exportarCSV(filtrados.map((c) => ({ Nome: c.nome, CPF: c.cpf, Cargo: c.cargo, Salário: c.salario, Admissão: c.data_admissao?.split('T')[0], Status: c.ativo ? 'Ativo' : 'Desligado' })), 'colaboradores');

  const importarXlsx = async (arquivo: File) => {
    try {
      setImportandoXlsx(true);
      const res = await colaboradoresService.importarXlsx(arquivo);
      const { ok, erros } = res.data;
      if (ok > 0) toast.success(`${ok} colaborador(es) importado(s) do Excel`);
      if (erros?.length > 0) toast.error(`${erros.length} aviso(s)/erro(s) na importação — veja o console`);
      if (erros?.length > 0) console.warn('Avisos/erros na importação de colaboradores:', erros);
      carregarColaboradores();
    } catch (e: any) {
      toast.error(mensagemErro(e, 'Erro ao importar arquivo Excel'));
    } finally {
      setImportandoXlsx(false);
    }
  };

  const exportarXlsx = () => { colaboradoresService.exportarXlsx(); };

  const fmt = (v: number) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '-';
  const INPUT = 'w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Colaboradores</h1>
            <span className="text-base font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-lg">
              Total folha — {colaboradores.filter((c) => c.ativo).reduce((s, c) => s + c.salario, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{filtrados.length} encontrado(s)</p>
        </div>
        <div className="flex gap-2">
          {papel === 'admin' && (
            <button onClick={() => setImportAberto(true)} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
              ↑ Importar CSV
            </button>
          )}
          {filtrados.length > 0 && (
            <button onClick={exportar} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
              ↓ Exportar CSV
            </button>
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
              <button
                onClick={() => xlsxInputRef.current?.click()}
                disabled={importandoXlsx}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition disabled:opacity-50"
              >
                {importandoXlsx ? 'Importando...' : '↑ Importar Excel (.xlsx)'}
              </button>
            </>
          )}
          <button onClick={exportarXlsx} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
            ↓ Exportar Excel (.xlsx)
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition">
            Exportar PDF
          </button>
          {papel === 'admin' && (
            <button onClick={abrirCriar} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
              + Novo Colaborador
            </button>
          )}
        </div>
      </div>

      {importAberto && (
        <ImportCSV
          titulo="Colaboradores"
          colunas={['nome', 'cpf', 'cargo', 'salario', 'data_nascimento']}
          exemplo={{ nome: 'João Silva', cpf: '123.456.789-09', cargo: 'Consultor', salario: '5000', data_nascimento: '1990-05-20' }}
          mapear={(l) => {
            if (!l.nome || !l.cpf || !l.cargo) throw new Error('nome, cpf e cargo são obrigatórios');
            const cpfLimpo = (l.cpf || '').replace(/\D/g, '');
            if (!validarCPF(cpfLimpo)) throw new Error('CPF inválido');
            return {
              nome: l.nome,
              cpf: formatarCPF(l.cpf),
              cargo: l.cargo,
              salario: parseFloat((l.salario || '0').replace(',', '.')) || 0,
              data_nascimento: l.data_nascimento || '2000-01-01',
            };
          }}
          criar={(payload) => colaboradoresService.criar(payload)}
          onConcluido={carregarColaboradores}
          onFechar={() => setImportAberto(false)}
        />
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-wrap gap-3 items-center">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Buscar</label>
          <input className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-48" placeholder="Nome ou CPF..." value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(0); }} />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Cargo</label>
          <select className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm" value={filtroCargo} onChange={(e) => { setFiltroCargo(e.target.value); setPagina(0); }}>
            <option value="">Todos os cargos</option>
            {cargos.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-4 cursor-pointer">
          <input type="checkbox" checked={mostrarInativos} onChange={(e) => setMostrarInativos(e.target.checked)} className="rounded" />
          Mostrar inativos
        </label>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">Nenhum colaborador encontrado</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  {['Nome', 'CPF', 'Cargo', 'Salário', 'Admissão', 'Desligamento', 'Status', '', ''].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-gray-600 dark:text-gray-300 font-medium ${h === 'Salário' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginados.map((col) => (
                  <tr key={col.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!col.ativo ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{col.nome}</td>
                    <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">{col.cpf}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{col.cargo}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{fmt(col.salario)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{col.data_admissao?.split('T')[0]}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{col.data_desligamento ? col.data_desligamento.split('T')[0] : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${col.ativo ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                        {col.ativo ? 'Ativo' : 'Desligado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-8">
                      {col.observacao && (
                        <button
                          onClick={() => setObsAberta(col)}
                          title="Ver observação"
                          className="text-yellow-500 hover:text-yellow-400 dark:text-yellow-400 dark:hover:text-yellow-300 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 000-2h-3z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setDocsColaborador(col)} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200">Docs</button>
                        <button onClick={() => abrirHistorico(col)} className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded hover:bg-purple-200">Histórico</button>
                        {papel === 'admin' && (
                          <>
                            <button onClick={() => abrirEditar(col)} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200">Editar</button>
                            {col.ativo ? (
                              <button onClick={() => desligar(col)} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200">Desligar</button>
                            ) : (
                              <button onClick={() => reativar(col)} className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded hover:bg-green-200">Reativar</button>
                            )}
                            <button onClick={() => excluirPermanente(col)} className="text-xs px-2 py-1 bg-red-700 text-white rounded hover:bg-red-800" title="Excluir permanentemente do banco de dados">Excluir</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total={filtrados.length} pagina={pagina} tamanho={ITENS_POR_PAGINA} onChange={setPagina} />
          </>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{editando ? 'Editar Colaborador' : 'Novo Colaborador'}</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Nome *</label>
                <input className={INPUT} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">CPF *</label>
                <input className={INPUT} value={form.cpf} onChange={(e) => setForm({ ...form, cpf: formatarCPF(e.target.value) })} placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Nascimento *</label>
                <input type="date" className={INPUT} value={form.data_nascimento} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Cargo *</label>
                <input className={INPUT} value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Salário *</label>
                <input type="number" step="0.01" className={INPUT} value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Endereço</label>
                <input className={INPUT} value={form.endereco_completo} onChange={(e) => setForm({ ...form, endereco_completo: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">CEP</label>
                <input className={INPUT} value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="00000-000" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de Admissão</label>
                <input type="date" className={INPUT} value={form.data_admissao} onChange={(e) => setForm({ ...form, data_admissao: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data de Desligamento</label>
                <input type="date" className={INPUT} value={form.data_desligamento} onChange={(e) => setForm({ ...form, data_desligamento: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Benefícios</label>
                <textarea rows={3} className={INPUT + ' resize-none'} value={form.beneficio} onChange={(e) => setForm({ ...form, beneficio: e.target.value })} placeholder="Ex: Plano de saúde Bradesco, Vale refeição R$ 600..." />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Observação</label>
                <textarea rows={3} className={INPUT + ' resize-none'} value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Anotações internas sobre o colaborador..." />
              </div>
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

      {obsAberta && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setObsAberta(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Observação — {obsAberta.nome}</h3>
              <button onClick={() => setObsAberta(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">&times;</button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{obsAberta.observacao}</p>
            </div>
          </div>
        </div>
      )}

      {docsColaborador && (
        <DocumentosModal
          colaboradorId={docsColaborador.id}
          colaboradorNome={docsColaborador.nome}
          onFechar={() => setDocsColaborador(null)}
        />
      )}

      {/* Modal Histórico */}
      {historicoColab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Histórico de Cargo/Salário</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{historicoColab.nome}</p>
              </div>
              <button onClick={() => setHistoricoColab(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">✕</button>
            </div>

            {/* Formulário de novo registro */}
            {papel === 'admin' && (
              <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Novo registro</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Cargo</label>
                    <input className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1.5 text-sm" value={historicoForm.cargo} onChange={(e) => setHistoricoForm({ ...historicoForm, cargo: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Salário</label>
                    <input type="number" step="0.01" className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1.5 text-sm" value={historicoForm.salario} onChange={(e) => setHistoricoForm({ ...historicoForm, salario: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Início *</label>
                    <input type="date" className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1.5 text-sm" value={historicoForm.data_inicio} onChange={(e) => setHistoricoForm({ ...historicoForm, data_inicio: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Data Fim</label>
                    <input type="date" className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1.5 text-sm" value={historicoForm.data_fim} onChange={(e) => setHistoricoForm({ ...historicoForm, data_fim: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Observação</label>
                    <input className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1.5 text-sm" value={historicoForm.observacao} onChange={(e) => setHistoricoForm({ ...historicoForm, observacao: e.target.value })} placeholder="Ex: Promoção, reajuste anual..." />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={salvarHistorico} disabled={salvandoHistorico} className="px-4 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm disabled:opacity-50">
                    {salvandoHistorico ? 'Salvando...' : '+ Adicionar'}
                  </button>
                </div>
              </div>
            )}

            {/* Lista de registros */}
            <div className="flex-1 overflow-y-auto p-4">
              {historicoRegistros.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 py-8">Nenhum registro de histórico</p>
              ) : (
                <div className="space-y-2">
                  {historicoRegistros.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{r.cargo}</span>
                          <span className="text-xs text-green-700 dark:text-green-400 font-medium">{(r.salario as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {r.data_inicio}{r.data_fim ? ` → ${r.data_fim}` : ' → atual'}
                        </p>
                        {r.observacao && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">{r.observacao}</p>}
                      </div>
                      {papel === 'admin' && (
                        <button onClick={() => deletarHistorico(r.id)} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
