import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { AREA_TEXTO, BOTAO_PADRAO, CAMPO, ERRO, ROTULO } from '../classes';
import type { Vaga } from '../dados/vagas';
import { IconeFechar } from '../icones';
import { emailValido, tamanhoEntre, urlValida } from '../validacao';

const VAZIO = { nome: '', email: '', linkedin: '', mensagem: '' };
type Dados = typeof VAZIO;
type Erros = Partial<Record<keyof Dados, string>>;

function validar(d: Dados): Erros {
  const e: Erros = {};
  if (!tamanhoEntre(d.nome.trim(), 2, 120)) e.nome = 'Informe seu nome';
  if (!emailValido(d.email.trim())) e.email = 'E-mail inválido';
  const linkedin = d.linkedin.trim();
  if (!urlValida(linkedin) || linkedin.length > 200) e.linkedin = 'URL inválida';
  return e;
}

function Campo({ id, rotulo, erro, children }: { id: string; rotulo: string; erro?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={`${ROTULO}${erro ? ' text-destructive' : ''}`}>
        {rotulo}
      </label>
      {children}
      {erro && <p className={ERRO}>{erro}</p>}
    </div>
  );
}

export default function ModalInteresse({ vaga, onFechar }: { vaga: Vaga | null; onFechar: () => void }) {
  const [dados, setDados] = useState<Dados>(VAZIO);
  const [tentou, setTentou] = useState(false);
  const erros = tentou ? validar(dados) : {};

  useEffect(() => {
    setDados(VAZIO);
    setTentou(false);
    if (!vaga) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    window.addEventListener('keydown', aoTeclar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflow;
    };
  }, [vaga, onFechar]);

  if (!vaga) return null;

  const alterar = (campo: keyof Dados) => (e: { target: { value: string } }) =>
    setDados((d) => ({ ...d, [campo]: e.target.value }));

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(validar(dados)).length > 0) {
      setTentou(true);
      return;
    }
    toast.success('Interesse registrado. Em breve retornaremos.');
    onFechar();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80" onClick={onFechar} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="interesse-titulo"
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
      >
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 id="interesse-titulo" className="text-lg font-semibold leading-none tracking-tight font-display">
            {vaga.titulo}
          </h2>
          <p className="text-sm text-muted-foreground">
            {vaga.area} · {vaga.nivel} · {vaga.local}
          </p>
        </div>
        <form onSubmit={enviar} className="grid gap-4" noValidate>
          <Campo id="interesse-nome" rotulo="Nome" erro={erros.nome}>
            <input id="interesse-nome" value={dados.nome} onChange={alterar('nome')} aria-invalid={!!erros.nome} className={CAMPO} autoFocus />
          </Campo>
          <Campo id="interesse-email" rotulo="E-mail" erro={erros.email}>
            <input
              id="interesse-email"
              type="email"
              value={dados.email}
              onChange={alterar('email')}
              aria-invalid={!!erros.email}
              className={CAMPO}
            />
          </Campo>
          <Campo id="interesse-linkedin" rotulo="LinkedIn" erro={erros.linkedin}>
            <input
              id="interesse-linkedin"
              value={dados.linkedin}
              onChange={alterar('linkedin')}
              placeholder="https://linkedin.com/in/seuperfil"
              aria-invalid={!!erros.linkedin}
              className={CAMPO}
            />
          </Campo>
          <Campo id="interesse-mensagem" rotulo="Mensagem (opcional)">
            <textarea
              id="interesse-mensagem"
              rows={3}
              maxLength={1000}
              value={dados.mensagem}
              onChange={alterar('mensagem')}
              className={AREA_TEXTO}
            />
          </Campo>
          <button type="submit" className={BOTAO_PADRAO}>
            Enviar interesse
          </button>
        </form>
        <button
          type="button"
          onClick={onFechar}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <IconeFechar className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
      </div>
    </>
  );
}
