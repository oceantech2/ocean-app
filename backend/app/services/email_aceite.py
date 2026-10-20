"""E-mails enviados quando o cliente aceita uma proposta na página pública.

O cliente recebe a confirmação no idioma da proposta; o consultor criador e os admins do
Proposal recebem um aviso em português. O PDF não é anexado: o link `?pdf=1` abre a
página pública já disparando o "Baixar PDF".
"""
import logging
from datetime import timezone
from html import escape
from typing import Optional

from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.database import SessionLocal
from app.models import Proposta, UsuarioApp
from app.services.acesso_proposal import email_liberavel, normalizar_email
from app.services.email import enviar_email
from app.services.proposta_modelos import MODELO_SIMPLES, nome_modelo
from app.services.propostas import TZ_SP

logger = logging.getLogger("ocean.email")

_AZUL = "#0b3a5b"


def links(p: Proposta) -> dict:
    base = settings.PROPOSAL_PUBLIC_URL.rstrip("/")
    return {
        "ver": f"{base}/p/{p.codigo}",
        "pdf": None if p.modelo == MODELO_SIMPLES else f"{base}/p/{p.codigo}?pdf=1",
        "proposal": f"{settings.consultant_panel_url()}/propostas/{p.id}",
    }


def _email_valido(valor: Optional[str]) -> Optional[str]:
    return normalizar_email(valor) if email_liberavel(valor) else None


def destinatarios(db: Session, p: Proposta) -> tuple[Optional[str], list[str]]:
    """(e-mail do cliente, e-mails internos sem duplicados e sem o do cliente)."""
    cliente = _email_valido(p.assinatura.email if p.assinatura else None)

    candidatos: list[Optional[str]] = []
    criador = db.get(UsuarioApp, p.criado_por_id) if p.criado_por_id else None
    candidatos.append(_email_valido(criador.usuario if criador else None) or _email_valido(p.consultor_email))
    admins = (
        db.query(UsuarioApp.usuario)
        .filter(
            UsuarioApp.papel == "admin",
            UsuarioApp.ativo.is_(True),
            UsuarioApp.acesso_proposal.is_(True),
        )
        .order_by(UsuarioApp.id)
        .all()
    )
    candidatos.extend(_email_valido(login) for (login,) in admins)

    internos: list[str] = []
    for email in candidatos:
        if email and email != cliente and email not in internos:
            internos.append(email)
    return cliente, internos


def _quando(p: Proposta, ingles: bool) -> str:
    assinada = p.assinatura.assinada_em if p.assinatura else p.assinada_em
    local = assinada.replace(tzinfo=timezone.utc).astimezone(TZ_SP)
    if ingles:
        return f"{local:%m/%d/%Y} at {local:%H:%M} (Brasília time)"
    return f"{local:%d/%m/%Y} às {local:%H:%M} (horário de Brasília)"


def _projetos(p: Proposta) -> list[str]:
    if p.projetos:
        return [str(item.get("nome") or "").strip() for item in p.projetos if str(item.get("nome") or "").strip()]
    return [p.projeto_nome] if p.projeto_nome else []


def _botao(texto: str, url: str, principal: bool = True) -> str:
    estilo = (
        f"background:{_AZUL};color:#ffffff;" if principal
        else f"background:#ffffff;color:{_AZUL};border:1px solid {_AZUL};"
    )
    return (
        f"<a href='{escape(url, quote=True)}' style='{estilo}display:inline-block;padding:10px 18px;"
        f"border-radius:6px;text-decoration:none;font-weight:bold;margin:4px 8px 4px 0'>{escape(texto)}</a>"
    )


def _layout(titulo: str, conteudo: str) -> str:
    return (
        "<div style='font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto'>"
        f"<div style='background:{_AZUL};color:#ffffff;padding:16px 20px;font-size:18px;font-weight:bold'>"
        f"{escape(titulo)}</div>"
        f"<div style='padding:20px;border:1px solid #e5e7eb;border-top:0'>{conteudo}</div>"
        "</div>"
    )


def montar_email_cliente(p: Proposta) -> tuple[str, str]:
    ingles = p.idioma == "en-US"
    a = p.assinatura
    lk = links(p)
    empresa = escape(p.cliente_nome)
    nome = escape(a.nome if a else "")
    quando = escape(_quando(p, ingles))

    if ingles:
        assunto = f"Proposal accepted — {p.cliente_nome}"
        texto = (
            f"<p>Hello, {nome}.</p>"
            f"<p>We confirm that the Ocean commercial proposal for <strong>{empresa}</strong> "
            f"was accepted on {quando}.</p>"
            "<p>You can review the proposal or download the PDF at any time:</p>"
        )
        botoes = _botao("View proposal", lk["ver"]) + (_botao("Download PDF", lk["pdf"], False) if lk["pdf"] else "")
        contato_rotulo, rodape = "Your consultant", "Thank you for choosing Ocean."
    else:
        assunto = f"Proposta aceita — {p.cliente_nome}"
        texto = (
            f"<p>Olá, {nome}.</p>"
            f"<p>Confirmamos o aceite da proposta comercial da Ocean para <strong>{empresa}</strong> "
            f"em {quando}.</p>"
            "<p>Você pode rever a proposta ou baixar o PDF quando quiser:</p>"
        )
        botoes = _botao("Ver proposta", lk["ver"]) + (_botao("Baixar PDF", lk["pdf"], False) if lk["pdf"] else "")
        contato_rotulo, rodape = "Seu consultor", "Obrigado por escolher a Ocean."

    contato = ""
    if p.consultor_nome:
        email_consultor = f" — {escape(p.consultor_email)}" if p.consultor_email else ""
        contato = f"<p>{contato_rotulo}: <strong>{escape(p.consultor_nome)}</strong>{email_consultor}</p>"

    corpo = f"{texto}<p>{botoes}</p>{contato}<p style='color:#6b7280'>{rodape}</p>"
    return assunto, _layout("Ocean", corpo)


def montar_email_interno(p: Proposta) -> tuple[str, str]:
    a = p.assinatura
    lk = links(p)
    linhas = [
        ("Empresa", p.cliente_nome),
        ("Modelo", nome_modelo(p.modelo)),
        ("Projeto(s)", ", ".join(_projetos(p)) or "—"),
        ("Aceita por", f"{a.nome} ({a.email})" if a else "—"),
        ("Data/hora", _quando(p, False)),
        ("Criada por", p.criado_por_usuario),
    ]
    tabela = "".join(
        f"<tr><td style='padding:6px 10px;color:#6b7280;white-space:nowrap'>{escape(rotulo)}</td>"
        f"<td style='padding:6px 10px'>{escape(str(valor or '—'))}</td></tr>"
        for rotulo, valor in linhas
    )
    botoes = (
        _botao("Abrir no Consultant Panel", lk["proposal"])
        + _botao("Ver proposta", lk["ver"], False)
        + (_botao("Baixar PDF", lk["pdf"], False) if lk["pdf"] else "")
    )
    corpo = (
        "<p>Uma proposta acabou de ser aceita pelo cliente.</p>"
        f"<table style='border-collapse:collapse;width:100%'>{tabela}</table>"
        f"<p style='margin-top:16px'>{botoes}</p>"
    )
    return f"[Consultant Panel] Proposta aceita — {p.cliente_nome}", _layout("Proposta aceita", corpo)


def enviar_emails_aceite(proposta_id: int) -> None:
    """Tarefa em segundo plano após o aceite; falhas só vão para o log."""
    try:
        with SessionLocal() as db:
            p = (
                db.query(Proposta)
                .options(joinedload(Proposta.assinatura))
                .filter(Proposta.id == proposta_id)
                .first()
            )
            if not p or not p.assinatura:
                return
            cliente, internos = destinatarios(db, p)
            if cliente:
                assunto, html = montar_email_cliente(p)
                enviar_email(assunto, html, [cliente])
            if internos:
                assunto, html = montar_email_interno(p)
                enviar_email(assunto, html, internos)
    except Exception:
        logger.exception("[email] Falha ao enviar e-mails de aceite da proposta %s", proposta_id)
