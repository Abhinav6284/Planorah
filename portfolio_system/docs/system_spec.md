# Portfolio System Spec (Decision Complete)

## Public URL Strategy
- Primary: `planorah.me/{username}` (edge route resolver)
- Fallback: `planorah.me/p/{slug}`

## Visibility Rules
- `public`: discoverable and indexable
- `unlisted`: accessible by URL, no index
- `private`: owner only

## Upload Rules
- Types: `jpeg`, `png`, `webp`, `avif`
- Max size: 8 MB (configurable)
- Upload flow: signed URL only, no direct API file payload

## Theme Keys
- `minimal`
- `developer-dark`
- `modern-gradient`

## Security Controls
- JWT auth with role claims (`student`, `admin`)
- Ownership checks on all write APIs
- Validation + sanitization before persist
- Rate-limit public and upload endpoints
- Log request-id + user-id + source IP for audits

## Performance Targets
- Public page TTFB p95 < 250ms from edge
- Portfolio payload API p95 < 120ms (cache hit path)
- Cache hit ratio > 90% for public reads

## Future Extensions
- GitHub repo auto-import
- Progress graph from Planorah roadmap
- AI headline/bio generation
- Resume PDF generation
- Portfolio analytics dashboard
