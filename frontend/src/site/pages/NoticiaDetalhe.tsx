import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ErroApi, obterNoticia } from '../api';
import { BOTAO_PADRAO } from '../classes';
import Revelar from '../components/Revelar';
import {
  conteudoNoticia,
  formatarDataNoticia,
  paragrafos,
  resumoNoticia,
  SEGMENTOS,
  tituloNoticia,
  type Noticia,
} from '../dados/noticias';
import { useIdioma } from '../idioma';
import { CAMINHOS, caminhoNoticia, noticiaDoCaminho } from '../rotas';

const TEXTOS = {
  pt: {
    voltar: '← Todas as notícias',
    indisponivel: 'Esta notícia não está disponível.',
    indisponivelTexto: 'Ela pode ter sido removida ou ainda não foi publicada. Confira as outras notícias.',
    erro: 'Não foi possível carregar a notícia. Tente novamente em instantes.',
    verNoticias: 'Ver notícias',
    carregando: 'Carregando notícia',
  },
  en: {
    voltar: '← All news',
    indisponivel: 'This article is not available.',
    indisponivelTexto: 'It may have been removed or is not published yet. Check our other news.',
    erro: 'We could not load this article. Please try again shortly.',
    verNoticias: 'See news',
    carregando: 'Loading article',
  },
};

export default function NoticiaDetalhe() {
  const { idioma } = useIdioma();
  const t = TEXTOS[idioma];
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const id = noticiaDoCaminho(pathname)?.id;
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'indisponivel' | 'erro'>('carregando');

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    setEstado('carregando');
    obterNoticia(id)
      .then((n) => {
        if (!ativo) return;
        setNoticia(n);
        setEstado('ok');
      })
      .catch((e) => ativo && setEstado(e instanceof ErroApi && e.status === 404 ? 'indisponivel' : 'erro'));
    return () => {
      ativo = false;
    };
  }, [id]);

  useEffect(() => {
    if (!noticia) return;
    document.title = `${tituloNoticia(noticia, idioma)} | Ocean Talent Solutions`;
    const atual = caminhoNoticia(noticia, idioma);
    if (pathname.replace(/\/+$/, '') !== atual) navigate(`${atual}${hash}`, { replace: true });
  }, [noticia, idioma, pathname, hash, navigate]);

  if (estado !== 'ok' || !noticia) {
    return (
      <section className="bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-28">
          {estado === 'carregando' ? (
            <div className="flex justify-center py-10" role="status" aria-label={t.carregando}>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl text-primary">{estado === 'erro' ? t.erro : t.indisponivel}</h1>
              {estado === 'indisponivel' && <p className="mt-4 text-foreground/75">{t.indisponivelTexto}</p>}
              <Link to={CAMINHOS.noticias[idioma]} className={`${BOTAO_PADRAO} mt-8`}>
                {t.verNoticias}
              </Link>
            </>
          )}
        </div>
      </section>
    );
  }

  const corpo = paragrafos(conteudoNoticia(noticia, idioma));

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-6 py-14 lg:px-10 lg:py-20">
          <Revelar>
            <Link to={CAMINHOS.noticias[idioma]} className="text-sm text-primary-foreground/70 hover:text-primary-foreground">
              {t.voltar}
            </Link>
            <span className="mt-6 inline-flex rounded-full bg-accent/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-soft">
              {SEGMENTOS[noticia.segmento][idioma]}
            </span>
            <h1 className="mt-4 font-display text-3xl text-primary-foreground sm:text-4xl">{tituloNoticia(noticia, idioma)}</h1>
            <p className="mt-4 text-sm text-primary-foreground/70">{formatarDataNoticia(noticia.data_publicacao, idioma)}</p>
            <p className="mt-6 text-lg text-primary-foreground/85">{resumoNoticia(noticia, idioma)}</p>
          </Revelar>
        </div>
      </section>

      <section className="bg-background px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-5">
          {corpo.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-foreground/80">
              {p}
            </p>
          ))}
        </div>
      </section>
    </>
  );
}
