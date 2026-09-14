from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Literal
from datetime import datetime, date

# ==================== COLABORADORES ====================
class ColaboradorBase(BaseModel):
    nome: str
    tipo: str = "fornecedor"
    elegivel_equipe: bool = False
    tipo_fornecedor: str = "fixo"
    tipo_documento: str = "cpf"
    documento: Optional[str] = None
    cpf: Optional[str] = None
    razao_social: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    pf_nome: Optional[str] = None
    pf_cpf: Optional[str] = None
    pf_endereco: Optional[str] = None
    pf_data_nascimento: Optional[date] = None
    cargo: Optional[str] = None
    salario: Optional[float] = None
    data_nascimento: Optional[date] = None
    endereco_completo: Optional[str] = None
    cep: Optional[str] = None
    observacao: Optional[str] = None
    beneficio: Optional[str] = None

class ColaboradorCreate(ColaboradorBase):
    data_admissao: Optional[date] = None
    data_desligamento: Optional[date] = None

class ColaboradorUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None
    elegivel_equipe: Optional[bool] = None
    tipo_fornecedor: Optional[str] = None
    tipo_documento: Optional[str] = None
    documento: Optional[str] = None
    cpf: Optional[str] = None
    razao_social: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    pf_nome: Optional[str] = None
    pf_cpf: Optional[str] = None
    pf_endereco: Optional[str] = None
    pf_data_nascimento: Optional[date] = None
    cargo: Optional[str] = None
    salario: Optional[float] = None
    data_nascimento: Optional[date] = None
    endereco_completo: Optional[str] = None
    cep: Optional[str] = None
    data_admissao: Optional[date] = None
    data_desligamento: Optional[date] = None
    ativo: Optional[bool] = None
    observacao: Optional[str] = None
    beneficio: Optional[str] = None

class ColaboradorResponse(ColaboradorBase):
    id: int
    data_admissao: Optional[datetime] = None
    data_desligamento: Optional[datetime] = None
    ativo: bool
    criado_em: datetime

    class Config:
        from_attributes = True

# ==================== NFs ====================
def _numero_opcional(v):
    if v is None:
        return None
    s = str(v).strip()
    return s or None


_TIPOS_OFICIAIS = ("retainer", "sucesso", "parcelamento")


def _tipo_oficial(v):
    if v is None:
        return None
    t = str(v).strip().lower()
    if t == "parcela":
        t = "parcelamento"
    if t not in _TIPOS_OFICIAIS:
        raise ValueError("tipo deve ser retainer, sucesso ou parcelamento")
    return t


def _data_opcional(v):
    if v is None or v == "":
        return None
    return v


class NFBase(BaseModel):
    numero: Optional[str] = None
    razao_social: str
    posicao: Optional[str] = None
    candidato: Optional[str] = None
    valor_bruto: float
    valor_imposto: Optional[float] = None
    aliquota_imposto: Optional[float] = None
    valor_liquido: float
    data_ent_pgto: Optional[date] = None
    data_emissao: Optional[date] = None
    data_vencimento: Optional[date] = None
    tipo: str  # retainer | sucesso | parcelamento
    tipo_abertura_fechamento: Optional[str] = None  # legado; classificação oficial é só `tipo`

    @field_validator("numero", mode="before")
    @classmethod
    def normalizar_numero_base(cls, v):
        return _numero_opcional(v)

    @field_validator("data_emissao", "data_vencimento", "data_ent_pgto", mode="before")
    @classmethod
    def datas_vazias_base(cls, v):
        return _data_opcional(v)

    @field_validator("tipo")
    @classmethod
    def validar_tipo_base(cls, v):
        return _tipo_oficial(v)

class ComissaoLinhaInput(BaseModel):
    id: Optional[int] = None
    colaborador_id: int
    mes: int = Field(..., ge=1, le=12)
    ano: int
    atividades: List[str]
    percentual: float = Field(..., gt=0)

    @field_validator("atividades")
    @classmethod
    def validar_atividades(cls, v):
        validas = {"lead", "venda", "conducao", "placement"}
        if not v:
            raise ValueError("Informe ao menos uma atividade")
        for a in v:
            if a not in validas:
                raise ValueError(f"Atividade inválida: {a}")
        return list(dict.fromkeys(v))

class BonusLinhaInput(BaseModel):
    id: Optional[int] = None
    colaborador_id: int
    mes: int = Field(..., ge=1, le=12)
    ano: int
    valor: float = Field(..., gt=0)

    @model_validator(mode="before")
    @classmethod
    def rejeitar_campos_comissao(cls, data):
        if isinstance(data, dict):
            if data.get("percentual") is not None:
                raise ValueError("Linha de bônus não aceita percentual")
            atividades = data.get("atividades")
            if atividades:
                raise ValueError("Linha de bônus não aceita atividades")
        return data

class NFCreate(NFBase):
    status: Optional[str] = None
    data_pagamento: Optional[date] = None
    caixa: Optional[str] = None
    colaborador_lead_id: Optional[int] = None
    colaborador_conducao_id: Optional[int] = None
    colaborador_placement_id: Optional[int] = None
    comissoes: Optional[List[ComissaoLinhaInput]] = None
    bonus: Optional[List[BonusLinhaInput]] = None

    @field_validator("data_pagamento", mode="before")
    @classmethod
    def data_pag_vazia_create(cls, v):
        return _data_opcional(v)

    @field_validator("caixa")
    @classmethod
    def validar_caixa_create(cls, v):
        if v is not None and not str(v).strip():
            raise ValueError("caixa inválido")
        return v

    @model_validator(mode="after")
    def numero_exige_emissao_create(self):
        if self.numero and not self.data_emissao:
            raise ValueError("Data de emissão é obrigatória quando o número da NF é informado")
        return self

class NFUpdate(BaseModel):
    """Atualização de conta a receber (Maggo e Ocean).

    `aliquota_imposto` é editável (0–100). `valor_imposto` e `valor_liquido` podem
    vir no body por compatibilidade, mas NÃO são autoritativos no write — o servidor
    recalcula a partir de valor_bruto + aliquota_imposto.
    """
    numero: Optional[str] = None
    razao_social: Optional[str] = None
    posicao: Optional[str] = None
    candidato: Optional[str] = None
    valor_bruto: Optional[float] = None
    valor_imposto: Optional[float] = Field(
        default=None,
        description="Ignorado no write; derivado de bruto + alíquota no servidor",
    )
    aliquota_imposto: Optional[float] = Field(default=None, ge=0, le=100)
    valor_liquido: Optional[float] = Field(
        default=None,
        description="Ignorado no write; derivado de bruto + alíquota no servidor",
    )
    data_ent_pgto: Optional[date] = None
    data_emissao: Optional[date] = None
    data_vencimento: Optional[date] = None
    tipo: Optional[str] = None
    tipo_abertura_fechamento: Optional[str] = None
    data_pagamento: Optional[date] = None
    colaborador_lead_id: Optional[int] = None
    colaborador_conducao_id: Optional[int] = None
    colaborador_placement_id: Optional[int] = None
    arquivada: Optional[bool] = None
    caixa: Optional[str] = None
    comissoes: Optional[List[ComissaoLinhaInput]] = None
    bonus: Optional[List[BonusLinhaInput]] = None

    @field_validator("numero", mode="before")
    @classmethod
    def normalizar_numero_update(cls, v):
        return _numero_opcional(v)

    @field_validator("data_emissao", "data_vencimento", "data_ent_pgto", "data_pagamento", mode="before")
    @classmethod
    def datas_vazias_update(cls, v):
        return _data_opcional(v)

    @field_validator("tipo")
    @classmethod
    def validar_tipo_update(cls, v):
        return _tipo_oficial(v)

    @field_validator("caixa")
    @classmethod
    def validar_caixa(cls, v):
        if v is not None and not str(v).strip():
            raise ValueError("caixa inválido")
        return v

class NFResponse(NFBase):
    id: int
    maggo_id: Optional[str] = None
    status: str
    data_pagamento: Optional[date]
    colaborador_lead_id: Optional[int]
    colaborador_conducao_id: Optional[int]
    colaborador_placement_id: Optional[int]
    arquivada: bool = False
    caixa: Optional[str] = None
    origem: Optional[str] = None  # manual | maggo
    anexo_nome: Optional[str] = None
    criado_em: datetime

    class Config:
        from_attributes = True

# ==================== BÔNUS ====================
class BonusBase(BaseModel):
    colaborador_id: int
    mes: int = Field(..., ge=1, le=12)
    ano: int
    etapa: str  # "lead", "conducao", "placement"
    percentual: float
    valor_bonus: float
    cliente: Optional[str] = None
    posicao: Optional[str] = None
    numero_nf: Optional[str] = None

class BonusCreate(BonusBase):
    pass

class BonusUpdate(BaseModel):
    percentual: Optional[float] = None
    valor_bonus: Optional[float] = None
    cliente: Optional[str] = None
    posicao: Optional[str] = None
    numero_nf: Optional[str] = None

class BonusResponse(BonusBase):
    etapa: Optional[str] = None
    percentual: Optional[float] = None
    id: int
    nf_id: Optional[int] = None
    tipo: str = "comissao"
    atividades: List[str] = []
    liberado: bool = False
    pago: bool = False
    data_liberacao: Optional[date] = None
    data_pagamento: Optional[date] = None
    criado_em: datetime

    class Config:
        from_attributes = True

class BonusAcaoLoteRequest(BaseModel):
    ids: List[int]

class BonusAcaoLoteResponse(BaseModel):
    processados: int
    ignorados: int

# ==================== FÉRIAS ====================
class FeriasBase(BaseModel):
    colaborador_id: int
    ano: int
    dias_direito: int
    dias_tirados: int = 0

class FeriasCreate(FeriasBase):
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None

    @model_validator(mode="after")
    def intervalo_datas(self):
        from app.services.ferias_calculo import datas_validas
        if not datas_validas(self.data_inicio, self.data_fim):
            raise ValueError("A data fim não pode ser anterior à data início")
        return self

class FeriasUpdate(BaseModel):
    dias_direito: Optional[int] = None
    dias_tirados: Optional[int] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    aprovado: Optional[bool] = None

    @model_validator(mode="after")
    def intervalo_datas(self):
        from app.services.ferias_calculo import datas_validas
        if self.data_inicio is not None and self.data_fim is not None:
            if not datas_validas(self.data_inicio, self.data_fim):
                raise ValueError("A data fim não pode ser anterior à data início")
        return self

class FeriasResponse(FeriasBase):
    id: int
    data_inicio: Optional[date]
    data_fim: Optional[date]
    aprovado: bool
    criado_em: datetime

    class Config:
        from_attributes = True

# ==================== CONTAS A PAGAR ====================
class CategoriaOficialItem(BaseModel):
    codigo: str
    nome: str
    exige_subcategoria: bool


class CategoriaCadastradaItem(BaseModel):
    id: int
    codigo: str
    nome: str


class SubcategoriaRhItem(BaseModel):
    id: Optional[int] = None
    codigo: str
    nome: str
    sistema: bool = True


class CatalogoCategoriasContas(BaseModel):
    oficiais: List[CategoriaOficialItem]
    cadastradas: List[CategoriaCadastradaItem]
    subcategorias_rh: List[SubcategoriaRhItem]


class CategoriaCadastradaCreate(BaseModel):
    nome: str


class CategoriaCadastradaResponse(BaseModel):
    id: int
    codigo: str
    nome: str

    class Config:
        from_attributes = True


class SubcategoriaRhCreate(BaseModel):
    nome: str


class SubcategoriaRhResponse(BaseModel):
    id: int
    codigo: str
    nome: str
    sistema: bool

    class Config:
        from_attributes = True


class ContaPagarBase(BaseModel):
    descricao: str
    categoria: str
    subcategoria: Optional[str] = None
    valor: float = Field(..., gt=0)
    data_vencimento: Optional[date] = None

class ContaPagarCreate(ContaPagarBase):
    data_pagamento: Optional[date] = None
    fornecedor_id: Optional[int] = None
    caixa: Optional[str] = None
    tipo_despesa: Literal["fixo", "variavel"] = "variavel"

    @field_validator("tipo_despesa")
    @classmethod
    def validar_tipo_despesa_create(cls, v: str) -> str:
        if v not in ("fixo", "variavel"):
            raise ValueError("Tipo deve ser Fixo ou Variável")
        return v

class ContaPagarUpdate(BaseModel):
    descricao: Optional[str] = None
    categoria: Optional[str] = None
    subcategoria: Optional[str] = None
    valor: Optional[float] = Field(None, gt=0)
    data_vencimento: Optional[date] = None
    data_pagamento: Optional[date] = None
    pago: Optional[bool] = None
    fornecedor_id: Optional[int] = None
    caixa: Optional[str] = None
    tipo_despesa: Optional[Literal["fixo", "variavel"]] = None

    @field_validator("tipo_despesa")
    @classmethod
    def validar_tipo_despesa_update(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("fixo", "variavel"):
            raise ValueError("Tipo deve ser Fixo ou Variável")
        return v

class ContaPagarResponse(ContaPagarBase):
    id: int
    categoria_pendente: bool = False
    pago: bool
    data_pagamento: Optional[date]
    caixa: Optional[str] = None
    tipo_despesa: Literal["fixo", "variavel"] = "variavel"
    comprovante_nome: Optional[str] = None
    fornecedor_id: Optional[int] = None
    fornecedor_nome: Optional[str] = None
    fornecedor_ativo: Optional[bool] = None
    criado_em: datetime

    @model_validator(mode="before")
    @classmethod
    def anexar_fornecedor(cls, data):
        if hasattr(data, "__table__"):
            f = getattr(data, "fornecedor", None)
            payload = {col.name: getattr(data, col.name) for col in data.__table__.columns}
            payload["fornecedor_nome"] = f.nome if f else None
            payload["fornecedor_ativo"] = f.ativo if f else None
            return payload
        return data

    class Config:
        from_attributes = True


class ContasDatasLoteRequest(BaseModel):
    ids: List[int] = Field(..., min_length=1)
    data_vencimento: Optional[date] = None
    data_pagamento: Optional[date] = None


class ContasDatasLoteResponse(BaseModel):
    processados: int
    ignorados: int

# ==================== DH ====================
class DHBase(BaseModel):
    empresa: str
    posicao: str
    tipo_fechamento: str  # retainer | sucesso | parcelamento
    tipo_abertura_fechamento: Optional[str] = None  # legado; classificação oficial é só `tipo_fechamento`
    colaborador_preencheu: str

    @field_validator("tipo_fechamento")
    @classmethod
    def validar_tipo_fechamento(cls, v):
        return _tipo_oficial(v)

class DHCreate(DHBase):
    pass

class DHResponse(DHBase):
    id: int
    data_envio: datetime
    assunto: str
    enviado_financeiro: bool
    enviado_ceo: bool
    criado_em: datetime

    class Config:
        from_attributes = True

# ==================== CONFIGURAÇÕES / USUÁRIOS ====================
class UsuarioAppCreate(BaseModel):
    usuario: str
    senha: str
    papel: str = "visualizador"
    permissoes: Optional[str] = None  # JSON string

class UsuarioAppUpdate(BaseModel):
    senha: Optional[str] = None
    papel: Optional[str] = None
    permissoes: Optional[str] = None
    ativo: Optional[bool] = None

class UsuarioAppResponse(BaseModel):
    id: int
    usuario: str
    papel: str
    permissoes: Optional[str]
    ativo: bool
    criado_em: datetime

    class Config:
        from_attributes = True

class PaginasVisibilidadeResponse(BaseModel):
    paginas: dict[str, bool]

class PaginasVisibilidadeUpdate(BaseModel):
    paginas: dict[str, bool]

# ==================== CONTAS CORRENTES ====================
class ContaCorrenteCreate(BaseModel):
    nome: str
    banco: str
    agencia: Optional[str] = None
    numero: Optional[str] = None


class ContaCorrenteUpdate(BaseModel):
    nome: Optional[str] = None
    banco: Optional[str] = None
    agencia: Optional[str] = None
    numero: Optional[str] = None
    padrao: Optional[bool] = None
    ativo: Optional[bool] = None


class ContaCorrenteResponse(BaseModel):
    id: int
    codigo: str
    nome: str
    banco: str
    agencia: Optional[str] = None
    numero: Optional[str] = None
    padrao: bool
    ativo: bool

    class Config:
        from_attributes = True


# ==================== SALDO / FLUXO DE CAIXA ====================
class SaldoBase(BaseModel):
    mes: int = Field(..., ge=1, le=12)
    ano: int
    conta: str  # "corrente" | "investimento"
    saldo: float
    data_registro: date

class SaldoCreate(SaldoBase):
    pass

class SaldoUpdate(BaseModel):
    saldo: Optional[float] = None
    data_registro: Optional[date] = None

class SaldoResponse(SaldoBase):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True

# ==================== IMPOSTOS ====================
class ImpostoBase(BaseModel):
    mes: int = Field(..., ge=1, le=12)
    ano: int
    faturamento: float
    percentual_imposto: float
    valor_imposto: float

class ImpostoCreate(ImpostoBase):
    pass

class ImpostoUpdate(BaseModel):
    faturamento: Optional[float] = None
    percentual_imposto: Optional[float] = None
    valor_imposto: Optional[float] = None

class ImpostoResponse(ImpostoBase):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True

# ==================== PIPELINE DE RECEITA (Dashboard) ====================
class PipelineEstagioTotais(BaseModel):
    """Dual-base: valor/percentual espelham líquido (compat 056)."""
    valor_liquido: float = 0.0
    valor_bruto: float = 0.0
    contagem: int = 0
    percentual_liquido: Optional[float] = None
    percentual_bruto: Optional[float] = None
    # Compatível com clientes 056
    valor: float = 0.0
    percentual: Optional[float] = None


class PipelineReceitaResponse(BaseModel):
    ano: int
    mes: Optional[int] = None
    fechado: PipelineEstagioTotais
    a_faturar: PipelineEstagioTotais
    faturado_ag_pagamento: PipelineEstagioTotais
    recebido: PipelineEstagioTotais


# ==================== RECEITA POR CAIXA (Dashboard) ====================
class ReceitaCaixaTotais(BaseModel):
    valor_liquido: float = 0.0
    valor_bruto: float = 0.0
    contagem: int = 0


class ReceitaCaixaResponse(BaseModel):
    ano: int
    mes: Optional[int] = None
    recebido: ReceitaCaixaTotais
    impostos_recolhidos: float = 0.0
    a_receber: ReceitaCaixaTotais
    a_faturar: ReceitaCaixaTotais


# ==================== PREVISÃO DE RECEBÍVEIS (Dashboard) ====================
class AgingTotais(BaseModel):
    valor_liquido: float = 0.0
    valor_bruto: float = 0.0
    percentual_liquido: Optional[float] = None
    percentual_bruto: Optional[float] = None


class AgingRecebiveisResponse(BaseModel):
    referencia: date
    total_aberto: AgingTotais
    a_vencer_lt_30: AgingTotais
    d1_60: AgingTotais
    d60_90: AgingTotais
    d_mais_90: AgingTotais


# ==================== ALERTA DE FLUXO DE CAIXA ====================
class LimiarAlertaFluxoResponse(BaseModel):
    limiar_percentual: int = 60


class LimiarAlertaFluxoPut(BaseModel):
    limiar_percentual: int = Field(..., ge=1, le=100)

    @field_validator("limiar_percentual", mode="before")
    @classmethod
    def limiar_deve_ser_inteiro(cls, v):
        if isinstance(v, bool):
            raise ValueError("limiar_percentual deve ser um inteiro de 1 a 100")
        if isinstance(v, float):
            if not v.is_integer():
                raise ValueError("limiar_percentual deve ser um inteiro de 1 a 100")
            return int(v)
        if isinstance(v, str):
            s = v.strip().replace(",", ".")
            try:
                f = float(s)
            except ValueError as e:
                raise ValueError("limiar_percentual deve ser um inteiro de 1 a 100") from e
            if not f.is_integer():
                raise ValueError("limiar_percentual deve ser um inteiro de 1 a 100")
            return int(f)
        return v


class ProximoRecebimentoResponse(BaseModel):
    referencia: date
    encontrado: bool
    data_vencimento: Optional[date] = None
    valor_liquido: Optional[float] = None
    valor_bruto: Optional[float] = None
    nf_id: Optional[int] = None


# ==================== CONFIGURAÇÃO DO PERÍODO ====================
class ConfiguracaoPeriodoPut(BaseModel):
    mes: int = Field(..., ge=1, le=12)
    ano: int
    meta_liquida: float
    aliquota_periodo: float = Field(..., ge=0, lt=100)
    confirmar_atualizacao_massa: bool = False


class ConfiguracaoPeriodoResponse(BaseModel):
    mes: int
    ano: int
    meta_liquida: Optional[float] = None
    aliquota_periodo: Optional[float] = None
    meta_bruta: Optional[float] = None
    configurada: bool = False
    registros_afetaveis: int = 0
    registros_atualizados: Optional[int] = None


# ==================== RESPOSTAS GENÉRICAS ====================
class PaginatedResponse(BaseModel):
    total: int
    pagina: int
    tamanho_pagina: int
    dados: List

class MessageResponse(BaseModel):
    mensagem: str

class ErrorResponse(BaseModel):
    erro: str
    detalhes: Optional[str] = None
