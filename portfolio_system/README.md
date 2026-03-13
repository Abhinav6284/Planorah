# Planorah Portfolio System (VPS FastAPI + PostgreSQL + Local Media)

This package provides a VPS-first portfolio microservice for Planorah.

## Overview

- Backend: FastAPI (`portfolio_api`) running independently
- Database: PostgreSQL (`planorah_portfolio`)
- Media storage: local filesystem (`/var/www/planorah/media`)
- Frontend consumer: Next.js app on Vercel via `https://api.planorah.me/v1/`
- No S3, Redis, CDN cache, queue workers, or external infra dependencies

## Runtime Layout (Target VPS)

```txt
/var/www/planorah/
  services/
    portfolio_api/
      app/
        main.py
        api/
          deps.py
          routes/
            portfolios.py
            public.py
            uploads.py
        core/
          config.py
          security.py
        db/
          base.py
          session.py
        models/
          portfolio.py
          project.py
          skill.py
        schemas/
          portfolio.py
          project.py
        services/
          portfolio_service.py
          upload_service.py
        utils/
      requirements.txt
      .env
  media/
    avatars/
    projects/
    certificates/
    covers/
  logs/
    portfolio_api.log
```

## API Prefix

- `/v1`

## Core Endpoints

- `POST /v1/portfolio`
- `PATCH /v1/portfolio`
- `GET /v1/portfolio`
- `GET /v1/public/portfolio/{slug}`
- `POST /v1/upload/image`

## Media Upload Behavior

- Route delegates to `app/services/upload_service.py`
- Validates image type and size
- Stores file in `MEDIA_ROOT/{category}/` with UUID filename
- Returns public URL, for example:
  - `https://api.planorah.me/media/projects/uuid_filename.webp`

## Environment Variables

Required values:

- `DATABASE_URL`
- `JWT_SECRET`

Optional with defaults:

- `MEDIA_ROOT=/var/www/planorah/media`
- `MEDIA_URL_PATH=/media`
- `PUBLIC_API_BASE_URL=https://api.planorah.me`
- `API_V1_PREFIX=/v1`
- `ALLOWED_ORIGINS=...`
- `VERCEL_ORIGIN_REGEX=https://.*\\.vercel\\.app`

See `backend_fastapi/.env.example`.

## Run (Gunicorn)

```bash
gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 3 -b 127.0.0.1:8001
```

## Nginx Media Serving Assumption

```nginx
location /media/ {
    alias /var/www/planorah/media/;
}
```

FastAPI stores files only; Nginx serves `/media/*` publicly.
