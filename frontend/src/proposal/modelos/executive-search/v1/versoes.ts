// Diferenças entre as versões do modelo Executive Search, renderizadas pelo mesmo componente.
// Uma proposta assinada continua na versão com que foi aceita (a versão entra no hash do conteúdo).
import type { RecursosVersao } from '../../pagina/PaginaModelo';

const RECURSOS: Record<number, RecursosVersao> = {
  1: { tituloDivisao: false, escopo: false, formatoNovo: false },
  2: { tituloDivisao: true, escopo: true, formatoNovo: false },
  3: { tituloDivisao: true, escopo: true, formatoNovo: true },
};

export function recursosDaVersao(versao?: number): RecursosVersao {
  return (versao !== undefined && RECURSOS[versao]) || RECURSOS[1];
}
