import type { ModeloPaginaProps } from '../../index';
import PaginaModelo from '../../pagina/PaginaModelo';
import enUS from './conteudo/en-US';
import ptBR from './conteudo/pt-BR';
import { recursosDaVersao } from './versoes';

const DIVISAO = { 'pt-BR': ptBR, 'en-US': enUS };

export default function ExecutiveSearchV1(props: ModeloPaginaProps) {
  return <PaginaModelo {...props} divisao={DIVISAO} recursos={recursosDaVersao(props.dados.modelo_versao)} />;
}
