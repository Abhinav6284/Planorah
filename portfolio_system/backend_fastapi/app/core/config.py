from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "planorah-portfolio-api"
    env: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/v1"

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"

    postgres_dsn: str
    redis_url: str

    s3_endpoint_url: str | None = None
    s3_region: str = "us-east-1"
    s3_bucket: str
    s3_access_key: str
    s3_secret_key: str
    cdn_base_url: str

    max_upload_bytes: int = 8 * 1024 * 1024
    public_cache_ttl_seconds: int = 300

    allowed_origins: str = "https://planorah-c65p.vercel.app,https://planorah.me"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
