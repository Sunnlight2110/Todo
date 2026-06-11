from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "My FastAPI Application"
    admin_email: str = "admin@yopmail.com"

    jwt_secret_key: str
    jwt_algorithm: str
    jwt_expiration_minutes: int

    database_url: str
    open_router_key: str

    allowed_origins: str

    model_config = SettingsConfigDict(
        env_file=".env"
    )

settings = Settings()