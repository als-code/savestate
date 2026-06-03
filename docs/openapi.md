# OpenAPI

The API specification lives in [`openapi.yaml`](../openapi.yaml) at the repository root.

<details>
<summary>OpenAPI (Swagger UI)</summary>

| API overview | Schemas |
|:---:|:---:|
| ![OpenAPI overview](screenshots/openapi1.webp) | ![OpenAPI schemas list](screenshots/openapi2.webp) |

| Endpoint detail | Schema models |
|:---:|:---:|
| ![OpenAPI GET /games/{id}](screenshots/openapi3.webp) | ![OpenAPI schema detail](screenshots/openapi4.webp) |

</details>

## Swagger UI (included in Docker)

- `http://localhost:3035/` (dev and Ubuntu server use the same port)

## Swagger Editor (browser)

1. Open https://editor.swagger.io/
2. **File → Import file** and select `openapi.yaml`

## Local preview (optional)

```bash
npx --yes redoc-cli serve openapi.yaml
```

## Base URL

- API: `http://localhost:3030/api` (or `http://<server-lan-ip>:3030/api` on the network)
