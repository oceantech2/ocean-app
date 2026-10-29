import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProposalLayout from '../components/ProposalLayout';
import { mensagemErro } from '../services/proposalApi';
import { abrirCurriculo } from './VagaDetalhe';

// Destino do link do currículo gravado na planilha: abre o arquivo nesta aba
export default function CurriculoAbrir() {
  const { id } = useParams();
  const [erro, setErro] = useState<string | null>(null);
  const [baixado, setBaixado] = useState(false);
  const iniciado = useRef(false);

  useEffect(() => {
    if (!id || iniciado.current) return;
    iniciado.current = true;
    abrirCurriculo({ id: Number(id), curriculo_nome: null }, null)
      .then(() => setBaixado(true))
      .catch((e) =>
        setErro(e?.response?.status === 404 ? 'Currículo não encontrado' : mensagemErro(e, 'Não foi possível abrir o currículo')),
      );
  }, [id]);

  return (
    <ProposalLayout>
      <div className="text-center py-16 text-gray-600 space-y-4">
        {erro ? (
          <p>{erro}</p>
        ) : baixado ? (
          <p>Download do currículo iniciado.</p>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean-700" />
          </div>
        )}
        <Link to="/vagas" className="text-sm text-ocean-700 hover:underline">
          Ir para as vagas
        </Link>
      </div>
    </ProposalLayout>
  );
}
