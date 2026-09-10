"""Lógica compartilhada de limpeza de dados (CLI + endpoint dev)."""
from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional, Sequence, Set, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.models import (
    AuditLog,
    Bonus,
    CategoriaPagarCadastrada,
    Colaborador,
    ConfiguracaoApp,
    ContaCorrente,
    ContaPagar,
    DH,
    DocumentoColaborador,
    Ferias,
    FluxoMovimento,
    HistoricoColaborador,
    Imposto,
    MetaFinanceira,
    NF,
    Patrimonio,
    Saldo,
    SubcategoriaRhCadastrada,
    UsuarioApp,
    UsuarioAuth,
)

FRASE_CONFIRMACAO = "ZERAR DADOS OCEAN"


def ids_fornecedores_puros(db: Session) -> Set[int]:
    rows = (
        db.query(Colaborador.id)
        .filter(Colaborador.tipo == "fornecedor", Colaborador.elegivel_equipe.is_(False))
        .all()
    )
    return {r[0] for r in rows}


def baseline_counts(db: Session) -> dict:
    preservados = ids_fornecedores_puros(db)
    return {
        "usuarios_app": db.query(func.count(UsuarioApp.id)).scalar() or 0,
        "usuarios_auth": db.query(func.count(UsuarioAuth.id)).scalar() or 0,
        "fornecedores_puros": len(preservados),
        "colaboradores_total": db.query(func.count(Colaborador.id)).scalar() or 0,
        "nfs_contas_receber": db.query(func.count(NF.id)).scalar() or 0,
        "bonus": db.query(func.count(Bonus.id)).scalar() or 0,
        "ferias": db.query(func.count(Ferias.id)).scalar() or 0,
        "contas_pagar": db.query(func.count(ContaPagar.id)).scalar() or 0,
        "fluxo_movimentos": db.query(func.count(FluxoMovimento.id)).scalar() or 0,
        "saldos": db.query(func.count(Saldo.id)).scalar() or 0,
        "dhs": db.query(func.count(DH.id)).scalar() or 0,
        "impostos": db.query(func.count(Imposto.id)).scalar() or 0,
        "audit_logs": db.query(func.count(AuditLog.id)).scalar() or 0,
        "metas_financeiras": db.query(func.count(MetaFinanceira.id)).scalar() or 0,
        "patrimonio": db.query(func.count(Patrimonio.id)).scalar() or 0,
        "contas_correntes": db.query(func.count(ContaCorrente.id)).scalar() or 0,
        "configuracao_app": db.query(func.count(ConfiguracaoApp.id)).scalar() or 0,
        "categorias_pagar": db.query(func.count(CategoriaPagarCadastrada.id)).scalar() or 0,
        "subcategorias_rh": db.query(func.count(SubcategoriaRhCadastrada.id)).scalar() or 0,
        "historico_colaboradores": db.query(func.count(HistoricoColaborador.id)).scalar() or 0,
        "documentos_colaborador": db.query(func.count(DocumentoColaborador.id)).scalar() or 0,
    }


def _resolver_path(raw: Optional[str], upload_dir: str) -> Optional[str]:
    if not raw:
        return None
    p = Path(raw)
    if p.is_file():
        return str(p)
    candidato = Path(upload_dir) / raw
    if candidato.is_file():
        return str(candidato)
    if not p.is_absolute():
        return str(Path(upload_dir) / raw)
    return str(p)


def coletar_paths(db: Session, preservados: Set[int]) -> List[str]:
    paths: List[str] = []
    upload = settings.UPLOAD_DIR

    for (anexo,) in db.query(NF.anexo_path).filter(NF.anexo_path.isnot(None)).all():
        resolved = _resolver_path(anexo, upload)
        if resolved:
            paths.append(resolved)

    for (comp,) in db.query(ContaPagar.comprovante_path).filter(ContaPagar.comprovante_path.isnot(None)).all():
        resolved = _resolver_path(comp, upload)
        if resolved:
            paths.append(resolved)

    q_docs = db.query(DocumentoColaborador.nome_arquivo)
    if preservados:
        q_docs = q_docs.filter(~DocumentoColaborador.colaborador_id.in_(preservados))
    for (nome,) in q_docs.all():
        resolved = _resolver_path(nome, upload)
        if resolved:
            paths.append(resolved)

    for env_key, default in (("NFS_DIR", "/app/nfs-docs"), ("COMPROVANTES_DIR", "/app/comprovantes")):
        pasta = Path(os.getenv(env_key, default))
        if pasta.is_dir():
            for f in pasta.rglob("*"):
                if f.is_file():
                    paths.append(str(f))

    seen: Set[str] = set()
    unique: List[str] = []
    for p in paths:
        if p not in seen:
            seen.add(p)
            unique.append(p)
    return unique


def executar_deletes(db: Session, preservados: Set[int]) -> None:
    # Contas a receber = tabela nfs (inclui origem maggo/manual e soft-deleted)
    db.query(Bonus).delete(synchronize_session=False)
    db.query(NF).delete(synchronize_session=False)
    db.query(Ferias).delete(synchronize_session=False)
    db.query(ContaPagar).delete(synchronize_session=False)
    db.query(Patrimonio).delete(synchronize_session=False)

    if preservados:
        db.query(HistoricoColaborador).filter(
            ~HistoricoColaborador.colaborador_id.in_(preservados)
        ).delete(synchronize_session=False)
        db.query(DocumentoColaborador).filter(
            ~DocumentoColaborador.colaborador_id.in_(preservados)
        ).delete(synchronize_session=False)
        db.query(Colaborador).filter(~Colaborador.id.in_(preservados)).delete(
            synchronize_session=False
        )
    else:
        db.query(HistoricoColaborador).delete(synchronize_session=False)
        db.query(DocumentoColaborador).delete(synchronize_session=False)
        db.query(Colaborador).delete(synchronize_session=False)

    db.query(FluxoMovimento).delete(synchronize_session=False)
    db.query(Saldo).delete(synchronize_session=False)
    db.query(DH).delete(synchronize_session=False)
    db.query(Imposto).delete(synchronize_session=False)
    db.query(AuditLog).delete(synchronize_session=False)
    db.query(MetaFinanceira).delete(synchronize_session=False)
    db.query(CategoriaPagarCadastrada).delete(synchronize_session=False)
    db.query(SubcategoriaRhCadastrada).delete(synchronize_session=False)
    db.query(ContaCorrente).delete(synchronize_session=False)
    db.query(ConfiguracaoApp).delete(synchronize_session=False)
    db.flush()


def remover_arquivos(paths: Sequence[str]) -> List[str]:
    """Remove arquivos; retorna lista de avisos (falhas de FS)."""
    avisos: List[str] = []
    for p in paths:
        try:
            if os.path.isfile(p):
                os.remove(p)
        except OSError as exc:
            avisos.append(f"{p}: {exc}")
    return avisos


def zerar_dados(db: Session, *, fail_before_commit: bool = False) -> Tuple[dict, dict, List[str]]:
    """
    Executa a limpeza na sessão.
    Retorna (counts_antes, counts_depois, avisos_arquivos).
    Em falha: rollback e levanta a exceção.

    Após o wipe, grava flag maggo_stub_empty para o sync Maggo não recriar
    Contas a Receber na próxima listagem.
    """
    from app.services.maggo_stub import CHAVE_MAGGO_STUB_EMPTY

    counts_antes = baseline_counts(db)
    preservados = ids_fornecedores_puros(db)
    paths = coletar_paths(db, preservados)
    try:
        executar_deletes(db, preservados)
        if fail_before_commit:
            raise RuntimeError("Falha simulada (--fail-before-commit) para teste SC-007")
        # Impede re-seed do stub Maggo em Contas a Receber após limpeza
        db.add(ConfiguracaoApp(chave=CHAVE_MAGGO_STUB_EMPTY, valor="true"))
        db.commit()
    except Exception:
        db.rollback()
        raise

    avisos = remover_arquivos(paths)
    counts_depois = baseline_counts(db)
    return counts_antes, counts_depois, avisos
