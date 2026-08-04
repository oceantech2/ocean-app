from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Engine para conectar ao banco
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=40,
)

# SessionLocal para criar sessões
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para models
Base = declarative_base()

def get_db():
    """Dependency para injetar sessão do banco nas rotas"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
