from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.routes.portfolios import router as portfolios_router
from app.api.routes.public import router as public_router
from app.api.routes.uploads import router as uploads_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.services.upload_service import upload_service

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_origin_regex=settings.vercel_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolios_router, prefix=settings.api_v1_prefix)
app.include_router(public_router, prefix=settings.api_v1_prefix)
app.include_router(uploads_router, prefix=settings.api_v1_prefix)


def initialize_schema_if_enabled() -> None:
    if not settings.auto_create_schema:
        return

    if engine.dialect.name == "postgresql":
        lock_id = 8451723491001
        with engine.begin() as connection:
            connection.execute(text("SELECT pg_advisory_lock(:lock_id)"), {"lock_id": lock_id})
            try:
                Base.metadata.create_all(bind=connection, checkfirst=True)
            finally:
                connection.execute(text("SELECT pg_advisory_unlock(:lock_id)"), {"lock_id": lock_id})
        return

    Base.metadata.create_all(bind=engine, checkfirst=True)


@app.on_event("startup")
def startup_event() -> None:
    upload_service.ensure_media_directories()
    initialize_schema_if_enabled()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
