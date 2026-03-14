-- Planorah Portfolio System (PostgreSQL VPS schema)

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(120) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolios (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL DEFAULT '',
    headline VARCHAR(240) NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    avatar_url VARCHAR(500),
    cover_url VARCHAR(500),
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_public ON portfolios(is_published, visibility);

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    short_description VARCHAR(280) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    image_url VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_portfolio ON projects(portfolio_id, sort_order);

CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'general',
    level VARCHAR(30) NOT NULL DEFAULT 'intermediate',
    sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_skills_portfolio ON skills(portfolio_id, sort_order);

CREATE TABLE IF NOT EXISTS certificates (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    issuer VARCHAR(140) NOT NULL DEFAULT '',
    issue_date DATE,
    image_url VARCHAR(500),
    certificate_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS social_links (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    platform VARCHAR(40) NOT NULL,
    url VARCHAR(500) NOT NULL,
    CONSTRAINT uq_portfolio_social_platform UNIQUE (portfolio_id, platform)
);

-- Custom domain support
CREATE TABLE IF NOT EXISTS custom_domains (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain      VARCHAR(253) NOT NULL,
    verified    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_custom_domains_domain UNIQUE (domain)
);
CREATE INDEX IF NOT EXISTS idx_custom_domains_user    ON custom_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_verified ON custom_domains(domain, verified);
