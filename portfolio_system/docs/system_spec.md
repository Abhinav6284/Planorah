# Portfolio System Spec (VPS Implementation)

## Public URL Strategy
- API base: `https://api.planorah.me/v1`
- Public portfolio payload: `GET /v1/public/portfolio/{slug}`

## Visibility Rules
- `public`: visible to all
- `unlisted`: visible by URL
- `private`: hidden from public endpoint

## Upload Rules
- Types: `jpeg`, `png`, `webp`, `avif`
- Max size: 8 MB (configurable)
- Upload endpoint: `POST /v1/upload/image`
- Storage root: `/var/www/planorah/media`

## Security Controls
- JWT auth with bearer tokens
- Ownership checks on write APIs
- CORS allowlist + Vercel regex support

## Data Stores
- PostgreSQL (`planorah_portfolio`)
- Local filesystem for media

## Frontend Contract
- Next.js on Vercel consumes JSON APIs at `https://api.planorah.me/v1/`
- Public page fetch path: `/v1/public/portfolio/{slug}`
