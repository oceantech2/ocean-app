export const ACCEPT_NF = '.pdf,.jpg,.jpeg,.png';
export const EXT_NF_OK = ['.pdf', '.jpg', '.jpeg', '.png'];
export const NF_ANEXO_MAX_BYTES = 2 * 1024 * 1024;

export function extensaoArquivo(nome: string) {
  const i = nome.lastIndexOf('.');
  return i >= 0 ? nome.slice(i).toLowerCase() : '';
}

/** Mensagem de recusa ou null se o arquivo for aceito. */
export function motivoArquivoNf(file: File): string | null {
  if (!EXT_NF_OK.includes(extensaoArquivo(file.name))) {
    return 'Use PDF, JPEG ou PNG';
  }
  if (file.size === 0) return 'Arquivo vazio';
  if (file.size > NF_ANEXO_MAX_BYTES) return 'Arquivo excede 2 MB';
  return null;
}
