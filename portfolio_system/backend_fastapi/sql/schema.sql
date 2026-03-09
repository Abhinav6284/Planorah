-- Planorah Portfolio System (PostgreSQL normalized schema)

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(120) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolios (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL DEFAULT '',
    headline VARCHAR(240) NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    profile_image_key VARCHAR(300),
    cover_image_key VARCHAR(300),
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_public ON portfolios(is_published, visibility);

CREATE TABLE IF NOT EXISTS portfolio_settings (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL UNIQUE REFERENCES portfolios(id) ON DELETE CASCADE,
    allow_contact BOOLEAN NOT NULL DEFAULT TRUE,
    theme_key VARCHAR(80) NOT NULL DEFAULT 'minimal',
    accent_color VARCHAR(20) NOT NULL DEFAULT '#4f46e5',
    seo_title VARCHAR(140) NOT NULL DEFAULT '',
    seo_description VARCHAR(240) NOT NULL DEFAULT '',
    extras JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS portfolio_sections (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    section_key VARCHAR(60) NOT NULL,
    title VARCHAR(120) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT uq_portfolio_section_key UNIQUE (portfolio_id, section_key)
);

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    short_description VARCHAR(280) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    github_url VARCHAR(300),
    live_url VARCHAR(300),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_portfolio ON projects(portfolio_id, sort_order);

CREATE TABLE IF NOT EXISTS project_images (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_key VARCHAR(300) NOT NULL,
    alt_text VARCHAR(200) NOT NULL DEFAULT '',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS technologies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS project_technologies (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology_id BIGINT NOT NULL REFERENCES technologies(id),
    CONSTRAINT uq_project_technology UNIQUE (project_id, technology_id)
);

CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL DEFAULT 'general'
);

CREATE TABLE IF NOT EXISTS portfolio_skills (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id),
    level VARCHAR(30) NOT NULL DEFAULT 'intermediate',
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_portfolio_skill UNIQUE (portfolio_id, skill_id)
);

CREATE TABLE IF NOT EXISTS certificates (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    issuer VARCHAR(140) NOT NULL DEFAULT '',
    issue_date DATE,
    certificate_image_key VARCHAR(300),
    certificate_url VARCHAR(300)
);

CREATE TABLE IF NOT EXISTS social_links (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    platform VARCHAR(40) NOT NULL,
    url VARCHAR(300) NOT NULL,
    CONSTRAINT uq_portfolio_platform UNIQUE (portfolio_id, platform)
);

CREATE TABLE IF NOT EXISTS portfolio_view_events (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    event_type VARCHAR(40) NOT NULL,
    session_id VARCHAR(120),
    referrer VARCHAR(300),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_events_portfolio_created
    ON portfolio_view_events(portfolio_id, created_at DESC);
