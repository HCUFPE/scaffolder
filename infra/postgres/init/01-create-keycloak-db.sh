#!/usr/bin/env bash
set -euo pipefail

psql \
  --set ON_ERROR_STOP=1 \
  --set keycloak_db_name="$KEYCLOAK_DB_NAME" \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" <<-'EOSQL'
  SELECT format('CREATE DATABASE %I', :'keycloak_db_name')
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_database WHERE datname = :'keycloak_db_name'
  )\gexec
EOSQL
