import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models import DocumentoColaborador, Colaborador
from app.api.routes.auth import get_current_user
from app.services.audit import registrar_auditoria

router = APIRouter()


def _garantir_dir():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@router.get("/colaborador/{colaborador_id}")
def listar_documentos(
    colaborador_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    docs = (
        db.query(DocumentoColaborador)
        .filter(DocumentoColaborador.colaborador_id == colaborador_id)
        .order_by(DocumentoColaborador.criado_em.desc())
        .all()
    )
    return [
        {
            "id": d.id,
            "nome_original": d.nome_original,
            "tipo_mime": d.tipo_mime,
            "tamanho": d.tamanho,
            "criado_em": d.criado_em.isoformat() if d.criado_em else None,
        }
        for d in docs
    ]


@router.post("/colaborador/{colaborador_id}", status_code=status.HTTP_201_CREATED)
async def upload_documento(
    colaborador_id: int,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not colaborador:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")

    conteudo = await arquivo.read()
    tamanho = len(conteudo)
    if tamanho > settings.UPLOAD_MAX_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"Arquivo excede o limite de {settings.UPLOAD_MAX_MB} MB",
        )

    _garantir_dir()
    ext = os.path.splitext(arquivo.filename or "")[1]
    nome_fisico = f"{uuid.uuid4().hex}{ext}"
    caminho = os.path.join(settings.UPLOAD_DIR, nome_fisico)
    with open(caminho, "wb") as f:
        f.write(conteudo)

    doc = DocumentoColaborador(
        colaborador_id=colaborador_id,
        nome_original=arquivo.filename or nome_fisico,
        nome_arquivo=nome_fisico,
        tipo_mime=arquivo.content_type,
        tamanho=tamanho,
    )
    db.add(doc)
    registrar_auditoria(
        db, current_user, "criar", "DocumentoColaborador", colaborador_id,
        f"Upload '{arquivo.filename}' para {colaborador.nome}",
    )
    db.commit()
    db.refresh(doc)
    return {
        "id": doc.id,
        "nome_original": doc.nome_original,
        "tipo_mime": doc.tipo_mime,
        "tamanho": doc.tamanho,
        "criado_em": doc.criado_em.isoformat() if doc.criado_em else None,
    }


@router.get("/download/{documento_id}")
def baixar_documento(
    documento_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    doc = db.query(DocumentoColaborador).filter(DocumentoColaborador.id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    caminho = os.path.join(settings.UPLOAD_DIR, doc.nome_arquivo)
    if not os.path.exists(caminho):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado em disco")

    return FileResponse(
        caminho,
        media_type=doc.tipo_mime or "application/octet-stream",
        filename=doc.nome_original,
    )


@router.delete("/{documento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_documento(
    documento_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    doc = db.query(DocumentoColaborador).filter(DocumentoColaborador.id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    caminho = os.path.join(settings.UPLOAD_DIR, doc.nome_arquivo)
    if os.path.exists(caminho):
        try:
            os.remove(caminho)
        except OSError:
            pass

    registrar_auditoria(
        db, current_user, "deletar", "DocumentoColaborador", doc.colaborador_id,
        f"Removeu '{doc.nome_original}'",
    )
    db.delete(doc)
    db.commit()
    return None
