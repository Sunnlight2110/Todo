from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = "My FastAPI Application"
    admin_email: str = "admin@yopmail.com"
    
    # JWT settings
    jwt_secret_key: str  # Auto-reads JWT_SECRET_KEY from .env
    jwt_algorithm: str
    jwt_expiration_minutes: int

    database_url: str
    
    open_router_key: str

    class Config:
        env_file = ".env"  # No `: str` needed here!

settings = Settings()