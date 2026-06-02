# OpenAPI

The API specification lives in [`openapi.yaml`](../openapi.yaml) at the repository root.

## Swagger UI (included in Docker)

Swagger UI is included in the Docker stack (no upload needed):

- Development (direct port): `http://localhost:8081/`
- Production (behind Caddy): `http(s)://<your-domain>/docs`

## Swagger Editor (browser)

1. Open https://editor.swagger.io/
2. **File → Import file** and select `openapi.yaml`

## Local preview (optional)

```bash
npx --yes redoc-cli serve openapi.yaml
```

## Base URL

With the default Docker Compose setup:

- Development: `http://localhost:3000/api`
- Production: depends on your domain and `docker-compose.prod.yml` / Caddy configuration
