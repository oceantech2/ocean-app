import { CONTATO } from '../dados/conteudo';
import { IconeWhatsApp } from '../icones';

export default function WhatsAppFlutuante() {
  return (
    <a
      href={CONTATO.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Fale conosco no WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-transform hover:scale-105"
    >
      <IconeWhatsApp className="h-7 w-7" />
    </a>
  );
}
