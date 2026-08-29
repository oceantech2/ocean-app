"""Serviço de envio de e-mail e geração de alertas.

Os alertas são calculados a partir do banco e enviados por SMTP.
Se as credenciais SMTP não estiverem configuradas, o envio é apenas logado
(modo "dry-run") — útil em desenvolvimento.
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.config import settings
from app.models import NF, ContaPagar, Ferias, Colaborador, StatusNF

logger = logging.getLogger("ocean.email")


def _destinatarios() -> list[str]:
    return [e.strip() for e in settings.ALERT_EMAILS.split(",") if e.strip()]


def enviar_email(assunto: str, corpo_html: str, para: list[str] | None = None) -> bool:
    """Envia um e-mail HTML. Retorna True se enviou, False se em dry-run/erro."""
    destinatarios = para or _destinatarios()
    if not destinatarios:
        logger.info("[email] Nenhum destinatário configurado (ALERT_EMAILS vazio).")
        return False

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info("[email DRY-RUN] Para: %s | Assunto: %s", destinatarios, assunto)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = assunto
    msg["From"] = settings.SENDER_EMAIL
    msg["To"] = ", ".join(destinatarios)
    msg.attach(MIMEText(corpo_html, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SENDER_EMAIL, destinatarios, msg.as_string())
        logger.info("[email] Enviado '%s' para %s", assunto, destinatarios)
        return True
    except Exception as e:
        logger.error("[email] Falha ao enviar: %s", e)
        return False


def coletar_alertas(db: Session) -> dict:
    """Coleta as três categorias de alerta a partir do banco."""
    hoje = date.today()
    limite = hoje + timedelta(days=settings.ALERT_DIAS_ANTECEDENCIA)

    # NFs a vencer (pendentes com vencimento entre hoje e o limite) + já vencidas
    nfs = (
        db.query(NF)
        .filter(NF.status != StatusNF.PAGA, NF.data_vencimento <= limite, NF.excluida_em.is_(None))
        .order_by(NF.data_vencimento)
        .all()
    )

    # Contas a pagar atrasadas ou a vencer
    contas = (
        db.query(ContaPagar)
        .filter(ContaPagar.pago == False, ContaPagar.data_vencimento <= limite)  # noqa: E712
        .order_by(ContaPagar.data_vencimento)
        .all()
    )

    # Férias com saldo acima do limite e não aprovadas
    ferias_q = db.query(Ferias).filter(Ferias.aprovado == False).all()  # noqa: E712
    ferias_alertas = []
    for f in ferias_q:
        saldo = (f.dias_direito or 0) - (f.dias_tirados or 0)
        if saldo >= settings.ALERT_FERIAS_LIMITE_DIAS:
            col = db.query(Colaborador).filter(Colaborador.id == f.colaborador_id).first()
            ferias_alertas.append({
                "colaborador": col.nome if col else f"ID {f.colaborador_id}",
                "ano": f.ano,
                "saldo": saldo,
            })

    return {
        "nfs": [
            {
                "numero": n.numero,
                "razao_social": n.razao_social,
                "valor_liquido": n.valor_liquido,
                "data_vencimento": str(n.data_vencimento),
                "vencida": n.data_vencimento < hoje,
            }
            for n in nfs
        ],
        "contas": [
            {
                "descricao": c.descricao,
                "valor": c.valor,
                "data_vencimento": str(c.data_vencimento),
                "vencida": c.data_vencimento < hoje,
            }
            for c in contas
        ],
        "ferias": ferias_alertas,
    }


def _linha_tabela(cols: list[str]) -> str:
    tds = "".join(f"<td style='padding:6px 10px;border-bottom:1px solid #eee'>{c}</td>" for c in cols)
    return f"<tr>{tds}</tr>"


def montar_corpo_html(alertas: dict) -> str:
    blocos = []

    if alertas["nfs"]:
        linhas = "".join(
            _linha_tabela([
                n["numero"], n["razao_social"],
                f"R$ {n['valor_liquido']:,.2f}", n["data_vencimento"],
                "<b style='color:#c00'>VENCIDA</b>" if n["vencida"] else "a vencer",
            ])
            for n in alertas["nfs"]
        )
        blocos.append(
            f"<h3>📄 NFs a vencer / vencidas ({len(alertas['nfs'])})</h3>"
            f"<table style='border-collapse:collapse;width:100%'>{linhas}</table>"
        )

    if alertas["contas"]:
        linhas = "".join(
            _linha_tabela([
                c["descricao"], f"R$ {c['valor']:,.2f}", c["data_vencimento"],
                "<b style='color:#c00'>VENCIDA</b>" if c["vencida"] else "a vencer",
            ])
            for c in alertas["contas"]
        )
        blocos.append(
            f"<h3>💸 Contas a pagar ({len(alertas['contas'])})</h3>"
            f"<table style='border-collapse:collapse;width:100%'>{linhas}</table>"
        )

    if alertas["ferias"]:
        linhas = "".join(
            _linha_tabela([f["colaborador"], str(f["ano"]), f"{f['saldo']} dias de saldo"])
            for f in alertas["ferias"]
        )
        blocos.append(
            f"<h3>🏖️ Férias acumuladas ({len(alertas['ferias'])})</h3>"
            f"<table style='border-collapse:collapse;width:100%'>{linhas}</table>"
        )

    if not blocos:
        return "<p>Nenhum alerta pendente. ✅</p>"

    return (
        "<div style='font-family:Arial,sans-serif;color:#333'>"
        "<h2>Ocean App — Alertas Financeiros</h2>"
        + "<hr>".join(blocos)
        + "</div>"
    )


def enviar_alertas(db: Session) -> dict:
    """Coleta alertas e dispara o e-mail. Retorna o resumo coletado."""
    alertas = coletar_alertas(db)
    total = len(alertas["nfs"]) + len(alertas["contas"]) + len(alertas["ferias"])
    if total > 0:
        corpo = montar_corpo_html(alertas)
        enviado = enviar_email(
            assunto=f"[Ocean App] {total} alerta(s) financeiro(s)",
            corpo_html=corpo,
        )
        alertas["email_enviado"] = enviado
    else:
        alertas["email_enviado"] = False
    alertas["total"] = total
    return alertas
