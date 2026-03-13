from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "planorah-portfolio-api"
    env: str = "production"
    debug: bool = False
    api_v1_prefix: str = "/v1"

    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"

    media_root: str = "/var/www/planorah/media"
    media_url_path: str = "/media"
    public_api_base_url: str = "https://api.planorah.me"
    max_upload_bytes: int = 8 * 1024 * 1024

    allowed_origins: str = (
        "https://portfolio.planorah.me,"
        "https://planorah.me,"
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )
    vercel_origin_regex: str = r"https://.*\\.vercel\\.app"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)


settings = Settings()
