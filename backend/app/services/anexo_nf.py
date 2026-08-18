"""Validação e gravação de anexo de nota fiscal (PNG/JPEG/PDF, máx. 2 MiB)."""
from __future__ import annotations

import os
import uuid

from fastapi import HTTPException, status

from app.config import settings

MAX_BYTES = 2 * 1024 * 1024  # 2 MiB
EXTENSOES = {".pdf", ".jpg", ".jpeg", ".png"}
MEDIA_TYPE = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}
MSG_FORMATO = "Formato não permitido. Envie PDF, JPEG ou PNG."
MSG_TAMANHO = "Arquivo excede 2 MB"
MSG_VAZIO = "Arquivo vazio"


def extensao(nome: str | None) -> str:
    return os.path.splitext(nome or "")[1].lower()


def media_type(path: str, nome_original: str | None) -> str:
    ext = extensao(path) or extensao(nome_original)
    return MEDIA_TYPE.get(ext, "application/octet-stream")


def validar(nome: str | None, conteudo: bytes) -> str:
    ext = extensao(nome)
    if ext not in EXTENSOES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=MSG_FORMATO)
    if len(conteudo) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=MSG_VAZIO)
    if len(conteudo) > MAX_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=MSG_TAMANHO)
    return ext


def remover_arquivo(caminho: str | None) -> None:
    if caminho and os.path.exists(caminho):
        os.remove(caminho)


def gravar(prefixo: str, entidade_id: int, nome_original: str | None, conteudo: bytes, caminho_anterior: str | None) -> str:
    ext = validar(nome_original, conteudo)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    remover_arquivo(caminho_anterior)
    nome_disco = f"{prefixo}_{entidade_id}_{uuid.uuid4().hex}{ext}"
    caminho = os.path.join(settings.UPLOAD_DIR, nome_disco)
    with open(caminho, "wb") as f:
        f.write(conteudo)
    return caminho
