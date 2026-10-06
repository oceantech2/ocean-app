import type { ModeloPaginaProps } from '../../index';
import PaginaModelo, { type RecursosVersao } from '../../pagina/PaginaModelo';
import enUS from './conteudo/en-US';
import ptBR from './conteudo/pt-BR';

const DIVISAO = { 'pt-BR': ptBR, 'en-US': enUS };
const RECURSOS: RecursosVersao = { tituloDivisao: true, escopo: true, formatoNovo: true };

export default function OutplacementDevelopmentV1(props: ModeloPaginaProps) {
  return <PaginaModelo {...props} divisao={DIVISAO} recursos={RECURSOS} />;
}
