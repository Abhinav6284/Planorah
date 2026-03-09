from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.content import router as content_router
from app.api.routes.portfolios import router as portfolios_router
from app.api.routes.public import router as public_router
from app.api.routes.uploads import router as uploads_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolios_router, prefix=settings.api_v1_prefix)
app.include_router(content_router, prefix=settings.api_v1_prefix)
app.include_router(uploads_router, prefix=settings.api_v1_prefix)
app.include_router(public_router, prefix=settings.api_v1_prefix)


@app.get("/health")
def health():
    return {"status": "ok"}
