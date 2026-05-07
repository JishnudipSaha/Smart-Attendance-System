from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Smart Attendance System"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Database Settings
    DATABASE_URL: str

    # Security Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Storage Settings
    UPLOAD_DIR: str = "static/students"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()
