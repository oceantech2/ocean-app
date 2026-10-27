import { useState, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { AREA_TEXTO, BOTAO, CAMPO, ERRO, ROTULO, SELECAO } from '../classes';
import { IconeChevronBaixo } from '../icones';
import { emailValido, tamanhoEntre } from '../validacao';

const VAZIO = { nome: '', email: '', telefone: '', linkedin: '', cargo: '', empresa: '', tipo: '', mensagem: '' };
type Dados = typeof VAZIO;
type Erros = Partial<Record<keyof Dados, string>>;

function validar(d: Dados): Erros {
  const e: Erros = {};
  const nome = d.nome.trim();
  const telefone = d.telefone.trim();
  if (!tamanhoEntre(nome, 2, 120)) e.nome = 'Informe seu nome';
  if (!emailValido(d.email.trim())) e.email = 'E-mail inválido';
  if (telefone.length < 8) e.telefone = 'Informe um telefone válido';
  else if (telefone.length > 40) e.telefone = 'Telefone muito longo';
  if (!tamanhoEntre(d.cargo.trim(), 1, 120)) e.cargo = 'Informe seu cargo';
  if (!tamanhoEntre(d.empresa.trim(), 1, 160)) e.empresa = 'Informe sua empresa';
  if (!d.tipo) e.tipo = 'Selecione uma opção';
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
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [tentou, setTentou] = useState(false);
  const erros = tentou ? validar(dados) : {};

  const alterar = (campo: keyof Dados) => (e: { target: { value: string } }) =>
    setDados((d) => ({ ...d, [campo]: e.target.value }));

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(validar(dados)).length > 0) {
      setTentou(true);
      return;
    }
    toast.success('Mensagem recebida. Um consultor da Ocean entrará em contato em até 1 dia útil.');
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
        <Campo id="contato-nome" rotulo="Nome completo *" erro={erros.nome}>
          {entrada('nome', 'Seu nome completo')}
        </Campo>
        <Campo id="contato-email" rotulo="E-mail *" erro={erros.email}>
          {entrada('email', 'voce@email.com', 'email')}
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="contato-telefone" rotulo="Telefone *" erro={erros.telefone}>
          {entrada('telefone', '(11) 99999-9999', 'tel')}
        </Campo>
        <Campo id="contato-linkedin" rotulo="LinkedIn">
          {entrada('linkedin', 'linkedin.com/in/seu-perfil')}
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="contato-cargo" rotulo="Cargo *" erro={erros.cargo}>
          {entrada('cargo', 'Seu cargo')}
        </Campo>
        <Campo id="contato-empresa" rotulo="Empresa *" erro={erros.empresa}>
          {entrada('empresa', 'Nome da empresa')}
        </Campo>
      </div>
      <Campo id="contato-tipo" rotulo="Sou... *" erro={erros.tipo}>
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
              Selecione uma opção
            </option>
            <option value="empresa">Empresa buscando contratar</option>
            <option value="profissional">Profissional em busca de oportunidades</option>
            <option value="outro">Outro</option>
          </select>
          <IconeChevronBaixo className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 opacity-50" />
        </div>
      </Campo>
      <Campo id="contato-mensagem" rotulo="Mensagem">
        <textarea
          id="contato-mensagem"
          name="mensagem"
          rows={5}
          maxLength={2000}
          value={dados.mensagem}
          onChange={alterar('mensagem')}
          placeholder="Como podemos ajudar?"
          className={AREA_TEXTO}
        />
      </Campo>
      <button
        type="submit"
        className={`${BOTAO} bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 rounded-md px-8 w-full sm:w-auto`}
      >
        Enviar mensagem
      </button>
    </form>
  );
}
