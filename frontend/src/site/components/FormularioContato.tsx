import { useState, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { AREA_TEXTO, BOTAO, CAMPO, ERRO, ROTULO, SELECAO } from '../classes';
import { IconeChevronBaixo } from '../icones';
import { useIdioma } from '../idioma';
import { emailValido, tamanhoEntre } from '../validacao';

const VAZIO = { nome: '', email: '', telefone: '', linkedin: '', cargo: '', empresa: '', tipo: '', mensagem: '' };
type Dados = typeof VAZIO;
type Erros = Partial<Record<keyof Dados, string>>;

const TEXTOS = {
  pt: {
    erros: {
      nome: 'Informe seu nome',
      email: 'E-mail inválido',
      telefone: 'Informe um telefone válido',
      telefoneLongo: 'Telefone muito longo',
      cargo: 'Informe seu cargo',
      empresa: 'Informe sua empresa',
      tipo: 'Selecione uma opção',
    },
    sucesso: 'Mensagem recebida. Um consultor da Ocean entrará em contato em até 1 dia útil.',
    nome: 'Nome completo *',
    nomePlaceholder: 'Seu nome completo',
    email: 'E-mail *',
    emailPlaceholder: 'voce@email.com',
    telefone: 'Telefone *',
    telefonePlaceholder: '(11) 99999-9999',
    linkedinPlaceholder: 'linkedin.com/in/seu-perfil',
    cargo: 'Cargo *',
    cargoPlaceholder: 'Seu cargo',
    empresa: 'Empresa *',
    empresaPlaceholder: 'Nome da empresa',
    tipo: 'Sou... *',
    tipoSelecione: 'Selecione uma opção',
    tipoEmpresa: 'Empresa buscando contratar',
    tipoProfissional: 'Profissional em busca de oportunidades',
    tipoOutro: 'Outro',
    mensagem: 'Mensagem',
    mensagemPlaceholder: 'Como podemos ajudar?',
    enviar: 'Enviar mensagem',
  },
  en: {
    erros: {
      nome: 'Please enter your name',
      email: 'Invalid email',
      telefone: 'Please enter a valid phone',
      telefoneLongo: 'Phone too long',
      cargo: 'Please enter your role',
      empresa: 'Please enter your company',
      tipo: 'Select an option',
    },
    sucesso: 'Message received. An Ocean consultant will reach out within 1 business day.',
    nome: 'Full name *',
    nomePlaceholder: 'Your full name',
    email: 'Email *',
    emailPlaceholder: 'you@email.com',
    telefone: 'Phone *',
    telefonePlaceholder: '+1 555 555-5555',
    linkedinPlaceholder: 'linkedin.com/in/your-profile',
    cargo: 'Role *',
    cargoPlaceholder: 'Your role',
    empresa: 'Company *',
    empresaPlaceholder: 'Company name',
    tipo: 'I am... *',
    tipoSelecione: 'Select an option',
    tipoEmpresa: 'A company looking to hire',
    tipoProfissional: 'A professional seeking opportunities',
    tipoOutro: 'Other',
    mensagem: 'Message',
    mensagemPlaceholder: 'How can we help?',
    enviar: 'Send message',
  },
};

function validar(d: Dados, mensagens: (typeof TEXTOS)['pt']['erros']): Erros {
  const e: Erros = {};
  const nome = d.nome.trim();
  const telefone = d.telefone.trim();
  if (!tamanhoEntre(nome, 2, 120)) e.nome = mensagens.nome;
  if (!emailValido(d.email.trim())) e.email = mensagens.email;
  if (telefone.length < 8) e.telefone = mensagens.telefone;
  else if (telefone.length > 40) e.telefone = mensagens.telefoneLongo;
  if (!tamanhoEntre(d.cargo.trim(), 1, 120)) e.cargo = mensagens.cargo;
  if (!tamanhoEntre(d.empresa.trim(), 1, 160)) e.empresa = mensagens.empresa;
  if (!d.tipo) e.tipo = mensagens.tipo;
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

export default function FormularioContato() {
  const { idioma } = useIdioma();
  const t = TEXTOS[idioma];
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [tentou, setTentou] = useState(false);
  const erros = tentou ? validar(dados, t.erros) : {};

  const alterar = (campo: keyof Dados) => (e: { target: { value: string } }) =>
    setDados((d) => ({ ...d, [campo]: e.target.value }));

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(validar(dados, t.erros)).length > 0) {
      setTentou(true);
      return;
    }
    toast.success(t.sucesso);
    setDados(VAZIO);
    setTentou(false);
  };

  const entrada = (campo: keyof Dados, placeholder: string, tipo = 'text') => (
    <input
      id={`contato-${campo}`}
      name={campo}
      type={tipo}
      value={dados[campo]}
      onChange={alterar(campo)}
      placeholder={placeholder}
      aria-invalid={!!erros[campo]}
      maxLength={campo === 'linkedin' ? 200 : undefined}
      className={CAMPO}
    />
  );

  return (
    <form className="grid gap-5" onSubmit={enviar} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="contato-nome" rotulo={t.nome} erro={erros.nome}>
          {entrada('nome', t.nomePlaceholder)}
        </Campo>
        <Campo id="contato-email" rotulo={t.email} erro={erros.email}>
          {entrada('email', t.emailPlaceholder, 'email')}
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="contato-telefone" rotulo={t.telefone} erro={erros.telefone}>
          {entrada('telefone', t.telefonePlaceholder, 'tel')}
        </Campo>
        <Campo id="contato-linkedin" rotulo="LinkedIn">
          {entrada('linkedin', t.linkedinPlaceholder)}
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="contato-cargo" rotulo={t.cargo} erro={erros.cargo}>
          {entrada('cargo', t.cargoPlaceholder)}
        </Campo>
        <Campo id="contato-empresa" rotulo={t.empresa} erro={erros.empresa}>
          {entrada('empresa', t.empresaPlaceholder)}
        </Campo>
      </div>
      <Campo id="contato-tipo" rotulo={t.tipo} erro={erros.tipo}>
        <div className="relative">
          <select
            id="contato-tipo"
            name="tipo"
            value={dados.tipo}
            onChange={alterar('tipo')}
            aria-invalid={!!erros.tipo}
            className={`${SELECAO}${dados.tipo ? '' : ' text-muted-foreground'}`}
          >
            <option value="" disabled>
              {t.tipoSelecione}
            </option>
            <option value="empresa">{t.tipoEmpresa}</option>
            <option value="profissional">{t.tipoProfissional}</option>
            <option value="outro">{t.tipoOutro}</option>
          </select>
          <IconeChevronBaixo className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 opacity-50" />
        </div>
      </Campo>
      <Campo id="contato-mensagem" rotulo={t.mensagem}>
        <textarea
          id="contato-mensagem"
          name="mensagem"
          rows={5}
          maxLength={2000}
          value={dados.mensagem}
          onChange={alterar('mensagem')}
          placeholder={t.mensagemPlaceholder}
          className={AREA_TEXTO}
        />
      </Campo>
      <button
        type="submit"
        className={`${BOTAO} bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 rounded-md px-8 w-full sm:w-auto`}
      >
        {t.enviar}
      </button>
    </form>
  );
}
