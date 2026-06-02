#!/bin/sh
set -eu

# Runs only on first PostgreSQL init (empty data directory).
# Creates an admin user if ADMIN_EMAIL and ADMIN_PASSWORD are provided.

if [ -z "${ADMIN_EMAIL:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "[db init] ADMIN_EMAIL / ADMIN_PASSWORD not set; skipping admin creation"
  exit 0
fi

ADMIN_DISPLAY_NAME="${ADMIN_DISPLAY_NAME:-Admin}"

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<SQL
DO \$\$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  IF NOT EXISTS (SELECT 1 FROM users WHERE email = '${ADMIN_EMAIL}') THEN
    INSERT INTO users (email, password_hash, display_name, role)
    VALUES (
      '${ADMIN_EMAIL}',
      crypt('${ADMIN_PASSWORD}', gen_salt('bf', 10)),
      '${ADMIN_DISPLAY_NAME}',
      'admin'
    );
  END IF;
END
\$\$;
SQL

echo "[db init] Admin user ensured for ${ADMIN_EMAIL}"
