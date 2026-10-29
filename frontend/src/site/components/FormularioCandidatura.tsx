import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { enviarCandidatura, ErroApi } from '../api';
import { AREA_TEXTO, BOTAO, CAMPO, ERRO, ROTULO, SELECAO } from '../classes';
import { DISPONIBILIDADE, INGLES, MOBILIDADE, type Vaga } from '../dados/vagas';
import { IconeChevronBaixo } from '../icones';
import { useIdioma, type Idioma, type Txt } from '../idioma';
import { emailValido, tamanhoEntre, urlValida, valorMonetario } from '../validacao';

const VAZIO = {
  nome: '',
  email: '',
  telefone: '',
  linkedin: '',
  localidade: '',
  cargo_atual: '',
  empresa_atual: '',
  pretensao_min: '',
  pretensao_max: '',
  formacao: '',
  experiencia: '',
  ingles: '',
  outros_idiomas: '',
  disponibilidade: '',
  mobilidade: '',
  site: '',
};
type Dados = typeof VAZIO;
type CampoErro = keyof Dados | 'curriculo' | 'consentimento';
type Erros = Partial<Record<CampoErro, string>>;

const EXTENSOES = ['.pdf', '.doc', '.docx'];
const MAX_BYTES = 5 * 1024 * 1024;

const TEXTOS = {
  pt: {
    erros: {
      nome: 'Informe seu nome',
      email: 'E-mail inválido',
      telefone: 'Informe um telefone com DDD',
      linkedin: 'URL inválida',
      localidade: 'Informe sua localidade',
      cargo_atual: 'Informe seu cargo atual',
      empresa_atual: 'Informe sua empresa atual',
      pretensao_min: 'Informe a pretensão mínima',
      pretensao_max: 'Informe a pretensão salarial',
      pretensaoOrdem: 'A pretensão salarial deve ser maior ou igual à mínima',
      curriculo: 'Anexe seu currículo',
      curriculoFormato: 'Envie o currículo em PDF, DOC ou DOCX',
      curriculoTamanho: 'O currículo deve ter até 5 MB',
      consentimento: 'É necessário autorizar o uso dos seus dados',
      longo: 'Texto muito longo',
      opcao: 'Opção inválida',
    } as Record<string, string>,
    nome: 'Nome completo *',
    email: 'E-mail *',
    telefone: 'Telefone *',
    telefonePlaceholder: '(21) 99999-9999',
    linkedinPlaceholder: 'https://linkedin.com/in/seu-perfil',
    localidade: 'Localidade *',
    localidadePlaceholder: 'Cidade / UF',
    cargo: 'Cargo atual *',
    empresa: 'Empresa atual *',
    pretensaoMin: 'Pretensão salarial mínima (R$/mês) *',
    pretensaoMax: 'Pretensão salarial (R$/mês) *',
    pretensaoPlaceholder: 'Ex.: 25.000',
    formacao: 'Formação',
    formacaoPlaceholder: 'Ex.: Engenharia de Produção — UFRJ',
    experiencia: 'Resumo da experiência',
    ingles: 'Inglês',
    outrosIdiomas: 'Outros idiomas',
    disponibilidade: 'Disponibilidade para início',
    mobilidade: 'Disponibilidade para mudança de cidade',
    selecione: 'Selecione',
    curriculo: 'Currículo (PDF, DOC ou DOCX, até 5 MB) *',
    consentimento:
      'Autorizo a Ocean Talent Solutions a armazenar e usar meus dados e meu currículo em processos seletivos, conforme a LGPD. *',
    enviar: 'Enviar candidatura',
    enviando: 'Enviando...',
    sucesso: 'Candidatura recebida! Nossa equipe analisará seu perfil e entrará em contato se houver aderência.',
    indisponivel: 'Esta vaga não está mais disponível.',
    falha: 'Não foi possível enviar agora. Tente novamente em instantes.',
    revisar: 'Revise os campos destacados.',
  },
  en: {
    erros: {
      nome: 'Please enter your name',
      email: 'Invalid email',
      telefone: 'Please enter a phone with area code',
      linkedin: 'Invalid URL',
      localidade: 'Please enter your location',
      cargo_atual: 'Please enter your current role',
      empresa_atual: 'Please enter your current company',
      pretensao_min: 'Please enter your minimum salary expectation',
      pretensao_max: 'Please enter your salary expectation',
      pretensaoOrdem: 'The salary expectation must be greater than or equal to the minimum',
      curriculo: 'Please attach your résumé',
      curriculoFormato: 'Send your résumé as PDF, DOC or DOCX',
      curriculoTamanho: 'The résumé must be up to 5 MB',
      consentimento: 'You must authorize the use of your data',
      longo: 'Text too long',
      opcao: 'Invalid option',
    } as Record<string, string>,
    nome: 'Full name *',
    email: 'Email *',
    telefone: 'Phone *',
    telefonePlaceholder: '+55 21 99999-9999',
    linkedinPlaceholder: 'https://linkedin.com/in/your-profile',
    localidade: 'Location *',
    localidadePlaceholder: 'City / State',
    cargo: 'Current role *',
    empresa: 'Current company *',
    pretensaoMin: 'Minimum salary expectation (BRL/month) *',
    pretensaoMax: 'Salary expectation (BRL/month) *',
    pretensaoPlaceholder: 'E.g.: 25,000',
    formacao: 'Education',
    formacaoPlaceholder: 'E.g.: Production Engineering — UFRJ',
    experiencia: 'Experience summary',
    ingles: 'English',
    outrosIdiomas: 'Other languages',
    disponibilidade: 'Availability to start',
    mobilidade: 'Willing to relocate',
    selecione: 'Select',
    curriculo: 'Résumé (PDF, DOC or DOCX, up to 5 MB) *',
    consentimento:
      'I authorize Ocean Talent Solutions to store and use my data and résumé in recruitment processes, under Brazilian data protection law (LGPD). *',
    enviar: 'Submit application',
    enviando: 'Sending...',
    sucesso: 'Application received! Our team will review your profile and reach out if there is a fit.',
    indisponivel: 'This job is no longer available.',
    falha: 'We could not send it right now. Please try again shortly.',
    revisar: 'Please review the highlighted fields.',
  },
};

function extensao(nome: string) {
  const i = nome.lastIndexOf('.');
  return i >= 0 ? nome.slice(i).toLowerCase() : '';
}

function validar(d: Dados, arquivo: File | null, consentimento: boolean, m: Record<string, string>): Erros {
  const e: Erros = {};
  if (!tamanhoEntre(d.nome.trim(), 2, 120)) e.nome = m.nome;
  if (!emailValido(d.email.trim())) e.email = m.email;
  const digitos = d.telefone.replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 13 || d.telefone.trim().length > 30) e.telefone = m.telefone;
  const linkedin = d.linkedin.trim();
  if (linkedin && (!urlValida(linkedin) || linkedin.length > 200)) e.linkedin = m.linkedin;
  if (!tamanhoEntre(d.localidade.trim(), 2, 120)) e.localidade = m.localidade;
  if (!tamanhoEntre(d.cargo_atual.trim(), 2, 120)) e.cargo_atual = m.cargo_atual;
  if (!tamanhoEntre(d.empresa_atual.trim(), 2, 120)) e.empresa_atual = m.empresa_atual;
  const minimo = valorMonetario(d.pretensao_min);
  const maximo = valorMonetario(d.pretensao_max);
  if (!minimo || minimo <= 0 || minimo > 10_000_000) e.pretensao_min = m.pretensao_min;
  if (!maximo || maximo <= 0 || maximo > 10_000_000) e.pretensao_max = m.pretensao_max;
  else if (minimo && maximo < minimo) e.pretensao_max = m.pretensaoOrdem;
  if (d.formacao.length > 300 || d.outros_idiomas.length > 200 || d.experiencia.length > 2000) {
    if (d.formacao.length > 300) e.formacao = m.longo;
    if (d.outros_idiomas.length > 200) e.outros_idiomas = m.longo;
    if (d.experiencia.length > 2000) e.experiencia = m.longo;
  }
  if (!arquivo) e.curriculo = m.curriculo;
  else if (!EXTENSOES.includes(extensao(arquivo.name))) e.curriculo = m.curriculoFormato;
  else if (arquivo.size > MAX_BYTES) e.curriculo = m.curriculoTamanho;
  if (!consentimento) e.consentimento = m.consentimento;
  return e;
}

/** Erros por campo devolvidos pela API (422): usa a mensagem traduzida do campo quando existe. */
function errosDaApi(detalhe: unknown, m: Record<string, string>): Erros | null {
  if (!detalhe || typeof detalhe !== 'object' || Array.isArray(detalhe)) return null;
  const e: Erros = {};
  for (const [campo, texto] of Object.entries(detalhe as Record<string, string>)) {
    e[campo as CampoErro] = campo === 'curriculo' ? String(texto) : m[campo] ?? String(texto);
  }
  return e;
}

function Campo({ id, rotulo, erro, children }: { id: string; rotulo: string; erro?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={`${ROTULO} ${erro ? 'text-destructive' : 'text-primary'}`}>
        {rotulo}
      </label>
      {children}
      {erro && <p className={ERRO}>{erro}</p>}
    </div>
  );
}

function Selecao({ id, valor, opcoes, idioma, vazio, onChange }: {
  id: string;
  valor: string;
  opcoes: Record<string, Txt>;
  idioma: Idioma;
  vazio: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="relative">
      <select id={id} value={valor} onChange={onChange} className={`${SELECAO}${valor ? '' : ' text-muted-foreground'}`}>
        <option value="">{vazio}</option>
        {Object.entries(opcoes).map(([chave, rotulo]) => (
          <option key={chave} value={chave}>
            {rotulo[idioma]}
          </option>
        ))}
      </select>
      <IconeChevronBaixo className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 opacity-50" />
    </div>
  );
}

export default function FormularioCandidatura({ vaga, onIndisponivel }: { vaga: Vaga; onIndisponivel: () => void }) {
  const { idioma } = useIdioma();
  const t = TEXTOS[idioma];
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [consentimento, setConsentimento] = useState(false);
  const [tentou, setTentou] = useState(false);
  const [errosApi, setErrosApi] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [versao, setVersao] = useState(0);
  const erros: Erros = tentou ? { ...errosApi, ...validar(dados, arquivo, consentimento, t.erros) } : {};

  const alterar = (campo: keyof Dados) => (e: { target: { value: string } }) => {
    setDados((d) => ({ ...d, [campo]: e.target.value }));
    setErrosApi((a) => ({ ...a, [campo]: undefined }));
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErrosApi({});
    if (Object.keys(validar(dados, arquivo, consentimento, t.erros)).length > 0) {
      setTentou(true);
      toast.error(t.revisar);
      return;
    }
    const corpo = new FormData();
    for (const [campo, valor] of Object.entries(dados)) corpo.append(campo, valor.trim());
    corpo.append('consentimento', 'true');
    if (arquivo) corpo.append('curriculo', arquivo);

    setEnviando(true);
    try {
      await enviarCandidatura(vaga.id, corpo);
      toast.success(t.sucesso, { duration: 6000 });
      setDados(VAZIO);
      setArquivo(null);
      setConsentimento(false);
      setTentou(false);
      setVersao((v) => v + 1);
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 404) {
        toast.error(t.indisponivel);
        onIndisponivel();
      } else if (erro instanceof ErroApi && (erro.status === 422 || erro.status === 400 || erro.status === 413)) {
        const porCampo =
          erro.status === 422
            ? errosDaApi(erro.detalhe, t.erros)
            : { curriculo: erro.status === 413 ? t.erros.curriculoTamanho : t.erros.curriculoFormato };
        if (porCampo) {
          setErrosApi(porCampo);
          setTentou(true);
          toast.error(t.revisar);
        } else {
          toast.error(t.falha);
        }
      } else {
        toast.error(t.falha);
      }
    } finally {
      setEnviando(false);
    }
  };

  const entrada = (campo: keyof Dados, opts: { placeholder?: string; tipo?: string; max?: number; inputMode?: 'numeric' | 'decimal' | 'tel' } = {}) => (
    <input
      id={`candidatura-${campo}`}
      name={campo}
      type={opts.tipo ?? 'text'}
      value={dados[campo]}
      onChange={alterar(campo)}
      placeholder={opts.placeholder}
      inputMode={opts.inputMode}
      maxLength={opts.max ?? 120}
      aria-invalid={!!erros[campo]}
      className={CAMPO}
    />
  );

  return (
    <form className="grid gap-5" onSubmit={enviar} noValidate>
      {/* Campo isca: invisível para pessoas, preenchido por robôs */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="candidatura-site">Site</label>
        <input id="candidatura-site" name="site" tabIndex={-1} autoComplete="off" value={dados.site} onChange={alterar('site')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="candidatura-nome" rotulo={t.nome} erro={erros.nome}>
          {entrada('nome')}
        </Campo>
        <Campo id="candidatura-email" rotulo={t.email} erro={erros.email}>
          {entrada('email', { tipo: 'email', max: 180 })}
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="candidatura-telefone" rotulo={t.telefone} erro={erros.telefone}>
          {entrada('telefone', { tipo: 'tel', placeholder: t.telefonePlaceholder, max: 30, inputMode: 'tel' })}
        </Campo>
        <Campo id="candidatura-linkedin" rotulo="LinkedIn" erro={erros.linkedin}>
          {entrada('linkedin', { placeholder: t.linkedinPlaceholder, max: 200 })}
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="candidatura-cargo_atual" rotulo={t.cargo} erro={erros.cargo_atual}>
          {entrada('cargo_atual')}
        </Campo>
        <Campo id="candidatura-empresa_atual" rotulo={t.empresa} erro={erros.empresa_atual}>
          {entrada('empresa_atual')}
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="candidatura-pretensao_min" rotulo={t.pretensaoMin} erro={erros.pretensao_min}>
          {entrada('pretensao_min', { placeholder: t.pretensaoPlaceholder, max: 20, inputMode: 'decimal' })}
        </Campo>
        <Campo id="candidatura-pretensao_max" rotulo={t.pretensaoMax} erro={erros.pretensao_max}>
          {entrada('pretensao_max', { placeholder: t.pretensaoPlaceholder, max: 20, inputMode: 'decimal' })}
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="candidatura-localidade" rotulo={t.localidade} erro={erros.localidade}>
          {entrada('localidade', { placeholder: t.localidadePlaceholder })}
        </Campo>
        <Campo id="candidatura-formacao" rotulo={t.formacao} erro={erros.formacao}>
          {entrada('formacao', { placeholder: t.formacaoPlaceholder, max: 300 })}
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="candidatura-ingles" rotulo={t.ingles} erro={erros.ingles}>
          <Selecao id="candidatura-ingles" valor={dados.ingles} opcoes={INGLES} idioma={idioma} vazio={t.selecione} onChange={alterar('ingles')} />
        </Campo>
        <Campo id="candidatura-outros_idiomas" rotulo={t.outrosIdiomas} erro={erros.outros_idiomas}>
          {entrada('outros_idiomas', { max: 200 })}
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="candidatura-disponibilidade" rotulo={t.disponibilidade} erro={erros.disponibilidade}>
          <Selecao
            id="candidatura-disponibilidade"
            valor={dados.disponibilidade}
            opcoes={DISPONIBILIDADE}
            idioma={idioma}
            vazio={t.selecione}
            onChange={alterar('disponibilidade')}
          />
        </Campo>
        <Campo id="candidatura-mobilidade" rotulo={t.mobilidade} erro={erros.mobilidade}>
          <Selecao
            id="candidatura-mobilidade"
            valor={dados.mobilidade}
            opcoes={MOBILIDADE}
            idioma={idioma}
            vazio={t.selecione}
            onChange={alterar('mobilidade')}
          />
        </Campo>
      </div>
      <Campo id="candidatura-experiencia" rotulo={t.experiencia} erro={erros.experiencia}>
        <textarea
          id="candidatura-experiencia"
          name="experiencia"
          rows={5}
          maxLength={2000}
          value={dados.experiencia}
          onChange={alterar('experiencia')}
          className={AREA_TEXTO}
        />
      </Campo>
      <Campo id="candidatura-curriculo" rotulo={t.curriculo} erro={erros.curriculo}>
        <input
          key={versao}
          id="candidatura-curriculo"
          name="curriculo"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => {
            setArquivo(e.target.files?.[0] ?? null);
            setErrosApi((a) => ({ ...a, curriculo: undefined }));
          }}
          aria-invalid={!!erros.curriculo}
          className={`${CAMPO} h-auto py-1.5 file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary`}
        />
      </Campo>
      <div className="space-y-2">
        <label htmlFor="candidatura-consentimento" className="flex items-start gap-3 text-sm text-foreground/80 cursor-pointer">
          <input
            id="candidatura-consentimento"
            type="checkbox"
            checked={consentimento}
            onChange={(e) => setConsentimento(e.target.checked)}
            aria-invalid={!!erros.consentimento}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary cursor-pointer"
          />
          <span className={erros.consentimento ? 'text-destructive' : undefined}>{t.consentimento}</span>
        </label>
        {erros.consentimento && <p className={ERRO}>{erros.consentimento}</p>}
      </div>
      <button
        type="submit"
        disabled={enviando}
        className={`${BOTAO} bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 rounded-md px-8 w-full sm:w-auto sm:justify-self-start`}
      >
        {enviando ? t.enviando : t.enviar}
      </button>
    </form>
  );
}
