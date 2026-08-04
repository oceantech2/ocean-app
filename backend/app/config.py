from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # App
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/ocean_db"
    )
    
    # JWT
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "sua-chave-secreta-muito-segura-alterar-em-producao"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 horas
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5193",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5193",
    ]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # Email / Alertas
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "noreply@oceanapp.com")
    # Destinatário(s) dos alertas, separados por vírgula
    ALERT_EMAILS: str = os.getenv("ALERT_EMAILS", "")
    # Dias de antecedência para alertar NF/conta a vencer
    ALERT_DIAS_ANTECEDENCIA: int = int(os.getenv("ALERT_DIAS_ANTECEDENCIA", "5"))
    # Saldo de dias de férias acima do qual gera alerta
    ALERT_FERIAS_LIMITE_DIAS: int = int(os.getenv("ALERT_FERIAS_LIMITE_DIAS", "20"))

    # Upload de documentos
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/app/uploads")
    UPLOAD_MAX_MB: int = int(os.getenv("UPLOAD_MAX_MB", "10"))

    # Redis (para cache)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    class Config:
        env_file = ".env"

settings = Settings()
