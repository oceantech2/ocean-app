"""Validação e gravação de anexo de nota fiscal (PNG/JPEG/PDF, máx. 2 MiB).

Com SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY definidos, os arquivos vão para o
Supabase Storage e o caminho salvo no banco tem o prefixo `supabase:`. Sem eles,
os arquivos ficam em UPLOAD_DIR (desenvolvimento local / Docker com volume).
"""
from __future__ import annotations

import logging
import os
import uuid
from urllib.parse import quote

import httpx
from fastapi import HTTPException, Response, status

from app.config import settings

logger = logging.getLogger(__name__)

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
MSG_ARQUIVO_PERDIDO = "Arquivo não encontrado no servidor. Anexe o arquivo novamente."
MSG_STORAGE_INDISPONIVEL = "Não foi possível acessar o armazenamento de arquivos. Tente novamente."

PREFIXO_STORAGE = "supabase:"
_TIMEOUT = httpx.Timeout(30.0)


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


def usa_storage() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY)


def eh_storage(caminho: str | None) -> bool:
    return bool(caminho) and caminho.startswith(PREFIXO_STORAGE)


def _url_objeto(chave: str) -> str:
    base = settings.SUPABASE_URL.rstrip("/")
    return f"{base}/storage/v1/object/{settings.SUPABASE_STORAGE_BUCKET}/{chave}"


def _headers() -> dict:
    chave = settings.SUPABASE_SERVICE_ROLE_KEY
    return {"apikey": chave, "Authorization": f"Bearer {chave}"}


def _storage_upload(chave: str, conteudo: bytes, content_type: str) -> None:
    try:
        r = httpx.post(
            _url_objeto(chave),
            content=conteudo,
            headers={**_headers(), "Content-Type": content_type, "x-upsert": "false"},
            timeout=_TIMEOUT,
        )
    except httpx.HTTPError as exc:
        logger.error("Falha ao enviar %s ao Supabase Storage: %s", chave, exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=MSG_STORAGE_INDISPONIVEL)
    if r.status_code >= 400:
        logger.error("Supabase Storage recusou upload de %s: %s %s", chave, r.status_code, r.text)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=MSG_STORAGE_INDISPONIVEL)


def _storage_baixar(chave: str) -> bytes | None:
    try:
        r = httpx.get(_url_objeto(chave), headers=_headers(), timeout=_TIMEOUT)
    except httpx.HTTPError as exc:
        logger.error("Falha ao baixar %s do Supabase Storage: %s", chave, exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=MSG_STORAGE_INDISPONIVEL)
    # Objeto inexistente volta como 400 (corpo com statusCode 404) ou 404, conforme a versão do Storage.
    if r.status_code in (400, 404):
        return None
    if r.status_code >= 400:
        logger.error("Supabase Storage recusou download de %s: %s %s", chave, r.status_code, r.text)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=MSG_STORAGE_INDISPONIVEL)
    return r.content


def _storage_remover(chave: str) -> None:
    try:
        r = httpx.delete(_url_objeto(chave), headers=_headers(), timeout=_TIMEOUT)
        if r.status_code >= 400 and r.status_code not in (400, 404):
            logger.warning("Supabase Storage não removeu %s: %s %s", chave, r.status_code, r.text)
    except httpx.HTTPError as exc:
        logger.warning("Falha ao remover %s do Supabase Storage: %s", chave, exc)


def remover_arquivo(caminho: str | None) -> None:
    if not caminho:
        return
    if eh_storage(caminho):
        if usa_storage():
            _storage_remover(caminho[len(PREFIXO_STORAGE):])
        return
    if os.path.exists(caminho):
        os.remove(caminho)


def gravar(prefixo: str, entidade_id: int, nome_original: str | None, conteudo: bytes, caminho_anterior: str | None) -> str:
    ext = validar(nome_original, conteudo)
    nome_arquivo = f"{prefixo}_{entidade_id}_{uuid.uuid4().hex}{ext}"

    if usa_storage():
        chave = f"{prefixo}/{nome_arquivo}"
        _storage_upload(chave, conteudo, MEDIA_TYPE[ext])
        remover_arquivo(caminho_anterior)
        return f"{PREFIXO_STORAGE}{chave}"

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    remover_arquivo(caminho_anterior)
    caminho = os.path.join(settings.UPLOAD_DIR, nome_arquivo)
    with open(caminho, "wb") as f:
        f.write(conteudo)
    return caminho


def ler(caminho: str) -> bytes | None:
    if eh_storage(caminho):
        if not usa_storage():
            return None
        return _storage_baixar(caminho[len(PREFIXO_STORAGE):])
    if not os.path.exists(caminho):
        return None
    with open(caminho, "rb") as f:
        return f.read()


def _content_disposition(nome: str) -> str:
    nome_quoted = quote(nome)
    if nome_quoted != nome:
        return f"inline; filename*=utf-8''{nome_quoted}"
    return f'inline; filename="{nome}"'


def resposta_inline(caminho: str, nome_original: str | None, nome_padrao: str) -> Response:
    conteudo = ler(caminho)
    if conteudo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=MSG_ARQUIVO_PERDIDO)
    nome = nome_original or nome_padrao
    return Response(
        content=conteudo,
        media_type=media_type(caminho, nome_original),
        headers={"Content-Disposition": _content_disposition(nome)},
    )
