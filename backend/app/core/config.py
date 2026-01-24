from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from typing import Optional, List

class Settings(BaseSettings):
    # =========================================================================
    # Database Configuration
    # =========================================================================
    DATABASE_URL: str = "postgresql://ecommerce_user:commercePASS@127.0.0.1:5432/ecommerce"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: Optional[str]) -> str:
        if v and v.startswith("postgres://"):
            # Fix for Render/Heroku which use 'postgres://' but SQLAlchemy requires 'postgresql://'
            return v.replace("postgres://", "postgresql://", 1)
        return v or "postgresql://ecommerce_user:commercePASS@127.0.0.1:5432/ecommerce"

    # Database Pool Configuration
    DB_POOL_SIZE: int = 15
    DB_MAX_OVERFLOW: int = 30
    DB_POOL_TIMEOUT: int = 60
    DB_POOL_RECYCLE: int = 1800

    # =========================================================================
    # Security & Authentication
    # =========================================================================
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Session & Rate Limiting
    SESSION_SECRET: str = "another_secret_key_for_sessions"
    SESSION_COOKIE_NAME: str = "ecommerce_session"
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60

    # =========================================================================
    # Application Info
    # =========================================================================
    APP_NAME: str = "Neatify E-Commerce"
    APP_VERSION: str = "1.5.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: str = "development"

    # API Routing
    API_V1_PREFIX: str = "/api/v1"
    API_V1_STR: str = "/api/v1"
    DOC_V1_STR: str = "/api/v1"
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"

    # =========================================================================
    # Files & Storage
    # =========================================================================
    UPLOAD_DIR: str = "uploads/products"
    MAX_FILE_SIZE: int = 5242880
    ALLOWED_EXTENSIONS: str = ".jpg,.jpeg,.png,.gif,.webp"

    # =========================================================================
    # External Services (Optional)
    # =========================================================================
    
    # Email (SMTP)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = None

    # Payments
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_SECRET: Optional[str] = None
    PAYPAL_MODE: str = "sandbox"

    # Caching
    REDIS_URL: Optional[str] = None
    CACHE_ENABLED: bool = False
    CACHE_TTL: int = 300

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # =========================================================================
    # Admin Initial Account
    # =========================================================================
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD_HASH: str = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5isl.xMUTWq3u"

    # =========================================================================
    # Logging & Misc
    # =========================================================================
    LOG_FILE: str = "logs/app.log"
    LOG_MAX_BYTES: int = 10485760
    LOG_BACKUP_COUNT: int = 5
    TIMEZONE: str = "UTC"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()