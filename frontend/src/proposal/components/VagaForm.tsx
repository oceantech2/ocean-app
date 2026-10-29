import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import type { AreaVaga, NivelVaga, Vaga, VagaPayload } from '../services/proposalApi';
import { AREAS_VAGA, NIVEIS_VAGA } from '../utils/vagas';

type CampoTexto = Exclude<keyof VagaPayload, 'area' | 'nivel'>;
type Form = Record<CampoTexto, string> & { area: AreaVaga | ''; nivel: NivelVaga | '' };
type Erros = Partial<Record<keyof VagaPayload, string>>;

const LIMITES: Partial<Record<CampoTexto, number>> = {
  titulo: 120,
  localidade: 120,
  resumo: 300,
  descricao: 5000,
  responsabilidades: 5000,
  requisitos: 5000,
  diferenciais: 5000,
  cliente: 160,
  codigo_planilha: 20,
};

export function formDaVaga(v: Vaga | null): Form {
  return {
    titulo: v?.titulo ?? '',
    area: v?.area ?? '',
    nivel: v?.nivel ?? '',
    localidade: v?.localidade ?? '',
    resumo: v?.resumo ?? '',
    descricao: v?.descricao ?? '',
    responsabilidades: v?.responsabilidades ?? '',
    requisitos: v?.requisitos ?? '',
    diferenciais: v?.diferenciais ?? '',
    cliente: v?.cliente ?? '',
    codigo_planilha: v?.codigo_planilha ?? '',
  };
}

function validar(f: Form): Erros {
  const e: Erros = {};
  if (!f.titulo.trim()) e.titulo = 'Informe o título da vaga';
  if (!f.area) e.area = 'Selecione a área';
  if (!f.nivel) e.nivel = 'Selecione o nível';
  if (!f.localidade.trim()) e.localidade = 'Informe a localidade';
  if (!f.resumo.trim()) e.resumo = 'Informe o resumo';
  if (!f.requisitos.trim()) e.requisitos = 'Informe os pré-requisitos';
  const codigo = f.codigo_planilha.trim();
  if (codigo && !/^[A-Za-z0-9._-]{1,20}$/.test(codigo)) e.codigo_planilha = 'Use letras, números, ponto, hífen ou sublinhado';
  if (!codigo && !f.cliente.trim()) e.cliente = 'Informe o cliente ou o código da vaga na planilha';
  return e;
}

function payload(f: Form): VagaPayload {
  const opcional = (v: string) => v.trim() || null;
  return {
    titulo: f.titulo.trim(),
    area: f.area,
    nivel: f.nivel,
    localidade: f.localidade.trim(),
    resumo: f.resumo.trim(),
    descricao: opcional(f.descricao),
    responsabilidades: opcional(f.responsabilidades),
    requisitos: f.requisitos.trim(),
    diferenciais: opcional(f.diferenciais),
    cliente: opcional(f.cliente),
    codigo_planilha: opcional(f.codigo_planilha)?.toUpperCase() ?? null,
  };
}

export default function VagaForm({
  inicial,
  salvando,
  rotuloSalvar,
  onSubmit,
}: {
  inicial: Form;
  salvando: boolean;
  rotuloSalvar: string;
  onSubmit: (p: VagaPayload) => void;
}) {
  const [form, setForm] = useState<Form>(inicial);
  const [erros, setErros] = useState<Erros>({});

  const set = <K extends keyof Form>(campo: K, valor: Form[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined, ...(campo === 'codigo_planilha' ? { cliente: undefined } : {}) }));
  };

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    const novos = validar(form);
    setErros(novos);
    if (Object.keys(novos).length) {
      toast.error('Revise os campos destacados');
      return;
    }
    onSubmit(payload(form));
  };

  const inputCls = (erro?: string) =>
    `w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 ${
      erro ? 'border-red-400' : 'border-gray-300'
    }`;
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const secaoCls = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4';
  const Erro = ({ msg }: { msg?: string }) => (msg ? <p className="text-sm text-red-600 mt-1">{msg}</p> : null);

  const texto = (campo: CampoTexto, rotulo: string, opts: { placeholder?: string; dica?: string } = {}) => (
    <div>
      <label className={labelCls}>{rotulo}</label>
      <input
        value={form[campo]}
        onChange={(e) => set(campo, e.target.value)}
        maxLength={LIMITES[campo]}
        placeholder={opts.placeholder}
        className={inputCls(erros[campo])}
      />
      {opts.dica && !erros[campo] && <p className="text-xs text-gray-500 mt-1">{opts.dica}</p>}
      <Erro msg={erros[campo]} />
    </div>
  );

  const area = (campo: CampoTexto, rotulo: string, linhas: number, dica?: string) => (
    <div>
      <label className={labelCls}>{rotulo}</label>
      <textarea
        value={form[campo]}
        onChange={(e) => set(campo, e.target.value)}
        maxLength={LIMITES[campo]}
        rows={linhas}
        className={inputCls(erros[campo])}
      />
      {dica && !erros[campo] && <p className="text-xs text-gray-500 mt-1">{dica}</p>}
      <Erro msg={erros[campo]} />
    </div>
  );

  return (
    <form onSubmit={salvar} noValidate className="space-y-6 max-w-4xl">
      <section className={secaoCls}>
        <h2 className="font-semibold text-gray-900">Vaga</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">{texto('titulo', 'Título', { placeholder: 'Ex.: Diretor Financeiro' })}</div>
          <div>
            <label className={labelCls}>Área</label>
            <select value={form.area} onChange={(e) => set('area', e.target.value as AreaVaga)} className={inputCls(erros.area)}>
              <option value="">Selecione</option>
              {(Object.keys(AREAS_VAGA) as AreaVaga[]).map((a) => (
                <option key={a} value={a}>
                  {AREAS_VAGA[a]}
                </option>
              ))}
            </select>
            <Erro msg={erros.area} />
          </div>
          <div>
            <label className={labelCls}>Nível</label>
            <select value={form.nivel} onChange={(e) => set('nivel', e.target.value as NivelVaga)} className={inputCls(erros.nivel)}>
              <option value="">Selecione</option>
              {(Object.keys(NIVEIS_VAGA) as NivelVaga[]).map((n) => (
                <option key={n} value={n}>
                  {NIVEIS_VAGA[n]}
                </option>
              ))}
            </select>
            <Erro msg={erros.nivel} />
          </div>
          <div className="sm:col-span-2">
            {texto('localidade', 'Localidade', { placeholder: 'Ex.: Rio de Janeiro / RJ · Híbrido' })}
          </div>
          <div className="sm:col-span-2">
            {area('resumo', 'Resumo', 2, 'Aparece no card da lista de vagas do site (até 300 caracteres).')}
          </div>
        </div>
      </section>

      <section className={secaoCls}>
        <h2 className="font-semibold text-gray-900">Página da vaga no site</h2>
        {area('descricao', 'Descrição (opcional)', 5, 'Separe os parágrafos com uma linha em branco.')}
        {area('responsabilidades', 'Responsabilidades (opcional)', 5, 'Um item por linha.')}
        {area('requisitos', 'Pré-requisitos', 6, 'Um item por linha.')}
        {area('diferenciais', 'Diferenciais (opcional)', 4, 'Um item por linha.')}
      </section>

      <section className={secaoCls}>
        <div>
          <h2 className="font-semibold text-gray-900">Uso interno</h2>
          <p className="text-sm text-gray-500">Não aparece no site. Usado para ligar as candidaturas à vaga na planilha.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {texto('codigo_planilha', 'Código na planilha (opcional)', {
            placeholder: 'Ex.: V0005',
            dica: 'ID da vaga na planilha de candidaturas.',
          })}
          {texto('cliente', form.codigo_planilha.trim() ? 'Cliente (opcional)' : 'Cliente', {
            dica: 'Obrigatório quando não houver código na planilha.',
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={salvando}
          className="px-5 py-2 rounded-lg bg-ocean-700 text-white text-sm font-medium hover:bg-ocean-800 disabled:opacity-50 transition"
        >
          {salvando ? 'Salvando...' : rotuloSalvar}
        </button>
      </div>
    </form>
  );
}
