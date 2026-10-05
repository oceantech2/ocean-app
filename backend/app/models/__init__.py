from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum, Text, Date,
    Numeric, CheckConstraint, Index, UniqueConstraint, SmallInteger, text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class TipoFechamento(str, enum.Enum):
    RETAINER = "retainer"
    SUCESSO = "sucesso"
    PARCELAMENTO = "parcelamento"

class StatusNF(str, enum.Enum):
    PAGA = "paga"
    PENDENTE = "pendente"
    VENCIDA = "vencida"
    CANCELADA = "cancelada"

# ==================== COLABORADORES ====================
class Colaborador(Base):
    __tablename__ = "colaboradores"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(20), nullable=False, default="fornecedor", index=True)
    elegivel_equipe = Column(Boolean, nullable=False, default=False, index=True)
    tipo_fornecedor = Column(String(10), nullable=False, default="fixo")
    tipo_documento = Column(String(4), nullable=False, default="cpf")
    documento = Column(String(14), nullable=False, index=True)
    nome = Column(String(255), nullable=False)
    pf_nome = Column(String(255), nullable=True)
    pf_cpf = Column(String(11), nullable=True, index=True)
    pf_endereco = Column(Text, nullable=True)
    pf_data_nascimento = Column(Date, nullable=True)
    cpf = Column(String(22), nullable=True, index=True)
    razao_social = Column(String(255), nullable=True)
    telefone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    cargo = Column(String(100), nullable=True)
    salario = Column(Float, nullable=True)
    data_nascimento = Column(Date, nullable=True)
    endereco_completo = Column(Text)
    cep = Column(String(10))
    data_admissao = Column(DateTime, default=datetime.utcnow)
    data_desligamento = Column(DateTime, nullable=True)
    ativo = Column(Boolean, default=True, index=True)
    observacao = Column(Text, nullable=True)
    beneficio = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    nfs_como_lead = relationship("NF", foreign_keys="NF.colaborador_lead_id", back_populates="colaborador_lead")
    nfs_como_conducao = relationship("NF", foreign_keys="NF.colaborador_conducao_id", back_populates="colaborador_conducao")
    nfs_como_placement = relationship("NF", foreign_keys="NF.colaborador_placement_id", back_populates="colaborador_placement")
    bonus = relationship("Bonus", back_populates="colaborador")
    ferias = relationship("Ferias", back_populates="colaborador")
    historico = relationship("HistoricoColaborador", back_populates="colaborador", order_by="HistoricoColaborador.data_inicio.desc()")
    patrimonio = relationship("Patrimonio", back_populates="colaborador")
    contas_pagar = relationship("ContaPagar", back_populates="fornecedor")


class HistoricoColaborador(Base):
    __tablename__ = "historico_colaboradores"

    id = Column(Integer, primary_key=True, index=True)
    colaborador_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=False, index=True)
    cargo = Column(String(100), nullable=False)
    salario = Column(Float, nullable=False)
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date, nullable=True)
    observacao = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    colaborador = relationship("Colaborador", back_populates="historico")


# ==================== NFs ====================
class NF(Base):
    __tablename__ = "nfs"

    id = Column(Integer, primary_key=True, index=True)
    maggo_id = Column(String(80), nullable=True, index=True)
    numero = Column(String(50), unique=True, nullable=True, index=True)
    razao_social = Column(String(255), nullable=False)
    posicao = Column(String(100))
    candidato = Column(String(255))
    valor_bruto = Column(Float, nullable=False)
    valor_imposto = Column(Float, nullable=True)
    aliquota_imposto = Column(Float, nullable=True)
    valor_liquido = Column(Float, nullable=False)
    data_ent_pgto = Column(Date, nullable=True)
    data_emissao = Column(Date, nullable=True, index=True)
    data_vencimento = Column(Date, nullable=True)
    data_pagamento = Column(Date, nullable=True)
    tipo = Column(Enum(TipoFechamento), nullable=False)
    tipo_abertura_fechamento = Column(String(20), nullable=True)
    status = Column(Enum(StatusNF), default=StatusNF.PENDENTE, index=True)
    
    colaborador_lead_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=True)
    colaborador_conducao_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=True)
    colaborador_placement_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=True)
    arquivada = Column(Boolean, default=False, nullable=False, server_default='false')
    caixa = Column(String(64), nullable=True)  # codigo conta corrente | investimento | null
    origem = Column(String(20), nullable=False, default="maggo", server_default="maggo")  # manual | maggo
    anexo_path = Column(Text, nullable=True)
    anexo_nome = Column(String(255), nullable=True)
    excluida_em = Column(DateTime, nullable=True, index=True)
    # Cancelamento/reativação decidido no Ocean; a importação de planilha não altera esse estado
    situacao_definida_ocean = Column(Boolean, default=False, nullable=False, server_default='false')

    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def revisar_cancelamento(self) -> bool:
        return self.status == StatusNF.CANCELADA and self.data_pagamento is not None
    
    # Relacionamentos
    colaborador_lead = relationship("Colaborador", foreign_keys=[colaborador_lead_id], back_populates="nfs_como_lead")
    colaborador_conducao = relationship("Colaborador", foreign_keys=[colaborador_conducao_id], back_populates="nfs_como_conducao")
    colaborador_placement = relationship("Colaborador", foreign_keys=[colaborador_placement_id], back_populates="nfs_como_placement")
    comissoes = relationship("Bonus", back_populates="nf")

# ==================== BÔNUS ====================
class Bonus(Base):
    __tablename__ = "bonus"

    id = Column(Integer, primary_key=True, index=True)
    colaborador_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=False)
    nf_id = Column(Integer, ForeignKey("nfs.id"), nullable=True, index=True)
    tipo = Column(String(20), nullable=False, default="comissao", index=True)  # comissao | bonus
    mes = Column(Integer, nullable=False)  # 1-12
    ano = Column(Integer, nullable=False)
    etapa = Column(String(50), nullable=True)  # legado; espelha 1ª atividade; NULL se tipo=bonus
    atividades = Column(Text, nullable=True)  # JSON array: lead, venda, conducao, placement
    percentual = Column(Float, nullable=True)  # NULL se tipo=bonus
    valor_bonus = Column(Float, nullable=False)
    liberado = Column(Boolean, default=False, nullable=False)
    pago = Column(Boolean, default=False, nullable=False)
    data_liberacao = Column(Date, nullable=True)
    data_pagamento = Column(Date, nullable=True)
    cliente = Column(String(255), nullable=True)
    posicao = Column(String(100), nullable=True)
    numero_nf = Column(String(50), nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    colaborador = relationship("Colaborador", back_populates="bonus")
    nf = relationship("NF", back_populates="comissoes")

# ==================== FÉRIAS ====================
class Ferias(Base):
    __tablename__ = "ferias"
    
    id = Column(Integer, primary_key=True, index=True)
    colaborador_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=False)
    ano = Column(Integer, nullable=False)
    dias_direito = Column(Integer, nullable=False)
    dias_tirados = Column(Integer, default=0)
    data_inicio = Column(Date, nullable=True)
    data_fim = Column(Date, nullable=True)
    aprovado = Column(Boolean, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    
    colaborador = relationship("Colaborador", back_populates="ferias")

# ==================== CONTAS A PAGAR ====================
class ContaPagar(Base):
    __tablename__ = "contas_pagar"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(255), nullable=False)
    categoria = Column(String(64), nullable=True, index=True)
    subcategoria = Column(String(64), nullable=True)
    categoria_pendente = Column(Boolean, default=False, nullable=False)
    valor = Column(Float, nullable=False)
    data_vencimento = Column(Date, nullable=True)
    data_pagamento = Column(Date, nullable=True)
    pago = Column(Boolean, default=False, index=True)
    caixa = Column(String(64), nullable=True)  # codigo conta corrente | null
    tipo_despesa = Column(String(20), nullable=False, default="variavel")
    comprovante_path = Column(Text, nullable=True)
    comprovante_nome = Column(String(255), nullable=True)
    fornecedor_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=True, index=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fornecedor = relationship("Colaborador", back_populates="contas_pagar")


class CategoriaPagarCadastrada(Base):
    __tablename__ = "categorias_pagar_cadastradas"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(64), unique=True, nullable=True, index=True)
    nome = Column(String(20), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    criado_por = Column(String(255), nullable=True)


class SubcategoriaRhCadastrada(Base):
    __tablename__ = "subcategorias_rh_cadastradas"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(64), unique=True, nullable=True, index=True)
    nome = Column(String(20), nullable=False)
    sistema = Column(Boolean, default=False, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    criado_por = Column(String(255), nullable=True)


# ==================== CONTAS CORRENTES ====================
class ContaCorrente(Base):
    __tablename__ = "contas_correntes"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(64), unique=True, nullable=False, index=True)
    nome = Column(String(80), nullable=False)
    banco = Column(String(80), nullable=False)
    agencia = Column(String(20), nullable=True)
    numero = Column(String(32), nullable=True)
    padrao = Column(Boolean, default=False, nullable=False)
    ativo = Column(Boolean, default=True, nullable=False, index=True)
    criado_em = Column(DateTime, default=datetime.utcnow)


# ==================== MOVIMENTOS MANUAIS DO FLUXO ====================
class FluxoMovimento(Base):
    __tablename__ = "fluxo_movimentos"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(10), nullable=False)  # "receita" | "despesa"
    descricao = Column(String(255), nullable=False)
    valor = Column(Float, nullable=False)
    data_movimento = Column(Date, nullable=False, index=True)
    mes = Column(Integer, nullable=False)
    ano = Column(Integer, nullable=False)
    conta = Column(String(64), nullable=False, default="corrente")  # codigo corrente | investimento
    par_id = Column(String(36), nullable=True, index=True)  # UUID do par de transferência
    criado_em = Column(DateTime, default=datetime.utcnow)

# ==================== FLUXO DE CAIXA ====================
class Saldo(Base):
    __tablename__ = "saldos"
    
    id = Column(Integer, primary_key=True, index=True)
    mes = Column(Integer, nullable=False)
    ano = Column(Integer, nullable=False)
    conta = Column(String(64), nullable=False)  # codigo corrente | investimento
    saldo = Column(Float, nullable=False)
    data_registro = Column(Date, nullable=False, index=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

# ==================== DH (Documento de Horas/Dados) ====================
class DH(Base):
    __tablename__ = "dhs"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa = Column(String(255), nullable=False)
    posicao = Column(String(255), nullable=False)
    tipo_fechamento = Column(Enum(TipoFechamento), nullable=False)
    tipo_abertura_fechamento = Column(String(50), nullable=True)  # "abertura" ou "fechamento" para retainer
    colaborador_preencheu = Column(String(255), nullable=False)  # Email
    data_envio = Column(DateTime, default=datetime.utcnow)
    assunto = Column(String(500))  # Gerado automaticamente
    enviado_financeiro = Column(Boolean, default=False)
    enviado_ceo = Column(Boolean, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

# ==================== IMPOSTOS ====================
class Imposto(Base):
    __tablename__ = "impostos"

    id = Column(Integer, primary_key=True, index=True)
    mes = Column(Integer, nullable=False)
    ano = Column(Integer, nullable=False)
    faturamento = Column(Float, nullable=False)
    percentual_imposto = Column(Float, nullable=False)
    valor_imposto = Column(Float, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

# ==================== LOG DE AUDITORIA ====================
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String(100), nullable=False, index=True)   # quem executou
    acao = Column(String(20), nullable=False)                   # criar | editar | deletar
    entidade = Column(String(50), nullable=False, index=True)   # "NF", "ContaPagar", etc.
    entidade_id = Column(Integer, nullable=True)                # id do registro afetado
    descricao = Column(String(500), nullable=True)              # resumo legível
    criado_em = Column(DateTime, default=datetime.utcnow, index=True)

# ==================== META FINANCEIRA ====================
class MetaFinanceira(Base):
    __tablename__ = "metas_financeiras"

    id = Column(Integer, primary_key=True, index=True)
    mes = Column(Integer, nullable=False)
    ano = Column(Integer, nullable=False)
    valor_meta = Column(Float, nullable=False)   # meta de faturamento líquido do mês
    aliquota_periodo = Column(Float, nullable=True)  # alíquota efetiva do mês (%); só meses 1–12
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==================== DOCUMENTOS DO COLABORADOR ====================
class DocumentoColaborador(Base):
    __tablename__ = "documentos_colaborador"

    id = Column(Integer, primary_key=True, index=True)
    colaborador_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=False, index=True)
    nome_original = Column(String(255), nullable=False)   # nome exibido ao usuário
    nome_arquivo = Column(String(255), nullable=False)    # nome físico em disco (uuid)
    tipo_mime = Column(String(100), nullable=True)
    tamanho = Column(Integer, nullable=True)              # bytes
    criado_em = Column(DateTime, default=datetime.utcnow)

# ==================== PATRIMÔNIO ====================
class Patrimonio(Base):
    __tablename__ = "patrimonio"

    id = Column(Integer, primary_key=True, index=True)
    colaborador_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=True, index=True)
    descricao = Column(String(255), nullable=False)
    tipo = Column(String(100), nullable=False)  # Notebook, Monitor, Cadeira, etc.
    numero_serie = Column(String(100), nullable=True)
    marca = Column(String(100), nullable=True)
    modelo = Column(String(100), nullable=True)
    valor_aquisicao = Column(Float, nullable=True)
    data_aquisicao = Column(Date, nullable=True)
    status = Column(String(50), default='ativo')  # ativo, em_manutencao, descartado
    observacao = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    colaborador = relationship("Colaborador", back_populates="patrimonio")

# ==================== AUTENTICAÇÃO 2FA ====================
class UsuarioAuth(Base):
    """Armazena o segredo TOTP por usuário (2FA opcional)."""
    __tablename__ = "usuarios_auth"

    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String(100), unique=True, nullable=False, index=True)
    totp_secret = Column(String(64), nullable=True)
    twofa_ativo = Column(Boolean, default=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

# ==================== USUÁRIOS DO APP ====================
class UsuarioApp(Base):
    """Usuários com acesso ao sistema (login, papel, permissões de menu)."""
    __tablename__ = "usuarios_app"

    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String(100), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    papel = Column(String(20), default="visualizador")  # "admin" | "visualizador"
    permissoes = Column(Text, nullable=True)  # JSON: {"dashboard":true,"nfs":false,...}
    ativo = Column(Boolean, default=True)
    acesso_erp = Column(Boolean, nullable=False, default=True, server_default=text("true"))
    acesso_proposal = Column(Boolean, nullable=False, default=False, server_default=text("false"))
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ==================== PROPOSAL ====================
CK_PROPOSTAS_CAMPOS_MODELO = (
    "(modelo = 'simples' AND cnpj IS NOT NULL AND valor IS NOT NULL AND total IS NOT NULL) "
    "OR (modelo <> 'simples' "
    "AND modelo_versao IS NOT NULL AND data_proposta IS NOT NULL AND setor IS NOT NULL "
    "AND consultor_nome IS NOT NULL AND consultor_cargo IS NOT NULL "
    "AND consultor_telefone IS NOT NULL AND consultor_email IS NOT NULL "
    "AND projeto_nome IS NOT NULL AND garantia_meses > 0 "
    "AND jsonb_typeof(investimentos) = 'array' "
    "AND jsonb_array_length(investimentos) BETWEEN 1 AND 3)"
)
CK_PROPOSTAS_DATA_VALIDADE = "data_proposta IS NULL OR data_proposta <= validade"
CK_PROPOSTAS_MOEDA = (
    "(modelo = 'simples' AND moeda IS NULL) "
    "OR (modelo <> 'simples' AND moeda IN ('BRL', 'USD'))"
)
CK_PROPOSTAS_ESCOPO = "projeto_escopo IS NULL OR modelo <> 'simples'"


class Proposta(Base):
    """Proposta comercial emitida no Proposal; editável até ser assinada ou cancelada.

    `modelo = 'simples'` são as propostas da feature 077 (CNPJ, valor e imposto); os demais
    modelos (ex.: `executive-search`) usam os campos do modelo e `investimentos`.
    """
    __tablename__ = "propostas"
    __table_args__ = (
        CheckConstraint(CK_PROPOSTAS_CAMPOS_MODELO, name="ck_propostas_campos_modelo"),
        CheckConstraint(CK_PROPOSTAS_DATA_VALIDADE, name="ck_propostas_data_validade"),
        CheckConstraint(CK_PROPOSTAS_MOEDA, name="ck_propostas_moeda"),
        CheckConstraint(CK_PROPOSTAS_ESCOPO, name="ck_propostas_escopo"),
        CheckConstraint("valor > 0", name="ck_propostas_valor_positivo"),
        CheckConstraint(
            "status IN ('aguardando','visualizada','assinada','cancelada')",
            name="ck_propostas_status",
        ),
        CheckConstraint(
            "(imposto_ativo AND aliquota > 0 AND aliquota < 100) "
            "OR (NOT imposto_ativo AND aliquota IS NULL)",
            name="ck_propostas_aliquota",
        ),
        Index("ix_propostas_criador_emitida", "criado_por_id", "emitida_em"),
    )

    id = Column(Integer, primary_key=True)
    codigo = Column(String(64), unique=True, nullable=False)
    cliente_nome = Column(String(255), nullable=False)  # "Empresa" nas propostas por modelo
    cnpj = Column(String(14), nullable=True)
    valor = Column(Numeric(14, 2), nullable=True)
    imposto_ativo = Column(Boolean, nullable=False, default=False)
    aliquota = Column(Numeric(5, 2), nullable=True)
    valor_imposto = Column(Numeric(14, 2), nullable=False, default=0)
    total = Column(Numeric(14, 2), nullable=True)
    emitida_em = Column(DateTime, nullable=False, default=datetime.utcnow)
    validade = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="aguardando", index=True)
    visualizada_em = Column(DateTime, nullable=True)
    assinada_em = Column(DateTime, nullable=True)
    cancelada_em = Column(DateTime, nullable=True)
    conteudo_hash = Column(String(64), nullable=False)
    criado_por_id = Column(Integer, ForeignKey("usuarios_app.id", ondelete="SET NULL"), nullable=True)
    criado_por_usuario = Column(String(255), nullable=False)
    versao = Column(Integer, nullable=False, default=1, server_default=text("1"))
    atualizada_em = Column(DateTime, nullable=True)
    versao_visualizada_em = Column(DateTime, nullable=True)
    modelo = Column(String(40), nullable=False, default="simples", server_default=text("'simples'"))
    modelo_versao = Column(Integer, nullable=True)
    data_proposta = Column(Date, nullable=True)
    setor = Column(String(40), nullable=True)
    consultor_nome = Column(String(255), nullable=True)
    consultor_cargo = Column(String(255), nullable=True)
    consultor_telefone = Column(String(30), nullable=True)
    consultor_email = Column(String(255), nullable=True)
    projeto_nome = Column(String(255), nullable=True)
    # HTML canônico restrito (p, ol, ul, li, strong, br) gerado por normalizar_escopo; NULL = sem escopo
    projeto_escopo = Column(Text, nullable=True)
    garantia_meses = Column(SmallInteger, nullable=True)
    investimentos = Column(JSONB, nullable=True)
    # BRL → página em português; USD → página em inglês. Nula nas propostas simples.
    moeda = Column(String(3), nullable=True)

    assinatura = relationship(
        "PropostaAssinatura", back_populates="proposta", uselist=False, passive_deletes=True
    )
    edicoes = relationship(
        "PropostaEdicao",
        back_populates="proposta",
        order_by="desc(PropostaEdicao.versao)",
        passive_deletes=True,
    )


class PropostaEdicao(Base):
    """Registro append-only de uma edição efetiva da proposta (campo anterior → novo)."""
    __tablename__ = "propostas_edicoes"
    __table_args__ = (
        UniqueConstraint("proposta_id", "versao", name="uq_propostas_edicoes_versao"),
        CheckConstraint(
            "jsonb_typeof(alteracoes) = 'array' AND jsonb_array_length(alteracoes) > 0",
            name="ck_propostas_edicoes_alteracoes",
        ),
    )

    id = Column(Integer, primary_key=True)
    proposta_id = Column(Integer, ForeignKey("propostas.id", ondelete="CASCADE"), nullable=False)
    versao = Column(Integer, nullable=False)
    editada_em = Column(DateTime, nullable=False, default=datetime.utcnow)
    editado_por_id = Column(Integer, ForeignKey("usuarios_app.id", ondelete="SET NULL"), nullable=True)
    editado_por_usuario = Column(String(255), nullable=False)
    alteracoes = Column(JSONB, nullable=False)

    proposta = relationship("Proposta", back_populates="edicoes")


class PropostaAssinatura(Base):
    """Aceite eletrônico de uma proposta, com as evidências do signatário."""
    __tablename__ = "propostas_assinaturas"

    id = Column(Integer, primary_key=True)
    proposta_id = Column(
        Integer, ForeignKey("propostas.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    nome = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    aceite = Column(Boolean, nullable=False)
    assinada_em = Column(DateTime, nullable=False, default=datetime.utcnow)
    ip = Column(String(64), nullable=False)
    user_agent = Column(String(500), nullable=True)
    conteudo_hash = Column(String(64), nullable=False)

    proposta = relationship("Proposta", back_populates="assinatura")


class PerfilConsultor(Base):
    """Dados de contato do usuário do Proposal que pré-preenchem o consultor das novas propostas."""
    __tablename__ = "proposal_perfis_consultor"

    usuario_id = Column(Integer, ForeignKey("usuarios_app.id", ondelete="CASCADE"), primary_key=True)
    nome = Column(String(255), nullable=True)
    cargo = Column(String(255), nullable=True)
    telefone = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    atualizado_em = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


# ==================== CONFIGURAÇÃO GLOBAL DO APP ====================
class ConfiguracaoApp(Base):
    """Configurações globais key-value (ex.: visibilidade de páginas)."""
    __tablename__ = "configuracao_app"

    id = Column(Integer, primary_key=True, index=True)
    chave = Column(String(64), unique=True, nullable=False, index=True)
    valor = Column(Text, nullable=False)
