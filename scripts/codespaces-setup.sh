#!/usr/bin/env bash
# scripts/codespaces-setup.sh
#
# Detecta se o ambiente é um GitHub Codespace e ajusta automaticamente as
# variáveis *_BASE_URL no arquivo .env para apontar para as URLs públicas
# geradas pelo Codespaces (https://<CODESPACE_NAME>-<PORT>.app.github.dev).
#
# Uso:
#   bash scripts/codespaces-setup.sh
#
# Seguro para rodar em ambiente local — não faz nada se CODESPACE_NAME não
# estiver definido.

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${CYAN}⚡${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

# ── Guarda de ambiente ──────────────────────────────────────────────────────

if [[ -z "${CODESPACE_NAME:-}" ]]; then
  warn "Variável CODESPACE_NAME não encontrada — você não está no Codespaces."
  warn "Nenhuma alteração foi feita no .env."
  exit 0
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo -e "${CYAN}⚡${NC} Arquivo .env não encontrado. Copiando de .env.example..."
  cp "$ROOT_DIR/.env.example" "$ENV_FILE"
  ok ".env criado a partir de .env.example"
fi

# ── Leitura das portas atuais do .env ──────────────────────────────────────

get_env_value() {
  local key="$1"
  grep -E "^${key}=" "$ENV_FILE" | head -n1 | cut -d'=' -f2- | tr -d "'\""
}

API_PORT="$(get_env_value API_PORT)"
WEB_PORT="$(get_env_value WEB_PORT)"
KEYCLOAK_PORT="$(get_env_value KEYCLOAK_PORT)"

if [[ -z "$API_PORT" || -z "$WEB_PORT" || -z "$KEYCLOAK_PORT" ]]; then
  echo -e "\033[0;31m✖${NC} Não foi possível ler API_PORT, WEB_PORT ou KEYCLOAK_PORT do .env."
  echo    "  Verifique se o arquivo .env está preenchido corretamente."
  exit 1
fi

# ── Construção das URLs públicas do Codespaces ─────────────────────────────

CS_BASE="${CODESPACE_NAME}.app.github.dev"
API_URL="https://${CODESPACE_NAME}-${API_PORT}.${CS_BASE#*.}"
WEB_URL="https://${CODESPACE_NAME}-${WEB_PORT}.${CS_BASE#*.}"
KEYCLOAK_URL="https://${CODESPACE_NAME}-${KEYCLOAK_PORT}.${CS_BASE#*.}"

# Corrigindo: o padrão real é <name>-<port>.app.github.dev
API_URL="https://${CODESPACE_NAME}-${API_PORT}.app.github.dev"
WEB_URL="https://${CODESPACE_NAME}-${WEB_PORT}.app.github.dev"
KEYCLOAK_URL="https://${CODESPACE_NAME}-${KEYCLOAK_PORT}.app.github.dev"

info "Codespace detectado: ${BOLD}${CODESPACE_NAME}${NC}"
info "Ajustando URLs no .env para o ambiente Codespaces..."
echo ""
echo "  API_BASE_URL      → $API_URL"
echo "  WEB_BASE_URL      → $WEB_URL"
echo "  KEYCLOAK_BASE_URL → $KEYCLOAK_URL"
echo ""

# ── Substituição idempotente no .env ──────────────────────────────────────

set_env_value() {
  local key="$1"
  local value="$2"
  # Substitui a linha existente; se não existir, adiciona ao final
  if grep -qE "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

set_env_value "API_BASE_URL"      "$API_URL"
set_env_value "WEB_BASE_URL"      "$WEB_URL"
set_env_value "KEYCLOAK_BASE_URL" "$KEYCLOAK_URL"

ok ".env atualizado com as URLs públicas do Codespaces."
echo ""
warn "Lembre-se de:"
echo "  1. Tornar as portas ${API_PORT}, ${WEB_PORT} e ${KEYCLOAK_PORT} públicas no painel de Portas do Codespaces."
echo "  2. Reiniciar o servidor após esta alteração: pnpm dev"
echo ""
