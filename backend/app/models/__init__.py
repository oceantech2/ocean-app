from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum, Text, Date
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
    tipo = Column(String(20), nullable=False, default="colaborador", index=True)
    tipo_documento = Column(String(4), nullable=False, default="cpf")
    documento = Column(String(14), nullable=False, index=True)
    nome = Column(String(255), nullable=False)
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
    caixa = Column(String(20), nullable=True)  # corrente | investimento | null
    origem = Column(String(20), nullable=False, default="maggo", server_default="maggo")  # manual | maggo

    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    colaborador_lead = relationship("Colaborador", foreign_keys=[colaborador_lead_id], back_populates="nfs_como_lead")
    colaborador_conducao = relationship("Colaborador", foreign_keys=[colaborador_conducao_id], back_populates="nfs_como_conducao")
    colaborador_placement = relationship("Colaborador", foreign_keys=[colaborador_placement_id], back_populates="nfs_como_placement")

# ==================== BÔNUS ====================
class Bonus(Base):
    __tablename__ = "bonus"

    id = Column(Integer, primary_key=True, index=True)
    colaborador_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=False)
    mes = Column(Integer, nullable=False)  # 1-12
    ano = Column(Integer, nullable=False)
    etapa = Column(String(50), nullable=False)  # "lead", "conducao", "placement"
    percentual = Column(Float, nullable=False)
    valor_bonus = Column(Float, nullable=False)
    cliente = Column(String(255), nullable=True)
    posicao = Column(String(100), nullable=True)
    numero_nf = Column(String(50), nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    colaborador = relationship("Colaborador", back_populates="bonus")

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
    categoria = Column(String(64), nullable=False, index=True)
    subcategoria = Column(String(64), nullable=True)
    categoria_pendente = Column(Boolean, default=False, nullable=False)
    valor = Column(Float, nullable=False)
    data_vencimento = Column(Date, nullable=True)
    data_pagamento = Column(Date, nullable=True)
    pago = Column(Boolean, default=False, index=True)
    comprovante_path = Column(Text, nullable=True)
    comprovante_nome = Column(String(255), nullable=True)
    fornecedor_id = Column(Integer, ForeignKey("colaboradores.id"), nullable=True, index=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fornecedor = relationship("Colaborador", back_populates="contas_pagar")

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
    conta = Column(String(20), nullable=False, default="corrente")  # corrente | investimento
    par_id = Column(String(36), nullable=True, index=True)  # UUID do par de transferência
    criado_em = Column(DateTime, default=datetime.utcnow)

# ==================== FLUXO DE CAIXA ====================
class Saldo(Base):
    __tablename__ = "saldos"
    
    id = Column(Integer, primary_key=True, index=True)
    mes = Column(Integer, nullable=False)
    ano = Column(Integer, nullable=False)
    conta = Column(String(50), nullable=False)  # "corrente", "investimento"
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
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
