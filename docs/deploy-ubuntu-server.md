# Run on a private Ubuntu server (Docker Compose)

Checklist for **your own** Ubuntu machine on the home LAN. Not for public hosting.

Uses `docker-compose.prod.yml`. **Same host ports as development** (see README).

## Install Docker

https://docs.docker.com/engine/install/ubuntu/

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

- `backend/.env`: strong `JWT_SECRET`
- `.env`: `ADMIN_*`, and `VITE_API_URL` / `VITE_FILES_URL` with your server **LAN IP**

Example (`192.168.1.50`):

```env
VITE_API_URL=http://192.168.1.50:3030/api
VITE_FILES_URL=http://192.168.1.50:3030/uploads
```

## Start

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

| Service    | Port |
|------------|------|
| Frontend   | 5175 |
| API        | 3030 |
| Swagger UI | 3035 |

From another device: `http://192.168.1.50:5175/` (replace with your IP).

## Verify

```bash
docker ps
curl -sS http://localhost:3030/api/health
```

## Notes

- Admin user is created on first start if `ADMIN_EMAIL` / `ADMIN_PASSWORD` are set.
- **Firewall**: allow **5175**, **3030**, **3035** on the LAN if needed.
- `pgAdmin` is only in the development compose (`docker-compose.yml`).
