from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Render é IPv4-only. NÃO use db.<ref>.supabase.co (só IPv6 no plano free).
# Use Session pooler (Connect no Dashboard → Session mode):
# postgresql://postgres.<ref>:<SENHA>@aws-0-<REGIAO>.pooler.supabase.com:5432/postgres?sslmode=require
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    """Dependency para injetar sessão do banco nas rotas"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
