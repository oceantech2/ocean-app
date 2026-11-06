"""Formulário de contato do site sem login: vira um lead na planilha "Base de Relacionamento"."""
import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.leads import validar_contato, enviar_lead
from app.services.planilha_candidaturas import ErroPlanilha

router = APIRouter()
logger = logging.getLogger("ocean.planilha")

MSG_FALHA = "Não foi possível enviar agora. Tente novamente em instantes."


class ContatoIn(BaseModel):
    nome: str = ""
    email: str = ""
    telefone: str = ""
    linkedin: str = ""
    cargo: str = ""
    empresa: str = ""
    tipo: str = ""
    mensagem: str = ""
    site: str = ""


@router.post("/")
def enviar_contato(payload: ContatoIn):
    # Campo isca invisível para pessoas: preenchido indica robô; responde como sucesso sem enviar
    if payload.site.strip():
        return {"ok": True}
    dados = validar_contato(payload.model_dump(exclude={"site"}))
    try:
        enviar_lead(dados)
    except ErroPlanilha as exc:
        # Sem banco para o lead: o visitante precisa saber que não chegou, senão o contato se perde
        logger.error("Lead do site (%s) não enviado à planilha: %s", dados["email"], exc)
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=MSG_FALHA) from exc
    return {"ok": True}
