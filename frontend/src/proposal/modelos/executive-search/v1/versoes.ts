// Diferenças entre as versões do modelo Executive Search, renderizadas pelo mesmo componente.
// Uma proposta assinada continua na versão com que foi aceita (a versão entra no hash do conteúdo).
export interface RecursosVersao {
  tituloDivisao: boolean;
  escopo: boolean;
}

const RECURSOS: Record<number, RecursosVersao> = {
  1: { tituloDivisao: false, escopo: false },
  2: { tituloDivisao: true, escopo: true },
};

export function recursosDaVersao(versao?: number): RecursosVersao {
  return (versao !== undefined && RECURSOS[versao]) || RECURSOS[1];
}
