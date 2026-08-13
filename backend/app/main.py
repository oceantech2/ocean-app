from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import asyncio
import logging
import uvicorn
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api.routes import (
    auth, colaboradores, nfs, contas, bonus, ferias, dh, relatorios,
    auditoria, metas, documentos, alertas, configuracoes
)
from app.api.routes import saldos, impostos, historico, fluxo_movimentos, patrimonio
from app.api.routes import arquivos_nfs, arquivos_comprovantes

# Criar tabelas
Base.metadata.create_all(bind=engine)

# Migrações inline — adiciona colunas/valores sem recriar tabelas
def _migrar():
    from sqlalchemy import text

    # ALTER TABLE roda normalmente dentro de transação
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS observacao TEXT"))
            conn.execute(text("ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS beneficio TEXT"))
            conn.execute(text("ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS cep VARCHAR(10)"))
            conn.execute(text("ALTER TABLE nfs ADD COLUMN IF NOT EXISTS arquivada BOOLEAN NOT NULL DEFAULT FALSE"))
            conn.execute(text("ALTER TABLE nfs ADD COLUMN IF NOT EXISTS caixa VARCHAR(20)"))
            conn.execute(text("ALTER TABLE nfs ADD COLUMN IF NOT EXISTS origem VARCHAR(20)"))
            conn.execute(text("UPDATE nfs SET origem = 'maggo' WHERE origem IS NULL"))
            conn.execute(text("ALTER TABLE nfs ALTER COLUMN numero DROP NOT NULL"))
            conn.execute(text("ALTER TABLE nfs ADD COLUMN IF NOT EXISTS maggo_id VARCHAR(80)"))
            conn.execute(text("ALTER TABLE nfs ADD COLUMN IF NOT EXISTS valor_imposto FLOAT"))
            conn.execute(text("ALTER TABLE nfs ADD COLUMN IF NOT EXISTS data_ent_pgto DATE"))
            conn.execute(text("ALTER TABLE nfs ALTER COLUMN data_emissao DROP NOT NULL"))
            conn.execute(text("ALTER TABLE nfs ALTER COLUMN data_vencimento DROP NOT NULL"))
            conn.execute(text(
                "UPDATE nfs SET maggo_id = numero "
                "WHERE origem = 'maggo' AND maggo_id IS NULL AND numero IS NOT NULL"
            ))
            conn.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS ix_nfs_maggo_id "
                "ON nfs (maggo_id) WHERE maggo_id IS NOT NULL"
            ))
            conn.execute(text("ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS comprovante_path TEXT"))
            conn.execute(text("ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS comprovante_nome VARCHAR(255)"))
            conn.execute(text("ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS categoria VARCHAR(64)"))
            conn.execute(text("ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS subcategoria VARCHAR(64)"))
            conn.execute(text(
                "ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS categoria_pendente BOOLEAN NOT NULL DEFAULT FALSE"
            ))
            conn.commit()
        except Exception:
            conn.rollback()

    # Migração centro_custo → categoria / subcategoria / categoria_pendente (one-shot)
    with engine.connect() as conn:
        try:
            cols = conn.execute(text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name = 'contas_pagar'"
            )).fetchall()
            col_names = {r[0] for r in cols}
            if "centro_custo" in col_names and "categoria" in col_names:
                # Só migra linhas ainda sem categoria
                rows = conn.execute(text(
                    "SELECT id, centro_custo::text FROM contas_pagar "
                    "WHERE categoria IS NULL OR categoria = ''"
                )).fetchall()
                from app.services.categorias_contas import mapear_legado
                for row_id, centro in rows:
                    cat, sub, pendente = mapear_legado(centro)
                    conn.execute(
                        text(
                            "UPDATE contas_pagar SET categoria = :cat, subcategoria = :sub, "
                            "categoria_pendente = :pend WHERE id = :id"
                        ),
                        {"cat": cat, "sub": sub, "pend": pendente, "id": row_id},
                    )
                # Preenche default se ainda houver NULL (tabela nova parcial)
                conn.execute(text(
                    "UPDATE contas_pagar SET categoria = 'adm_financeiro', categoria_pendente = FALSE "
                    "WHERE categoria IS NULL OR categoria = ''"
                ))
                conn.commit()
                # Remove coluna legada se existir
                try:
                    conn.execute(text("ALTER TABLE contas_pagar DROP COLUMN IF EXISTS centro_custo"))
                    conn.commit()
                except Exception:
                    conn.rollback()
            elif "categoria" in col_names:
                conn.execute(text(
                    "UPDATE contas_pagar SET categoria = 'adm_financeiro', categoria_pendente = FALSE "
                    "WHERE categoria IS NULL OR categoria = ''"
                ))
                conn.commit()
        except Exception:
            conn.rollback()

    # ALTER TYPE ADD VALUE não pode rodar dentro de transação no PostgreSQL
    # é necessário usar AUTOCOMMIT
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        try:
            conn.execute(text("ALTER TYPE statusnf ADD VALUE IF NOT EXISTS 'CANCELADA'"))
        except Exception:
            pass
        try:
            labels = [r[0] for r in conn.execute(text(
                "SELECT e.enumlabel FROM pg_enum e "
                "JOIN pg_type t ON e.enumtypid = t.oid "
                "WHERE t.typname = 'tipofechamento'"
            )).fetchall()]
            use_names = any(lb == "RETAINER" for lb in labels)
            novo = "PARCELAMENTO" if use_names else "parcelamento"
            if not labels:
                try:
                    conn.execute(text("ALTER TYPE tipofechamento ADD VALUE IF NOT EXISTS 'parcelamento'"))
                except Exception:
                    conn.execute(text("ALTER TYPE tipofechamento ADD VALUE IF NOT EXISTS 'PARCELAMENTO'"))
            elif novo not in labels:
                conn.execute(text(f"ALTER TYPE tipofechamento ADD VALUE IF NOT EXISTS '{novo}'"))
        except Exception:
            pass

    # Conversão one-shot: tipos oficiais retainer / sucesso / parcelamento
    with engine.connect() as conn:
        try:
            labels = [r[0] for r in conn.execute(text(
                "SELECT e.enumlabel FROM pg_enum e "
                "JOIN pg_type t ON e.enumtypid = t.oid "
                "WHERE t.typname = 'tipofechamento'"
            )).fetchall()]
            if labels:
                use_names = any(lb == "RETAINER" for lb in labels)
                lab_ret = "RETAINER" if use_names else "retainer"
                lab_suc = "SUCESSO" if use_names else "sucesso"
                lab_par = "PARCELAMENTO" if use_names else "parcelamento"
                has_ab = conn.execute(text(
                    "SELECT 1 FROM nfs WHERE tipo_abertura_fechamento IN ('abertura','fechamento') "
                    "UNION ALL SELECT 1 FROM dh WHERE tipo_abertura_fechamento IN ('abertura','fechamento') "
                    "LIMIT 1"
                )).first()
                has_par = conn.execute(text(
                    "SELECT 1 FROM nfs WHERE tipo::text = :p "
                    "UNION ALL SELECT 1 FROM dh WHERE tipo_fechamento::text = :p "
                    "LIMIT 1"
                ), {"p": lab_par}).first()
                if has_ab:
                    conn.execute(text(
                        "UPDATE nfs SET tipo = CAST(:p AS tipofechamento) WHERE tipo::text = :s"
                    ), {"p": lab_par, "s": lab_suc})
                    conn.execute(text(
                        "UPDATE dh SET tipo_fechamento = CAST(:p AS tipofechamento) "
                        "WHERE tipo_fechamento::text = :s"
                    ), {"p": lab_par, "s": lab_suc})
                    conn.execute(text(
                        "UPDATE nfs SET tipo = CAST(:s AS tipofechamento) "
                        "WHERE tipo::text = :r AND tipo_abertura_fechamento = 'fechamento'"
                    ), {"s": lab_suc, "r": lab_ret})
                    conn.execute(text(
                        "UPDATE dh SET tipo_fechamento = CAST(:s AS tipofechamento) "
                        "WHERE tipo_fechamento::text = :r AND tipo_abertura_fechamento = 'fechamento'"
                    ), {"s": lab_suc, "r": lab_ret})
                    conn.execute(text(
                        "UPDATE nfs SET tipo_abertura_fechamento = NULL "
                        "WHERE tipo_abertura_fechamento IS NOT NULL"
                    ))
                    conn.execute(text(
                        "UPDATE dh SET tipo_abertura_fechamento = NULL "
                        "WHERE tipo_abertura_fechamento IS NOT NULL"
                    ))
                elif not has_par:
                    conn.execute(text(
                        "UPDATE nfs SET tipo = CAST(:p AS tipofechamento) WHERE tipo::text = :s"
                    ), {"p": lab_par, "s": lab_suc})
                    conn.execute(text(
                        "UPDATE dh SET tipo_fechamento = CAST(:p AS tipofechamento) "
                        "WHERE tipo_fechamento::text = :s"
                    ), {"p": lab_par, "s": lab_suc})
                    conn.execute(text(
                        "UPDATE nfs SET tipo_abertura_fechamento = NULL "
                        "WHERE tipo_abertura_fechamento IS NOT NULL"
                    ))
                    conn.execute(text(
                        "UPDATE dh SET tipo_abertura_fechamento = NULL "
                        "WHERE tipo_abertura_fechamento IS NOT NULL"
                    ))
            conn.commit()
        except Exception:
            conn.rollback()

_migrar()

# Inicializar aplicação
app = FastAPI(
    title="Ocean App",
    description="Sistema de Gestão Financeira e Operacional",
    version="1.0.0"
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Ocean-Maggo-Status", "X-Ocean-Maggo-Ignorados"],
)

# Middleware para hosts seguros
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts_list(),
)

# Incluir rotas
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(colaboradores.router, prefix="/api/colaboradores", tags=["Colaboradores"])
app.include_router(nfs.router, prefix="/api/nfs", tags=["NFs"])
app.include_router(contas.router, prefix="/api/contas", tags=["Contas"])
app.include_router(bonus.router, prefix="/api/bonus", tags=["Bônus"])
app.include_router(ferias.router, prefix="/api/ferias", tags=["Férias"])
app.include_router(dh.router, prefix="/api/dh", tags=["DH"])
app.include_router(relatorios.router, prefix="/api/relatorios", tags=["Relatórios"])
app.include_router(auditoria.router, prefix="/api/auditoria", tags=["Auditoria"])
app.include_router(metas.router, prefix="/api/metas", tags=["Metas"])
app.include_router(documentos.router, prefix="/api/documentos", tags=["Documentos"])
app.include_router(alertas.router, prefix="/api/alertas", tags=["Alertas"])
app.include_router(configuracoes.router, prefix="/api/configuracoes", tags=["Configurações"])
app.include_router(saldos.router, prefix="/api/saldos", tags=["Saldos"])
app.include_router(impostos.router, prefix="/api/impostos", tags=["Impostos"])
app.include_router(historico.router, prefix="/api/historico", tags=["Histórico"])
app.include_router(fluxo_movimentos.router, prefix="/api/fluxo-movimentos", tags=["Fluxo Movimentos"])
app.include_router(patrimonio.router, prefix="/api/patrimonio", tags=["Patrimônio"])
app.include_router(arquivos_nfs.router, prefix="/api/arquivos-nfs", tags=["Arquivos NFs"])
app.include_router(arquivos_comprovantes.router, prefix="/api/arquivos-comprovantes", tags=["Comprovantes"])

@app.get("/")
def root():
    return {
        "message": "Ocean App API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "ok"}


# ==================== AGENDADOR DE ALERTAS DIÁRIOS ====================
logger = logging.getLogger("ocean.scheduler")


async def _loop_alertas_diarios():
    """Dispara os alertas por e-mail uma vez por dia (a cada 24h)."""
    from app.services.email import enviar_alertas
    while True:
        await asyncio.sleep(24 * 60 * 60)  # 24h
        try:
            db = SessionLocal()
            try:
                resultado = enviar_alertas(db)
                logger.info("[alertas] %s alerta(s), e-mail=%s",
                            resultado.get("total"), resultado.get("email_enviado"))
            finally:
                db.close()
        except Exception as e:
            logger.error("[alertas] Falha no loop diário: %s", e)


@app.on_event("startup")
async def _iniciar_agendador():
    # Só agenda envio automático se houver destinatários configurados
    if settings.ALERT_EMAILS.strip():
        asyncio.create_task(_loop_alertas_diarios())
        logger.info("[alertas] Agendador diário de alertas ativado.")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
