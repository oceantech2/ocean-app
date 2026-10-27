export interface Vaga {
  id: string;
  titulo: string;
  area: string;
  nivel: string;
  local: string;
  resumo: string;
}

export const AREAS = ['Todas', 'Finanças', 'Tecnologia', 'Comercial', 'Recursos Humanos', 'Operações'];

export const NIVEIS = ['Todos', 'Gerência', 'Diretoria', 'VP', 'C-Level'];

export const VAGAS: Vaga[] = [
  {
    id: 'v1',
    titulo: 'CFO',
    area: 'Finanças',
    nivel: 'C-Level',
    local: 'São Paulo / SP',
    resumo: 'Indústria de bens de consumo, controle de planejamento e M&A.',
  },
  {
    id: 'v2',
    titulo: 'VP de Engenharia',
    area: 'Tecnologia',
    nivel: 'VP',
    local: 'Remoto · Brasil',
    resumo: 'Scale-up SaaS B2B, liderança de 4 squads e cultura técnica.',
  },
  {
    id: 'v3',
    titulo: 'Diretor Comercial',
    area: 'Comercial',
    nivel: 'Diretoria',
    local: 'São Paulo / SP',
    resumo: 'Varejo premium, expansão multicanal e gestão de KAMs.',
  },
  {
    id: 'v4',
    titulo: 'Head de RH',
    area: 'Recursos Humanos',
    nivel: 'Diretoria',
    local: 'Híbrido · SP',
    resumo: 'Reestruturação organizacional e desenho de cultura.',
  },
  {
    id: 'v5',
    titulo: 'Gerente de Operações',
    area: 'Operações',
    nivel: 'Gerência',
    local: 'São Paulo / SP',
    resumo: 'Logística e melhoria contínua em operação industrial.',
  },
];
