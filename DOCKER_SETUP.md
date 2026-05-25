# Docker Setup Guide for Planorah

This guide explains how to run the entire Planorah application using Docker and Docker Compose.

## Overview

The Docker setup includes:

- **PostgreSQL Database** - Primary data storage
- **Redis** - Cache and message broker for Celery
- **Django Backend** - API server with DRF and JWT auth
- **Celery Worker** - Async task processing
- **Celery Beat** - Scheduled task execution
- **React Frontend** - Main user interface
- **Admin Panel** - Admin dashboard (Vite + React)

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 1.29+)
- Git

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project root
cd path/to/planorah

# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
# At minimum, change SECRET_KEY to a secure random string
nano .env  # or use your preferred editor
```

### 2. Generate a Secure Secret Key

```bash
# On Linux/Mac
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# On Windows (PowerShell)
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and update `SECRET_KEY` in your `.env` file.

### 3. Build and Start Services

```bash
# Build all Docker images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f celery_worker
```

### 4. Initialize the Database

After the backend container starts, run migrations:

```bash
# Run database migrations
docker-compose exec backend python manage.py migrate

# Create a superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# Load initial data (if available)
docker-compose exec backend python manage.py loaddata fixture_name
```

### 5. Access Services

Once all services are running, access them at:

- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **Frontend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:5173
- **Database**: localhost:5432
- **Redis**: localhost:6379

## Development Mode

For development with live code reloading:

```bash
# Terminal 1: Start backend and database services
docker-compose up db redis backend

# Terminal 2: Run frontend in development mode
cd frontend
npm install
npm start

# Terminal 3: Run admin panel in development mode
cd admin-panel
npm install
npm run dev

# Terminal 4 (optional): Run Celery worker
docker-compose up celery_worker
```

## Common Commands

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove Data

```bash
docker-compose down -v
```

### Rebuild Specific Service

```bash
docker-compose build backend
docker-compose up -d backend
```

### Run Django Management Commands

```bash
# Migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Shell access
docker-compose exec backend python manage.py shell
```

### Execute Commands in Container

```bash
# Bash shell
docker-compose exec backend bash

# Python shell
docker-compose exec backend python

# Run pip commands
docker-compose exec backend pip install package-name
```

### View Container Status

```bash
# List running containers
docker-compose ps

# Check resource usage
docker stats

# View container logs
docker-compose logs [service-name]
```

## Environment Variables

Key environment variables in `.env`:

| Variable               | Default               | Description                                  |
| ---------------------- | --------------------- | -------------------------------------------- |
| `DEBUG`                | False                 | Django debug mode (never True in production) |
| `SECRET_KEY`           | None                  | Django secret key (MUST be set)              |
| `DB_NAME`              | planorah_db           | PostgreSQL database name                     |
| `DB_USER`              | planorah              | PostgreSQL user                              |
| `DB_PASSWORD`          | planorah_password     | PostgreSQL password                          |
| `DB_HOST`              | db                    | PostgreSQL host (container name)             |
| `CELERY_BROKER_URL`    | redis://redis:6379/0  | Redis broker URL                             |
| `CORS_ALLOWED_ORIGINS` | localhost origins     | CORS allowed origins                         |
| `REACT_APP_API_URL`    | http://localhost:8000 | Frontend API endpoint                        |
| `VITE_API_URL`         | http://localhost:8000 | Admin panel API endpoint                     |

## Troubleshooting

### Services won't start

```bash
# Check logs for errors
docker-compose logs backend

# Verify port availability
# Make sure ports 5432, 6379, 8000, 3000, 5173 are not in use

# Rebuild images
docker-compose build --no-cache
```

### Database connection errors

```bash
# Check database is healthy
docker-compose ps db

# Manually test connection
docker-compose exec db psql -U planorah -d planorah_db

# View database logs
docker-compose logs db
```

### Frontend cannot reach backend

```bash
# Verify backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Update CORS settings in .env
CORS_ALLOWED_ORIGINS=http://frontend:3000,http://localhost:3000

# Rebuild frontend with new environment
docker-compose build frontend
```

### Memory/Resource Issues

```bash
# Check Docker resource limits
docker system df

# Clean up unused images/containers
docker system prune -a

# Limit service resources in docker-compose.yml:
# services:
#   backend:
#     deploy:
#       resources:
#         limits:
#           cpus: '0.5'
#           memory: 512M
```

### Redis/Celery Issues

```bash
# Check Redis connection
docker-compose exec redis redis-cli ping

# Monitor Celery worker
docker-compose logs -f celery_worker

# Inspect Redis keys
docker-compose exec redis redis-cli KEYS '*'

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

## Production Deployment

Before deploying to production:

1. **Update `.env` with production values**:
   - Set `DEBUG=False`
   - Use a strong `SECRET_KEY`
   - Update database credentials
   - Set appropriate CORS origins
   - Configure email and external API keys

2. **Use environment-specific compose files**:

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Run security checks**:

   ```bash
   docker-compose exec backend python manage.py check --deploy
   ```

4. **Use reverse proxy** (Nginx):
   - Set up SSL/TLS
   - Load balance between backend instances
   - Serve static files efficiently

5. **Monitor services**:
   - Set up log aggregation (ELK Stack, CloudWatch)
   - Monitor container health
   - Set up alerts for failures

## Health Checks

Services include health checks. To view:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:8000/api/health/
curl http://localhost:3000
curl http://localhost:5173
```

## Useful Docker Commands

```bash
# View docker-compose version
docker-compose --version

# Validate docker-compose.yml
docker-compose config

# Pull latest images
docker-compose pull

# Push images to registry
docker-compose push

# Scale services (not recommended for this setup)
docker-compose up --scale backend=2

# Run command in background service
docker-compose run --rm backend python manage.py dbshell
```

## Getting Help

For issues with:

- **Django**: https://docs.djangoproject.com/
- **DRF**: https://www.django-rest-framework.org/
- **Celery**: https://docs.celeryproject.io/
- **Docker**: https://docs.docker.com/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Django Deployment Guide](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [Celery Documentation](https://docs.celeryproject.io/)
