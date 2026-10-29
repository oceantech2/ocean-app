import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ErroApi, obterVaga } from '../api';
import { BOTAO_PADRAO } from '../classes';
import FormularioCandidatura from '../components/FormularioCandidatura';
import Revelar from '../components/Revelar';
import { AREAS, itensDaLista, NIVEIS, paragrafos, type Vaga } from '../dados/vagas';
import { IconeLocal } from '../icones';
import { useIdioma } from '../idioma';
import { CAMINHOS, caminhoVaga, vagaDoCaminho } from '../rotas';

const TEXTOS = {
  pt: {
    voltar: '← Todas as vagas',
    candidatar: 'Candidatar-me',
    descricao: 'Sobre a vaga',
    responsabilidades: 'Responsabilidades',
    requisitos: 'Pré-requisitos',
    diferenciais: 'Diferenciais',
    candidatura: 'Candidatura',
    candidaturaTexto: 'Preencha seus dados e anexe o currículo. Os campos com * são obrigatórios.',
    indisponivel: 'Esta vaga não está mais disponível.',
    indisponivelTexto: 'Ela pode ter sido encerrada. Confira as outras vagas em andamento.',
    erro: 'Não foi possível carregar a vaga. Tente novamente em instantes.',
    verVagas: 'Ver vagas abertas',
    carregando: 'Carregando vaga',
  },
  en: {
    voltar: '← All jobs',
    candidatar: 'Apply',
    descricao: 'About the job',
    responsabilidades: 'Responsibilities',
    requisitos: 'Requirements',
    diferenciais: 'Nice to have',
    candidatura: 'Application',
    candidaturaTexto: 'Fill in your details and attach your résumé. Fields marked with * are required.',
    indisponivel: 'This job is no longer available.',
    indisponivelTexto: 'It may have been closed. Check our other open jobs.',
    erro: 'We could not load this job. Please try again shortly.',
    verVagas: 'See open jobs',
    carregando: 'Loading job',
  },
};

function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (!itens.length) return null;
  return (
    <div>
      <h2 className="font-display text-2xl text-primary">{titulo}</h2>
      <ul className="mt-4 grid gap-2.5">
        {itens.map((item, i) => (
          <li key={i} className="flex gap-3 text-foreground/80 leading-relaxed">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function VagaDetalhe() {
  const { idioma } = useIdioma();
  const t = TEXTOS[idioma];
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const id = vagaDoCaminho(pathname)?.id;
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'indisponivel' | 'erro'>('carregando');

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    setEstado('carregando');
    obterVaga(id)
      .then((v) => {
        if (!ativo) return;
        setVaga(v);
        setEstado('ok');
      })
      .catch((e) => ativo && setEstado(e instanceof ErroApi && e.status === 404 ? 'indisponivel' : 'erro'));
    return () => {
      ativo = false;
    };
  }, [id]);

  useEffect(() => {
    if (!vaga) return;
    document.title = `${vaga.titulo} | Ocean Talent Solutions`;
    // Título editado depois do link compartilhado: mantém a vaga e atualiza o endereço
    const atual = caminhoVaga(vaga, idioma);
    if (pathname.replace(/\/+$/, '') !== atual) navigate(`${atual}${hash}`, { replace: true });
  }, [vaga, idioma, pathname, hash, navigate]);

  const irParaCandidatura = () => document.getElementById('candidatura')?.scrollIntoView({ behavior: 'smooth' });

  if (estado !== 'ok' || !vaga) {
    return (
      <section className="bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-24 lg:px-10 lg:py-28 text-center">
          {estado === 'carregando' ? (
            <div className="flex justify-center py-10" role="status" aria-label={t.carregando}>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl text-primary">{estado === 'erro' ? t.erro : t.indisponivel}</h1>
              {estado === 'indisponivel' && <p className="mt-4 text-foreground/75">{t.indisponivelTexto}</p>}
              <Link to={CAMINHOS.vagas[idioma]} className={`${BOTAO_PADRAO} mt-8`}>
                {t.verVagas}
              </Link>
            </>
          )}
        </div>
      </section>
    );
  }

  const textoDescricao = paragrafos(vaga.descricao);

  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <Revelar>
            <Link to={CAMINHOS.vagas[idioma]} className="text-sm text-primary/70 hover:text-primary hover:underline">
              {t.voltar}
            </Link>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
              {AREAS[vaga.area][idioma]} · {NIVEIS[vaga.nivel][idioma]}
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl text-primary sm:text-5xl">{vaga.titulo}</h1>
            <p className="mt-4 inline-flex items-center gap-1.5 text-muted-foreground">
              <IconeLocal className="h-4 w-4" /> {vaga.localidade}
            </p>
            <p className="mt-6 max-w-2xl text-lg text-foreground/75">{vaga.resumo}</p>
            <button type="button" onClick={irParaCandidatura} className={`${BOTAO_PADRAO} mt-8`}>
              {t.candidatar}
            </button>
          </Revelar>
        </div>
      </section>

      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto grid max-w-3xl gap-12 px-6 py-16 lg:px-10">
          {textoDescricao.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-primary">{t.descricao}</h2>
              <div className="mt-4 grid gap-4">
                {textoDescricao.map((p, i) => (
                  <p key={i} className="whitespace-pre-line leading-relaxed text-foreground/80">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}
          <Lista titulo={t.responsabilidades} itens={itensDaLista(vaga.responsabilidades)} />
          <Lista titulo={t.requisitos} itens={itensDaLista(vaga.requisitos)} />
          <Lista titulo={t.diferenciais} itens={itensDaLista(vaga.diferenciais)} />
        </div>
      </section>

      <section id="candidatura" className="scroll-mt-24 border-t border-border/60 bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
          <h2 className="font-display text-3xl text-primary">{t.candidatura}</h2>
          <p className="mt-3 text-foreground/75">{t.candidaturaTexto}</p>
          <div className="mt-8">
            <FormularioCandidatura vaga={vaga} onIndisponivel={() => setEstado('indisponivel')} />
          </div>
        </div>
      </section>
    </>
  );
}
