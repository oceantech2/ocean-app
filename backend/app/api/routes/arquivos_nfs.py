from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from pathlib import Path
import shutil, uuid, os
from app.api.routes.auth import get_current_user

router = APIRouter()

PASTA = Path(os.getenv("NFS_DIR", "/app/nfs-docs"))
PASTA.mkdir(parents=True, exist_ok=True)

EXTENSOES_OK = {".pdf", ".xml", ".jpg", ".jpeg", ".png", ".xlsx", ".xls", ".docx", ".doc", ".zip"}


def _info(p: Path) -> dict:
    stat = p.stat()
    return {
        "nome": p.name,
        "tamanho": stat.st_size,
        "modificado": stat.st_mtime,
    }


@router.get("/")
def listar(current_user: str = Depends(get_current_user)):
    if not PASTA.exists():
        return {"arquivos": []}
    arquivos = sorted(
        [_info(f) for f in PASTA.iterdir() if f.is_file()],
        key=lambda x: x["modificado"],
        reverse=True,
    )
    return {"arquivos": arquivos}


@router.post("/upload")
def upload(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in EXTENSOES_OK:
        raise HTTPException(status_code=400, detail=f"Tipo não permitido: {ext}")
    PASTA.mkdir(parents=True, exist_ok=True)
    destino = PASTA / file.filename
    # Evita sobrescrever: adiciona sufixo único se já existir
    if destino.exists():
        stem = Path(file.filename).stem
        destino = PASTA / f"{stem}_{uuid.uuid4().hex[:6]}{ext}"
    with destino.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"nome": destino.name, "tamanho": destino.stat().st_size}


@router.get("/download/{nome}")
def download(nome: str, current_user: str = Depends(get_current_user)):
    path = PASTA / nome
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    return FileResponse(path, filename=nome)


@router.delete("/{nome}")
def deletar(nome: str, current_user: str = Depends(get_current_user)):
    path = PASTA / nome
    if not path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    path.unlink()
    return {"ok": True}
