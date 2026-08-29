from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io
from datetime import datetime, date
from app.database import get_db
from app.models import Colaborador, Ferias
from app.schemas import ColaboradorCreate, ColaboradorResponse, ColaboradorUpdate
from app.api.routes.auth import get_current_user, require_admin
from app.services.audit import registrar_auditoria
from app.services import excel_io
from app.services import documento as doc

router = APIRouter()

TIPOS_FORNECEDOR = ("fixo", "spot")


def _validar_tipo_fornecedor(tipo_fornecedor: Optional[str]) -> str:
    tf = (tipo_fornecedor or "").strip().lower()
    if tf not in TIPOS_FORNECEDOR:
        raise HTTPException(status_code=400, detail="Tipo é obrigatório (Fixo ou Spot)")
    return tf


def _validar_pf_cnpj(
    pf_nome: Optional[str],
    pf_cpf: Optional[str],
    pf_endereco: Optional[str],
    pf_data_nascimento: Optional[date],
    obrigatorio: bool = True,
):
    if not obrigatorio:
        return None, None, None, None
    nome = (pf_nome or "").strip() or None
    endereco = (pf_endereco or "").strip() or None
    cpf_digits = doc.so_digitos(pf_cpf) if pf_cpf else ""
    if not nome or not endereco or not pf_data_nascimento or not cpf_digits:
        raise HTTPException(status_code=400, detail="Preencha os dados da pessoa física do CNPJ")
    if not doc.validar_cpf(cpf_digits):
        raise HTTPException(status_code=400, detail="CPF da pessoa física inválido")
    if pf_data_nascimento > date.today():
        raise HTTPException(status_code=400, detail="Data de nascimento da pessoa física inválida")
    return nome, cpf_digits, endereco, pf_data_nascimento


def _normalizar_cadastro(
    tipo_documento: str,
    documento_ou_cpf: Optional[str],
    razao_social: Optional[str],
    email: Optional[str],
    elegivel_equipe: bool,
    cargo,
    salario,
    data_nascimento,
    tipo_fornecedor: Optional[str],
    pf_nome=None,
    pf_cpf=None,
    pf_endereco=None,
    pf_data_nascimento=None,
    exigir_pf_cnpj: bool = True,
):
    tipo_fornecedor = _validar_tipo_fornecedor(tipo_fornecedor)
    tipo_documento = (tipo_documento or "cpf").strip().lower()
    if tipo_documento not in ("cpf", "cnpj"):
        raise HTTPException(status_code=400, detail="Tipo de documento inválido")
    if tipo_documento == "cpf":
        chave = doc.so_digitos(documento_ou_cpf)
        if not doc.validar_cpf(chave):
            raise HTTPException(status_code=400, detail="CPF inválido")
        razao = None
        pf_out = (None, None, None, None)
    else:
        chave = doc.normalizar_cnpj(documento_ou_cpf)
        if not doc.validar_cnpj(chave):
            raise HTTPException(status_code=400, detail="CNPJ inválido")
        razao = (razao_social or "").strip() or None
        if not razao:
            raise HTTPException(status_code=400, detail="Razão Social é obrigatória para CNPJ")
        pf_out = _validar_pf_cnpj(pf_nome, pf_cpf, pf_endereco, pf_data_nascimento, obrigatorio=exigir_pf_cnpj)
    if not doc.validar_email(email):
        raise HTTPException(status_code=400, detail="E-mail inválido")
    if elegivel_equipe and tipo_documento == "cpf":
        if not cargo or salario is None or not data_nascimento:
            raise HTTPException(status_code=400, detail="Preencha os campos obrigatórios de equipe")
    return tipo_documento, chave, razao, (email.strip() if email else None), tipo_fornecedor, pf_out


def _checar_duplicidade(db: Session, documento: str, excluir_id: Optional[int] = None):
    q = db.query(Colaborador).filter(
        Colaborador.documento == documento,
        Colaborador.ativo.is_(True),
    )
    if excluir_id is not None:
        q = q.filter(Colaborador.id != excluir_id)
    if q.first():
        raise HTTPException(status_code=400, detail="Documento já está em uso neste cadastro")


def _checar_pf_duplicidade(db: Session, pf_cpf: Optional[str], excluir_id: Optional[int] = None):
    if not pf_cpf:
        return
    q = db.query(Colaborador).filter(
        Colaborador.pf_cpf == pf_cpf,
        Colaborador.ativo.is_(True),
    )
    if excluir_id is not None:
        q = q.filter(Colaborador.id != excluir_id)
    if q.first():
        raise HTTPException(status_code=400, detail="CPF da pessoa física já está em uso")


@router.get("/", response_model=List[ColaboradorResponse])
def listar_colaboradores(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    ativo: bool = Query(None),
    tipo: str = Query(None),
    elegivel_equipe: bool = Query(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    query = db.query(Colaborador).filter(Colaborador.tipo == "fornecedor")
    if tipo == "colaborador":
        query = query.filter(Colaborador.elegivel_equipe.is_(True))
    elif tipo == "fornecedor" and elegivel_equipe is None:
        pass
    if elegivel_equipe is not None:
        query = query.filter(Colaborador.elegivel_equipe == elegivel_equipe)
    if ativo is not None:
        query = query.filter(Colaborador.ativo == ativo)
    return query.offset(skip).limit(limit).all()


@router.post("/importar-xlsx")
def importar_colaboradores_xlsx(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    conteudo = file.file.read()
    try:
        registros = excel_io.parse_colaboradores_xlsx(conteudo)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    ok = 0
    erros: list[str] = []

    for reg in registros:
        linha = reg["_linha"]
        try:
            if not reg.get("nome"):
                erros.append(f"Linha {linha}: Nome vazio, ignorada")
                continue
            if not reg.get("cpf"):
                erros.append(f"Linha {linha}: CPF vazio, ignorada")
                continue

            tem_rh = (
                reg.get("cargo") is not None
                and reg.get("salario") is not None
                and reg.get("data_nascimento") is not None
            )
            if tem_rh:
                if reg.get("cargo") is None:
                    erros.append(f"Linha {linha}: Posição/cargo vazio, ignorada")
                    continue
                if reg.get("salario") is None:
                    erros.append(f"Linha {linha}: Salário inválido, ignorada")
                    continue
                if reg.get("data_nascimento") is None:
                    erros.append(f"Linha {linha}: Nascimento inválido, ignorada")
                    continue

            digitos = doc.so_digitos(reg["cpf"])
            tf = (reg.get("tipo_fornecedor") or "fixo").strip().lower()
            if tf not in TIPOS_FORNECEDOR:
                tf = "fixo"

            db_colab = db.query(Colaborador).filter(Colaborador.documento == digitos).first()
            if not db_colab:
                db_colab = db.query(Colaborador).filter(Colaborador.cpf == reg["cpf"]).first()

            if db_colab:
                db_colab.nome = reg["nome"]
                db_colab.tipo = "fornecedor"
                db_colab.tipo_fornecedor = tf
                db_colab.elegivel_equipe = tem_rh
                if tem_rh:
                    db_colab.cargo = reg["cargo"]
                    db_colab.salario = reg["salario"]
                    db_colab.data_nascimento = reg["data_nascimento"]
                db_colab.endereco_completo = reg.get("endereco_completo")
                db_colab.tipo_documento = "cpf"
                db_colab.documento = digitos
                db_colab.cpf = doc.formatar_cpf(digitos)
                if reg.get("data_admissao"):
                    db_colab.data_admissao = reg["data_admissao"]
                if reg.get("data_desligamento"):
                    db_colab.data_desligamento = reg["data_desligamento"]
            else:
                db_colab = Colaborador(
                    tipo="fornecedor",
                    tipo_fornecedor=tf,
                    elegivel_equipe=tem_rh,
                    tipo_documento="cpf",
                    documento=digitos,
                    nome=reg["nome"],
                    cpf=doc.formatar_cpf(digitos),
                    cargo=reg["cargo"] if tem_rh else None,
                    salario=reg["salario"] if tem_rh else None,
                    data_nascimento=reg["data_nascimento"] if tem_rh else None,
                    endereco_completo=reg.get("endereco_completo"),
                    data_admissao=reg.get("data_admissao"),
                    data_desligamento=reg.get("data_desligamento"),
                )
                db.add(db_colab)
                db.flush()

            for f in reg.get("ferias", []):
                ja_existe = db.query(Ferias).filter(
                    Ferias.colaborador_id == db_colab.id,
                    Ferias.data_inicio == f["data_inicio"],
                    Ferias.data_fim == f["data_fim"],
                ).first()
                if ja_existe:
                    continue
                db.add(Ferias(
                    colaborador_id=db_colab.id,
                    ano=f["ano"],
                    dias_direito=f["dias_direito"],
                    dias_tirados=f["dias_tirados"],
                    data_inicio=f["data_inicio"],
                    data_fim=f["data_fim"],
                    aprovado=True,
                ))

            ok += 1
        except Exception as e:
            erros.append(f"Linha {linha}: erro inesperado — {e}")

    registrar_auditoria(db, current_user, "criar", "Colaborador", None, f"Importação xlsx: {ok} fornecedores processados, {len(erros)} avisos/erros")
    db.commit()

    return {"ok": ok, "erros": erros}


@router.get("/exportar-xlsx")
def exportar_colaboradores_xlsx(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    colaboradores = (
        db.query(Colaborador)
        .filter(Colaborador.elegivel_equipe.is_(True))
        .order_by(Colaborador.nome)
        .all()
    )

    dados = []
    for c in colaboradores:
        ferias_ordenadas = sorted(
            [f for f in c.ferias if f.data_inicio and f.data_fim],
            key=lambda f: f.data_inicio,
        )[:5]
        dados.append({
            "nome": c.nome,
            "cpf": c.cpf or doc.formatar_cpf(c.documento),
            "cargo": c.cargo,
            "salario": c.salario,
            "data_nascimento": c.data_nascimento,
            "endereco_completo": c.endereco_completo,
            "data_admissao": c.data_admissao,
            "data_desligamento": c.data_desligamento,
            "tipo_fornecedor": c.tipo_fornecedor,
            "ferias": [
                {"data_inicio": f.data_inicio, "data_fim": f.data_fim, "dias_tirados": f.dias_tirados}
                for f in ferias_ordenadas
            ],
        })

    conteudo = excel_io.preencher_template_colaboradores(dados)

    return StreamingResponse(
        io.BytesIO(conteudo),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=fornecedores_ocean.xlsx"},
    )


@router.get("/{colaborador_id}", response_model=ColaboradorResponse)
def obter_colaborador(
    colaborador_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not colaborador:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fornecedor não encontrado")
    return colaborador


@router.post("/", response_model=ColaboradorResponse, status_code=status.HTTP_201_CREATED)
def criar_colaborador(
    colaborador: ColaboradorCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    bruto = colaborador.documento or colaborador.cpf
    tipo_documento, digitos, razao, email, tipo_fornecedor, pf_out = _normalizar_cadastro(
        colaborador.tipo_documento or "cpf",
        bruto,
        colaborador.razao_social,
        colaborador.email,
        False,
        None,
        None,
        None,
        colaborador.tipo_fornecedor,
        colaborador.pf_nome,
        colaborador.pf_cpf,
        colaborador.pf_endereco,
        colaborador.pf_data_nascimento,
        exigir_pf_cnpj=True,
    )
    _checar_duplicidade(db, digitos)
    _checar_pf_duplicidade(db, pf_out[1])

    dados = colaborador.dict()
    if dados.get("data_admissao") is None:
        dados.pop("data_admissao", None)
    dados["tipo"] = "fornecedor"
    dados["elegivel_equipe"] = False
    dados["tipo_fornecedor"] = tipo_fornecedor
    dados["tipo_documento"] = tipo_documento
    dados["documento"] = digitos
    dados["cpf"] = doc.formatar_documento(tipo_documento, digitos)
    dados["razao_social"] = razao
    dados["email"] = email
    dados["telefone"] = (colaborador.telefone or "").strip() or None
    dados["pf_nome"], dados["pf_cpf"], dados["pf_endereco"], dados["pf_data_nascimento"] = pf_out
    dados["cargo"] = None
    dados["salario"] = None
    dados["data_nascimento"] = None
    dados["beneficio"] = None
    novo_colaborador = Colaborador(**dados)
    db.add(novo_colaborador)
    db.flush()
    registrar_auditoria(db, current_user, "criar", "Colaborador", novo_colaborador.id, f"{novo_colaborador.nome} — fornecedor")
    db.commit()
    db.refresh(novo_colaborador)
    return novo_colaborador


@router.put("/{colaborador_id}", response_model=ColaboradorResponse)
def atualizar_colaborador(
    colaborador_id: int,
    colaborador_update: ColaboradorUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db_colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not db_colaborador:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fornecedor não encontrado")

    dados_atualizacao = colaborador_update.dict(exclude_unset=True)
    if "tipo" in dados_atualizacao and dados_atualizacao["tipo"] != db_colaborador.tipo:
        raise HTTPException(status_code=400, detail="Não é permitido alterar o tipo do cadastro")
    dados_atualizacao.pop("tipo", None)
    if "elegivel_equipe" in dados_atualizacao and dados_atualizacao["elegivel_equipe"] != db_colaborador.elegivel_equipe:
        raise HTTPException(status_code=400, detail="Não é permitido alterar elegibilidade de equipe")
    dados_atualizacao.pop("elegivel_equipe", None)

    if not db_colaborador.elegivel_equipe:
        for k in ("cargo", "salario", "data_nascimento", "beneficio", "data_admissao", "data_desligamento"):
            dados_atualizacao.pop(k, None)

    tipo_documento = dados_atualizacao.get("tipo_documento", db_colaborador.tipo_documento)
    bruto = dados_atualizacao.get("documento") or dados_atualizacao.get("cpf") or db_colaborador.documento
    razao_in = dados_atualizacao.get("razao_social", db_colaborador.razao_social)
    email_in = dados_atualizacao["email"] if "email" in dados_atualizacao else db_colaborador.email
    tf_in = dados_atualizacao.get("tipo_fornecedor", db_colaborador.tipo_fornecedor)

    pf_nome_in = dados_atualizacao.get("pf_nome", db_colaborador.pf_nome)
    pf_cpf_in = dados_atualizacao.get("pf_cpf", db_colaborador.pf_cpf)
    pf_end_in = dados_atualizacao.get("pf_endereco", db_colaborador.pf_endereco)
    pf_dn_in = dados_atualizacao.get("pf_data_nascimento", db_colaborador.pf_data_nascimento)

    precisa_validar = any(
        k in dados_atualizacao
        for k in (
            "tipo_documento", "documento", "cpf", "razao_social", "cargo", "salario",
            "data_nascimento", "tipo_fornecedor", "pf_nome", "pf_cpf", "pf_endereco", "pf_data_nascimento",
        )
    )
    if precisa_validar:
        exigir_pf = tipo_documento == "cnpj"
        tipo_documento, digitos, razao, email, tipo_fornecedor, pf_out = _normalizar_cadastro(
            tipo_documento,
            bruto,
            razao_in,
            email_in,
            db_colaborador.elegivel_equipe,
            dados_atualizacao.get("cargo", db_colaborador.cargo),
            dados_atualizacao.get("salario", db_colaborador.salario),
            dados_atualizacao.get("data_nascimento", db_colaborador.data_nascimento),
            tf_in,
            pf_nome_in,
            pf_cpf_in,
            pf_end_in,
            pf_dn_in,
            exigir_pf_cnpj=exigir_pf,
        )
        _checar_duplicidade(db, digitos, excluir_id=db_colaborador.id)
        _checar_pf_duplicidade(db, pf_out[1], excluir_id=db_colaborador.id)
        dados_atualizacao["tipo_documento"] = tipo_documento
        dados_atualizacao["documento"] = digitos
        dados_atualizacao["cpf"] = doc.formatar_documento(tipo_documento, digitos)
        dados_atualizacao["razao_social"] = razao
        dados_atualizacao["tipo_fornecedor"] = tipo_fornecedor
        dados_atualizacao["pf_nome"], dados_atualizacao["pf_cpf"], dados_atualizacao["pf_endereco"], dados_atualizacao["pf_data_nascimento"] = pf_out
        if tipo_documento == "cpf":
            dados_atualizacao["pf_nome"] = None
            dados_atualizacao["pf_cpf"] = None
            dados_atualizacao["pf_endereco"] = None
            dados_atualizacao["pf_data_nascimento"] = None
        if "email" in dados_atualizacao:
            dados_atualizacao["email"] = email
    elif "tipo_fornecedor" in dados_atualizacao:
        dados_atualizacao["tipo_fornecedor"] = _validar_tipo_fornecedor(dados_atualizacao["tipo_fornecedor"])

    if "telefone" in dados_atualizacao:
        dados_atualizacao["telefone"] = (dados_atualizacao["telefone"] or "").strip() or None
    if "email" in dados_atualizacao and dados_atualizacao["email"]:
        if not doc.validar_email(dados_atualizacao["email"]):
            raise HTTPException(status_code=400, detail="E-mail inválido")
        dados_atualizacao["email"] = dados_atualizacao["email"].strip() or None

    for campo, valor in dados_atualizacao.items():
        setattr(db_colaborador, campo, valor)

    reativando = dados_atualizacao.get("ativo") is True
    desc = "reativou" if reativando else f"campos: {', '.join(dados_atualizacao.keys())}"
    registrar_auditoria(db, current_user, "editar", "Colaborador", db_colaborador.id, f"{db_colaborador.nome} — {desc}")
    db.commit()
    db.refresh(db_colaborador)
    return db_colaborador


@router.delete("/{colaborador_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_colaborador(
    colaborador_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db_colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not db_colaborador:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fornecedor não encontrado")

    db_colaborador.ativo = False
    if db_colaborador.elegivel_equipe:
        db_colaborador.data_desligamento = datetime.utcnow()
    registrar_auditoria(db, current_user, "deletar", "Colaborador", db_colaborador.id, f"Desativou {db_colaborador.nome}")
    db.commit()
    return None


@router.delete("/{colaborador_id}/permanente", status_code=status.HTTP_204_NO_CONTENT)
def excluir_colaborador_permanente(
    colaborador_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_admin),
):
    db_colaborador = db.query(Colaborador).filter(Colaborador.id == colaborador_id).first()
    if not db_colaborador:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fornecedor não encontrado")

    nome = db_colaborador.nome
    registrar_auditoria(db, current_user, "deletar", "Colaborador", colaborador_id, f"Exclusão permanente: {nome}")
    db.delete(db_colaborador)
    db.commit()
    return None
