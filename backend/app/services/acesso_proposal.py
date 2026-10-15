"""Acesso ao Proposal (feature 088): tokens de uso único, liberação e revogação para fornecedores."""
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional

from passlib.context import CryptContext
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.models import Colaborador, PerfilConsultor, TokenAcesso, UsuarioApp
from app.services.documento import validar_email
from app.services.proposta_modelos import telefone_valido

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

TIPO_CONVITE = "convite"
TIPO_SSO = "sso"
VALIDADE = {TIPO_CONVITE: timedelta(days=7), TIPO_SSO: timedelta(seconds=120)}

STATUS_SEM_ACESSO = "sem_acesso"
STATUS_CONVITE_PENDENTE = "convite_pendente"
STATUS_CONVITE_EXPIRADO = "convite_expirado"
STATUS_ATIVO = "ativo"

MOTIVO_NAO_ENCONTRADO = "Fornecedor não encontrado"
MOTIVO_INATIVO = "Fornecedor inativo"
MOTIVO_SEM_EMAIL = "Fornecedor sem e-mail válido"
MOTIVO_JA_ATIVO = "Acesso já está ativo"
MOTIVO_EMAIL_OUTRO_FORNECEDOR = "E-mail já vinculado a outro fornecedor"


def normalizar_email(email: Optional[str]) -> str:
    return (email or "").strip().lower()


def normalizar_login(login: Optional[str]) -> str:
    """Login como gravado em usuarios_app: sem espaços nas pontas; e-mails em minúsculas."""
    valor = (login or "").strip()
    return valor.lower() if "@" in valor else valor


def email_liberavel(email: Optional[str]) -> bool:
    e = normalizar_email(email)
    return bool(e) and len(e) <= 100 and validar_email(e)


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def emitir_token(db: Session, usuario_id: int, tipo: str) -> tuple[str, datetime]:
    """Cria um token aleatório e grava só o hash. Devolve (token em claro, expira_em UTC)."""
    token = secrets.token_urlsafe(32)
    agora = datetime.utcnow()
    expira = agora + VALIDADE[tipo]
    db.add(TokenAcesso(
        usuario_id=usuario_id, tipo=tipo, token_hash=_hash(token), criado_em=agora, expira_em=expira,
    ))
    return token, expira


def _filtro_valido(tipo: str, agora: datetime):
    return (
        TokenAcesso.tipo == tipo,
        TokenAcesso.usado_em.is_(None),
        TokenAcesso.invalidado_em.is_(None),
        TokenAcesso.expira_em > agora,
    )


def consumir_token(db: Session, token: str, tipo: str) -> Optional[int]:
    """Marca o token como usado de forma atômica; devolve o usuario_id ou None se inválido."""
    if not token:
        return None
    agora = datetime.utcnow()
    linha = db.execute(
        update(TokenAcesso)
        .where(TokenAcesso.token_hash == _hash(token), *_filtro_valido(tipo, agora))
        .values(usado_em=agora)
        .returning(TokenAcesso.usuario_id)
        .execution_options(synchronize_session=False)
    ).first()
    return linha[0] if linha else None


def usuario_do_token(db: Session, token: str, tipo: str) -> Optional[int]:
    """Consulta sem consumir."""
    if not token:
        return None
    t = db.query(TokenAcesso).filter(
        TokenAcesso.token_hash == _hash(token), *_filtro_valido(tipo, datetime.utcnow())
    ).first()
    return t.usuario_id if t else None


def invalidar_convites(db: Session, usuario_id: int) -> None:
    agora = datetime.utcnow()
    db.execute(
        update(TokenAcesso)
        .where(TokenAcesso.usuario_id == usuario_id, *_filtro_valido(TIPO_CONVITE, agora))
        .values(invalidado_em=agora)
        .execution_options(synchronize_session=False)
    )


def gerar_convite(db: Session, usuario: UsuarioApp) -> tuple[str, datetime]:
    invalidar_convites(db, usuario.id)
    return emitir_token(db, usuario.id, TIPO_CONVITE)


def _prefill_perfil(db: Session, usuario_id: int, fornecedor: Colaborador) -> None:
    if db.get(PerfilConsultor, usuario_id) is not None:
        return
    telefone = (fornecedor.telefone or "").strip() or None
    if telefone and (not telefone_valido(telefone) or len(telefone) > 30):
        telefone = None
    db.add(PerfilConsultor(
        usuario_id=usuario_id,
        nome=(fornecedor.nome or "").strip()[:255] or None,
        cargo=(fornecedor.cargo or "").strip()[:255] or None,
        telefone=telefone,
        email=normalizar_email(fornecedor.email) or None,
    ))


def _resultado(fornecedor: Colaborador, resultado: str, **extra) -> dict:
    return {"fornecedor_id": fornecedor.id, "nome": fornecedor.nome, "resultado": resultado, **extra}


def _com_convite(db: Session, fornecedor: Colaborador, usuario: UsuarioApp) -> dict:
    token, expira = gerar_convite(db, usuario)
    return _resultado(fornecedor, "convite", usuario=usuario.usuario, token=token, expira_em=expira)


def liberar_fornecedor(db: Session, fornecedor_id: int) -> dict:
    """Libera o acesso ao Proposal de um fornecedor. Não faz commit."""
    fornecedor = db.query(Colaborador).filter(Colaborador.id == fornecedor_id).first()
    if not fornecedor:
        return {"fornecedor_id": fornecedor_id, "nome": None, "resultado": "ignorado", "motivo": MOTIVO_NAO_ENCONTRADO}
    if not fornecedor.ativo:
        return _resultado(fornecedor, "ignorado", motivo=MOTIVO_INATIVO)

    usuario = db.query(UsuarioApp).filter(UsuarioApp.fornecedor_id == fornecedor.id).first()
    if usuario:
        if usuario.acesso_proposal and usuario.ativo and not usuario.senha_pendente:
            return _resultado(fornecedor, "ignorado", usuario=usuario.usuario, motivo=MOTIVO_JA_ATIVO)
        usuario.acesso_proposal = True
        if not usuario.acesso_erp:
            usuario.ativo = True
        if usuario.senha_pendente:
            return _com_convite(db, fornecedor, usuario)
        return _resultado(fornecedor, "religado", usuario=usuario.usuario)

    if not email_liberavel(fornecedor.email):
        return _resultado(fornecedor, "ignorado", motivo=MOTIVO_SEM_EMAIL)
    email = normalizar_email(fornecedor.email)

    existente = db.query(UsuarioApp).filter(UsuarioApp.usuario == email).first()
    if existente:
        if existente.fornecedor_id is not None and existente.fornecedor_id != fornecedor.id:
            return _resultado(fornecedor, "ignorado", usuario=email, motivo=MOTIVO_EMAIL_OUTRO_FORNECEDOR)
        existente.fornecedor_id = fornecedor.id
        existente.acesso_proposal = True
        if existente.senha_pendente:
            return _com_convite(db, fornecedor, existente)
        return _resultado(fornecedor, "vinculado", usuario=existente.usuario)

    novo = UsuarioApp(
        usuario=email,
        senha_hash=pwd_context.hash(secrets.token_urlsafe(32)),
        papel="visualizador",
        permissoes=None,
        ativo=True,
        acesso_erp=False,
        acesso_proposal=True,
        senha_pendente=True,
        fornecedor_id=fornecedor.id,
    )
    db.add(novo)
    db.flush()
    _prefill_perfil(db, novo.id, fornecedor)
    return _com_convite(db, fornecedor, novo)


def revogar_acesso_fornecedor(db: Session, fornecedor_id: int) -> None:
    """Desliga o acesso ao Proposal do usuário vinculado e invalida convites. Não faz commit."""
    usuario = db.query(UsuarioApp).filter(UsuarioApp.fornecedor_id == fornecedor_id).first()
    if not usuario:
        return
    usuario.acesso_proposal = False
    invalidar_convites(db, usuario.id)


def status_acessos(db: Session) -> list[dict]:
    """Status de acesso ao Proposal de cada fornecedor com usuário vinculado."""
    usuarios = db.query(UsuarioApp).filter(UsuarioApp.fornecedor_id.isnot(None)).all()
    if not usuarios:
        return []
    agora = datetime.utcnow()
    convites = (
        db.query(TokenAcesso.usuario_id, TokenAcesso.expira_em)
        .filter(TokenAcesso.usuario_id.in_([u.id for u in usuarios]), *_filtro_valido(TIPO_CONVITE, agora))
        .all()
    )
    expira_por_usuario: dict[int, datetime] = {}
    for uid, expira in convites:
        if uid not in expira_por_usuario or expira > expira_por_usuario[uid]:
            expira_por_usuario[uid] = expira

    itens = []
    for u in usuarios:
        expira = expira_por_usuario.get(u.id)
        if not u.acesso_proposal or not u.ativo:
            status = STATUS_SEM_ACESSO
        elif u.senha_pendente:
            status = STATUS_CONVITE_PENDENTE if expira else STATUS_CONVITE_EXPIRADO
        else:
            status = STATUS_ATIVO
        itens.append({
            "fornecedor_id": u.fornecedor_id,
            "usuario_id": u.id,
            "usuario": u.usuario,
            "status": status,
            "convite_expira_em": expira if status != STATUS_SEM_ACESSO else None,
        })
    return itens
