# Deploy on Ubuntu Server (Docker Compose)

Production-oriented checklist to run the stack on an Ubuntu Server host.

## Install Docker

Follow the official guide: https://docs.docker.com/engine/install/ubuntu/

After installation:

```bash
sudo usermod -aG docker $USER
newgrp docker
docker version
docker compose version
```

## Configure environment

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set a strong `JWT_SECRET`.

Edit `.env` and set:

- `POSTGRES_PASSWORD` (optional)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (admin account)
- `DOMAIN`, `ACME_EMAIL` (Caddy / TLS)
- `VITE_API_URL`, `VITE_FILES_URL` (optional; used at frontend build time)

## Start

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The production stack uses [Caddy](../Caddyfile) as a reverse proxy when defined in `docker-compose.prod.yml`.

## Verify

```bash
docker ps
curl -sS http://localhost:8080/api/health
```

Notes:

- The admin user is created by the API on startup if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set and the user doesn't exist yet.
- `pgAdmin` is only included in the development compose (`docker-compose.yml`), not in production.
