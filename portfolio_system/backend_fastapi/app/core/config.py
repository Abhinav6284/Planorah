from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "planorah-portfolio-api"
    env: str = "production"
    debug: bool = False
    api_v1_prefix: str = "/v1"

    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    auto_create_schema: bool = False

    media_root: str = "/var/www/planorah/media"
    media_url_path: str = "/media"
    public_api_base_url: str = "https://api.planorah.me"
    max_upload_bytes: int = 8 * 1024 * 1024

    # Custom domain feature
    vps_public_ip: str = ""          # e.g. "198.51.100.42" — set in .env
    max_custom_domains_per_user: int = 3

    allowed_origins: str = (
        "https://portfolio.planorah.me,"
        "https://planorah.me,"
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )
    allowed_origin_regex: str | None = r"^https://([a-z0-9-]+\.)?planorah\.me$"
    vercel_origin_regex: str | None = r"https://.*\\.vercel\\.app"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def cors_origin_regex(self) -> str | None:
        patterns: list[str] = []
        for raw_pattern in (self.allowed_origin_regex, self.vercel_origin_regex):
            if raw_pattern is None:
                continue
            pattern = raw_pattern.strip()
            if pattern:
                patterns.append(f"(?:{pattern})")
        if not patterns:
            return None
        return "|".join(patterns)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)


settings = Settings()
