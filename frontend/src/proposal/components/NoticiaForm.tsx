import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import type { Noticia, NoticiaPayload, SegmentoNoticia, StatusNoticia } from '../services/proposalApi';
import { SEGMENTOS_NOTICIA } from '../utils/noticias';

type CampoTexto = Exclude<keyof NoticiaPayload, 'segmento' | 'status'>;
type Form = Record<CampoTexto, string> & { segmento: SegmentoNoticia | ''; status: StatusNoticia };
type Erros = Partial<Record<keyof NoticiaPayload, string>>;

const LIMITES: Record<CampoTexto, number> = {
  titulo_pt: 200,
  titulo_en: 200,
  resumo_pt: 500,
  resumo_en: 500,
  conteudo_pt: 20000,
  conteudo_en: 20000,
  data_publicacao: 10,
};

export function formDaNoticia(n: Noticia | null): Form {
  const hoje = new Date();
  const ymd = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  return {
    titulo_pt: n?.titulo_pt ?? '',
    titulo_en: n?.titulo_en ?? '',
    resumo_pt: n?.resumo_pt ?? '',
    resumo_en: n?.resumo_en ?? '',
    conteudo_pt: n?.conteudo_pt ?? '',
    conteudo_en: n?.conteudo_en ?? '',
    segmento: n?.segmento ?? '',
    data_publicacao: n?.data_publicacao ?? ymd,
    status: n?.status ?? 'publicada',
  };
}

function validar(f: Form): Erros {
  const e: Erros = {};
  if (!f.titulo_pt.trim()) e.titulo_pt = 'Informe o título em português';
  if (!f.titulo_en.trim()) e.titulo_en = 'Informe o título em inglês';
  if (!f.resumo_pt.trim()) e.resumo_pt = 'Informe o resumo em português';
  if (!f.resumo_en.trim()) e.resumo_en = 'Informe o resumo em inglês';
  if (!f.conteudo_pt.trim()) e.conteudo_pt = 'Informe o conteúdo em português';
  if (!f.conteudo_en.trim()) e.conteudo_en = 'Informe o conteúdo em inglês';
  if (!f.segmento) e.segmento = 'Selecione o segmento';
  if (!f.data_publicacao) e.data_publicacao = 'Informe a data de publicação';
  return e;
}

function payload(f: Form): NoticiaPayload {
  return {
    titulo_pt: f.titulo_pt.trim(),
    titulo_en: f.titulo_en.trim(),
    resumo_pt: f.resumo_pt.trim(),
    resumo_en: f.resumo_en.trim(),
    conteudo_pt: f.conteudo_pt.trim(),
    conteudo_en: f.conteudo_en.trim(),
    segmento: f.segmento,
    data_publicacao: f.data_publicacao,
    status: f.status,
  };
}

export default function NoticiaForm({
  inicial,
  salvando,
  rotuloSalvar,
  mostrarStatus,
  onSubmit,
}: {
  inicial: Form;
  salvando: boolean;
  rotuloSalvar: string;
  mostrarStatus: boolean;
  onSubmit: (p: NoticiaPayload) => void;
}) {
  const [form, setForm] = useState<Form>(inicial);
  const [erros, setErros] = useState<Erros>({});

  const set = <K extends keyof Form>(campo: K, valor: Form[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
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

  const texto = (campo: CampoTexto, rotulo: string) => (
    <div>
      <label className={labelCls}>{rotulo}</label>
      <input
        value={form[campo]}
        onChange={(e) => set(campo, e.target.value)}
        maxLength={LIMITES[campo]}
        className={inputCls(erros[campo])}
      />
      <Erro msg={erros[campo]} />
    </div>
  );

  const area = (campo: CampoTexto, rotulo: string, rows = 4) => (
    <div>
      <label className={labelCls}>{rotulo}</label>
      <textarea
        value={form[campo]}
        onChange={(e) => set(campo, e.target.value)}
        maxLength={LIMITES[campo]}
        rows={rows}
        className={inputCls(erros[campo])}
      />
      <Erro msg={erros[campo]} />
    </div>
  );

  return (
    <form onSubmit={salvar} className="space-y-6">
      <section className={secaoCls}>
        <h2 className="text-lg font-semibold text-gray-900">Português</h2>
        {texto('titulo_pt', 'Título (PT)')}
        {area('resumo_pt', 'Resumo (PT)', 3)}
        {area('conteudo_pt', 'Conteúdo (PT)', 10)}
      </section>

      <section className={secaoCls}>
        <h2 className="text-lg font-semibold text-gray-900">English</h2>
        {texto('titulo_en', 'Title (EN)')}
        {area('resumo_en', 'Summary (EN)', 3)}
        {area('conteudo_en', 'Body (EN)', 10)}
      </section>

      <section className={secaoCls}>
        <h2 className="text-lg font-semibold text-gray-900">Publicação</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Segmento</label>
            <select
              value={form.segmento}
              onChange={(e) => set('segmento', e.target.value as SegmentoNoticia | '')}
              className={inputCls(erros.segmento)}
            >
              <option value="">Selecione</option>
              {(Object.keys(SEGMENTOS_NOTICIA) as SegmentoNoticia[]).map((k) => (
                <option key={k} value={k}>
                  {SEGMENTOS_NOTICIA[k]}
                </option>
              ))}
            </select>
            <Erro msg={erros.segmento} />
          </div>
          <div>
            <label className={labelCls}>Data de publicação</label>
            <input
              type="date"
              value={form.data_publicacao}
              onChange={(e) => set('data_publicacao', e.target.value)}
              className={inputCls(erros.data_publicacao)}
            />
            <p className="text-xs text-gray-500 mt-1">No site só aparece a partir desta data (se estiver publicada).</p>
            <Erro msg={erros.data_publicacao} />
          </div>
        </div>
        {mostrarStatus && (
          <div>
            <label className={labelCls}>Status inicial</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as StatusNoticia)}
              className={inputCls()}
            >
              <option value="publicada">Publicada</option>
              <option value="nao_publicada">Não publicada</option>
            </select>
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={salvando}
          className="px-5 py-2.5 rounded-lg bg-ocean-700 text-white text-sm font-medium hover:bg-ocean-800 disabled:opacity-50 transition"
        >
          {salvando ? 'Salvando...' : rotuloSalvar}
        </button>
      </div>
    </form>
  );
}
