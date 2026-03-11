# Planorah Portfolio System - Production Architecture + Implementation Scaffold

This package provides a complete SaaS-grade portfolio system design and scaffold for Planorah.

It is designed for:
- large-scale public portfolio delivery (`portfolio.planorah.me/username`, `portfolio.planorah.me/p/{slug}`)
- modular editing dashboard
- secure media uploads
- high-performance rendering
- future extensibility (GitHub import, AI bio, analytics, resume generation)

## 1) System Architecture

### Runtime Components
- `portfolio-web` (Next.js/React):
  - Authenticated portfolio editor dashboard
  - Public portfolio pages (SSG + ISR)
- `portfolio-api` (FastAPI):
  - portfolio content APIs
  - media upload APIs (S3 pre-signed URL flow)
  - public read APIs
- `postgresql`:
  - normalized source of truth
- `redis`:
  - public read cache
  - rate-limit counters
  - event queue hooks
- `s3-compatible object storage`:
  - profile/cover/project/certificate images
- `image worker`:
  - thumbnail generation and optimization (`webp`, `avif`, responsive sizes)
- `cdn`:
  - edge delivery for pages + media assets

### Request Flow (Public Page)
1. Visitor requests `/p/{slug}` or `/username`.
2. Next.js checks ISR page cache (edge).
3. On revalidate/cache miss, Next.js calls `GET /v1/public/portfolios/{slug}`.
4. API serves from Redis when available, else from PostgreSQL.
5. Response is cached in Redis and rendered into ISR output.

### Request Flow (Editor Save)
1. Authenticated user updates portfolio in dashboard.
2. Client sends API mutation to FastAPI.
3. API validates payload, persists to PostgreSQL.
4. API invalidates Redis key and triggers ISR revalidation.
5. Updated page becomes available globally via CDN.

### Request Flow (Media Upload)
1. Client asks for pre-signed URL (`POST /v1/uploads/presign`).
2. API validates type/size and returns signed URL + object key.
3. Client uploads directly to S3.
4. Client confirms completion (`POST /v1/uploads/complete`).
5. Worker creates responsive variants and warms CDN.

## 2) Folder Structure

```txt
portfolio_system/
  README.md
  backend_fastapi/
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
        __init__.py
      schemas/
        portfolio.py
      services/
        cache_service.py
        storage_service.py
        render_service.py
        image_pipeline.py
    sql/
      schema.sql
    requirements.txt
    .env.example
  frontend_next/
    app/
      layout.tsx
      globals.css
      dashboard/portfolio/editor/page.tsx
      p/[slug]/page.tsx
    components/
      editor/PortfolioEditor.tsx
      editor/LivePreview.tsx
      public/PublicPortfolioPage.tsx
    lib/
      api.ts
      types.ts
    package.json
    next.config.js
```

## 3) Database Schema (Normalized)

Implemented in `backend_fastapi/sql/schema.sql` with:
- `users`
- `portfolios`
- `portfolio_settings`
- `portfolio_sections`
- `projects`
- `project_images`
- `technologies`
- `project_technologies`
- `skills`
- `portfolio_skills`
- `certificates`
- `social_links`
- `portfolio_themes`
- `portfolio_view_events`

Key scale constraints:
- unique + indexed `slug`
- unique `user_id` portfolio ownership
- indexed public query columns (`is_published`, `visibility`)
- indexed event time-series by `(portfolio_id, created_at desc)`

## 4) API Routes

### Authenticated
- `GET /v1/portfolios/me`
- `PATCH /v1/portfolios/me`
- `GET /v1/portfolios/me/completeness`
- `POST /v1/portfolios/me/publish`
- `POST /v1/portfolios/me/unpublish`
- `POST /v1/uploads/presign`
- `POST /v1/uploads/complete`

### Public
- `GET /v1/public/portfolios/{slug}`
- `POST /v1/public/portfolios/{slug}/track`

## 5) Backend Services

- `cache_service.py`: Redis JSON cache abstraction
- `storage_service.py`: S3 key generation + pre-sign + validation
- `render_service.py`: build public read model from normalized tables
- `image_pipeline.py`: background image optimization contract

## 6) Editor Dashboard (React/Next)

The dashboard supports:
- General
- Social Links
- Projects
- Skills
- Certificates
- Settings
- Live preview panel

Implemented scaffold:
- `frontend_next/components/editor/PortfolioEditor.tsx`
- `frontend_next/components/editor/LivePreview.tsx`

## 7) Public Portfolio Rendering Engine

Public page uses data read model:
- hero section (name/headline/bio)
- skills section
- project cards with technologies and links
- certificates section
- social/contact section

Implemented scaffold:
- `frontend_next/components/public/PublicPortfolioPage.tsx`
- `frontend_next/app/p/[slug]/page.tsx` (ISR-enabled)

## 8) Security + Performance

### Security
- JWT verification (`core/security.py`)
- owner-only mutation policies (`api/deps.py`)
- strict upload validation (mime + max size)
- rate limiting hooks via Redis (plug SlowAPI/Envoy)
- XSS protection: sanitize rich text before persist/render

### Performance
- ISR public pages (`revalidate = 300`)
- Redis API cache for public read model
- CDN-backed media URLs
- async image optimization
- schema-level indexes for hot paths

## 9) Future Features (Compatibility)

Pluggable without schema redesign:
- GitHub repo import and auto-sync
- AI-generated headline/bio and project summaries
- roadmap-progress visualization widgets
- resume export
- deep analytics and conversion funnels

## 10) Deployment Recommendations

- API + Web deployed independently (Kubernetes/ECS)
- Managed Postgres with read replicas
- Managed Redis
- S3 + CDN (CloudFront/Cloudflare)
- Background workers for image jobs
- Blue/green deploys + structured logging + tracing
