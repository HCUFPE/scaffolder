#!/usr/bin/env bash
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PROJECT_NAME=""
TARGET_DIR=""
PROJECT_DESCRIPTION=""
DB_NAME=""
API_PORT="3000"
WEB_PORT="5173"
DB_PORT="5432"
KEYCLOAK_PORT="8080"
ADMIN_EMAIL=""
ADMIN_NAME="Administrador"
GIT_REMOTE_URL=""
SKIP_INSTALL=0
SKIP_GIT=0
BOOTSTRAP=0

info()  { echo -e "${CYAN}⚡${NC} $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
fail()  { echo -e "${RED}✖${NC} $1"; }
bold()  { echo -e "${BOLD}$1${NC}"; }

usage() {
  cat <<'EOF'
Uso: ./setup.sh [opções]

Cria um novo projeto derivado a partir do template AppStart.

Opções:
  --name <kebab-case>         Nome do projeto
  --dir <caminho>             Diretório de destino
  --description <texto>       Descrição do projeto
  --db-name <snake_case>      Nome do banco de dados
  --api-port <porta>          Porta da API (padrão: 3000)
  --web-port <porta>          Porta do frontend (padrão: 5173)
  --db-port <porta>           Porta publicada do PostgreSQL (padrão: 5432)
  --keycloak-port <porta>     Porta publicada do Keycloak (padrão: 8080)
  --admin-email <email>       E-mail do administrador inicial
  --admin-name <texto>        Nome do administrador inicial
  --git-remote <url>          Remote Git opcional para o projeto derivado
  --skip-install              Não executa pnpm install
  --skip-git                  Não executa git init
  --bootstrap                 Executa pnpm setup ao final
  -h, --help                  Mostra esta ajuda

Exemplo interativo:
  ./setup.sh

Exemplo não interativo:
  ./setup.sh \
    --name meu-projeto \
    --dir ../meu-projeto \
    --description "Projeto da disciplina" \
    --db-name meu_projeto \
    --admin-email admin@meu-projeto.local
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)
      PROJECT_NAME="${2:-}"
      shift 2
      ;;
    --dir)
      TARGET_DIR="${2:-}"
      shift 2
      ;;
    --description)
      PROJECT_DESCRIPTION="${2:-}"
      shift 2
      ;;
    --db-name)
      DB_NAME="${2:-}"
      shift 2
      ;;
    --api-port)
      API_PORT="${2:-}"
      shift 2
      ;;
    --web-port)
      WEB_PORT="${2:-}"
      shift 2
      ;;
    --db-port)
      DB_PORT="${2:-}"
      shift 2
      ;;
    --keycloak-port)
      KEYCLOAK_PORT="${2:-}"
      shift 2
      ;;
    --admin-email)
      ADMIN_EMAIL="${2:-}"
      shift 2
      ;;
    --admin-name)
      ADMIN_NAME="${2:-}"
      shift 2
      ;;
    --git-remote)
      GIT_REMOTE_URL="${2:-}"
      shift 2
      ;;
    --skip-install)
      SKIP_INSTALL=1
      shift
      ;;
    --skip-git)
      SKIP_GIT=1
      shift
      ;;
    --bootstrap)
      BOOTSTRAP=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Opção desconhecida: $1"
      echo
      usage
      exit 1
      ;;
  esac
done

if [[ ! -f "$ROOT_DIR/package.json" || ! -f "$ROOT_DIR/.env.example" || ! -f "$ROOT_DIR/check_dependencies.sh" ]]; then
  fail "Parece que você não está na raiz do template AppStart."
  exit 1
fi

validate_project_name() {
  [[ "$1" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]
}

validate_db_name() {
  [[ "$1" =~ ^[a-z0-9_]+$ ]]
}

validate_port() {
  [[ "$1" =~ ^[0-9]+$ ]] && (( "$1" >= 1 && "$1" <= 65535 ))
}

require_value() {
  local current="$1"
  local prompt="$2"
  local default_value="${3:-}"
  local result="$current"

  if [[ -n "$result" ]]; then
    printf '%s' "$result"
    return 0
  fi

  if [[ ! -t 0 ]]; then
    fail "Parâmetro obrigatório ausente em modo não interativo: $prompt"
    exit 1
  fi

  read -r -p "$prompt" result
  result="${result:-$default_value}"
  printf '%s' "$result"
}

info "Validando pré-requisitos do ambiente..."
bash "$ROOT_DIR/check_dependencies.sh"

if [[ -t 1 ]]; then
  clear
fi
bold ""
bold "  ┌─────────────────────────────────────────────┐"
bold "  │                AppStart                     │"
bold "  │       Scaffolding guiado de projeto         │"
bold "  └─────────────────────────────────────────────┘"
echo ""

PROJECT_NAME="$(require_value "$PROJECT_NAME" "Nome do projeto (kebab-case): ")"
while ! validate_project_name "$PROJECT_NAME"; do
  warn "O nome deve estar em kebab-case (ex: meu-projeto)."
  PROJECT_NAME="$(require_value "" "Nome do projeto (kebab-case): ")"
done

DEFAULT_TARGET_DIR="../$PROJECT_NAME"
TARGET_DIR="$(require_value "$TARGET_DIR" "Diretório de destino [${DEFAULT_TARGET_DIR}]: " "$DEFAULT_TARGET_DIR")"

if [[ -e "$TARGET_DIR" && -n "$(find "$TARGET_DIR" -mindepth 1 -maxdepth 1 2>/dev/null)" ]]; then
  fail "O diretório '$TARGET_DIR' já existe e não está vazio."
  exit 1
fi

DEFAULT_DESCRIPTION="Aplicação derivada de $PROJECT_NAME baseada no template AppStart."
PROJECT_DESCRIPTION="$(require_value "$PROJECT_DESCRIPTION" "Descrição do projeto [${DEFAULT_DESCRIPTION}]: " "$DEFAULT_DESCRIPTION")"

DEFAULT_DB_NAME="${PROJECT_NAME//-/_}"
DB_NAME="$(require_value "$DB_NAME" "Nome do banco de dados (snake_case) [${DEFAULT_DB_NAME}]: " "$DEFAULT_DB_NAME")"
while ! validate_db_name "$DB_NAME"; do
  warn "O nome do banco deve usar apenas letras minúsculas, números e underscore."
  DB_NAME="$(require_value "" "Nome do banco de dados (snake_case) [${DEFAULT_DB_NAME}]: " "$DEFAULT_DB_NAME")"
done

API_PORT="$(require_value "$API_PORT" "Porta da API [3000]: " "3000")"
WEB_PORT="$(require_value "$WEB_PORT" "Porta do frontend [5173]: " "5173")"
DB_PORT="$(require_value "$DB_PORT" "Porta publicada do PostgreSQL [5432]: " "5432")"
KEYCLOAK_PORT="$(require_value "$KEYCLOAK_PORT" "Porta publicada do Keycloak [8080]: " "8080")"
for entry in "$API_PORT:API_PORT" "$WEB_PORT:WEB_PORT" "$DB_PORT:POSTGRES_PORT" "$KEYCLOAK_PORT:KEYCLOAK_PORT"; do
  value="${entry%%:*}"
  label="${entry##*:}"
  if ! validate_port "$value"; then
    fail "Valor inválido para ${label}: ${value}. Informe uma porta entre 1 e 65535."
    exit 1
  fi
done

DEFAULT_ADMIN_EMAIL="admin@${PROJECT_NAME}.local"
ADMIN_EMAIL="$(require_value "$ADMIN_EMAIL" "E-mail do administrador inicial [${DEFAULT_ADMIN_EMAIL}]: " "$DEFAULT_ADMIN_EMAIL")"
DEFAULT_ADMIN_NAME="Administrador"
ADMIN_NAME="$(require_value "$ADMIN_NAME" "Nome do administrador inicial [${DEFAULT_ADMIN_NAME}]: " "$DEFAULT_ADMIN_NAME")"

if [[ "$SKIP_INSTALL" -eq 1 && "$BOOTSTRAP" -eq 1 ]]; then
  fail "--bootstrap exige instalação de dependências. Remova --skip-install ou não use --bootstrap."
  exit 1
fi

info "Criando projeto em '${TARGET_DIR}'..."
mkdir -p "$TARGET_DIR"

tar -cf - \
  --exclude='./.git' \
  --exclude='./node_modules' \
  --exclude='*/dist/' \
  --exclude='./.env' \
  --exclude='./.turbo' \
  --exclude='./coverage' \
  --exclude='./repos' \
  --exclude='./.agent' \
  --exclude='./.pi' \
  --exclude='./openspec/changes' \
  --exclude='./openspec/specs' \
  --exclude='./setup.sh' \
  --exclude='./SRD.md' \
  . | (cd "$TARGET_DIR" && tar -xf -)

mkdir -p "$TARGET_DIR/openspec/changes/archive" "$TARGET_DIR/openspec/specs"
cp "$TARGET_DIR/.env.example" "$TARGET_DIR/.env"
ok "Template copiado sem alterar a base original"

info "Aplicando configuração inicial do projeto..."
node - "$TARGET_DIR" "$PROJECT_NAME" "$PROJECT_DESCRIPTION" "$DB_NAME" "$API_PORT" "$WEB_PORT" "$DB_PORT" "$KEYCLOAK_PORT" "$ADMIN_EMAIL" "$ADMIN_NAME" <<'NODE'
const fs = require('node:fs');
const path = require('node:path');

const [targetDir, projectName, projectDescription, dbName, apiPort, webPort, dbPort, keycloakPort, adminEmail, adminName] = process.argv.slice(2);
const title = projectName
  .split('-')
  .filter(Boolean)
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join(' ');
const slug = projectName.replace(/-/g, '_');
const dbUser = dbName;
const dbPassword = `${dbName}_dev_password`;
const cookieName = `${slug}_session`;
const databaseUrl = `postgresql://${dbUser}:${dbPassword}@localhost:${dbPort}/${dbName}?schema=public`;

function readJson(relativePath) {
  const fullPath = path.join(targetDir, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function writeJson(relativePath, value) {
  const fullPath = path.join(targetDir, relativePath);
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
}

function updateText(relativePath, replacer) {
  const fullPath = path.join(targetDir, relativePath);
  if (!fs.existsSync(fullPath)) return;
  const current = fs.readFileSync(fullPath, 'utf8');
  fs.writeFileSync(fullPath, replacer(current));
}

function updateEnvFile(relativePath) {
  const fullPath = path.join(targetDir, relativePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');

  const replacements = {
    NODE_ENV: 'development',
    API_PORT: apiPort,
    API_BASE_URL: `http://localhost:${apiPort}`,
    WEB_PORT: webPort,
    WEB_BASE_URL: `http://localhost:${webPort}`,
    POSTGRES_DB: dbName,
    POSTGRES_USER: dbUser,
    POSTGRES_PASSWORD: dbPassword,
    POSTGRES_PORT: dbPort,
    KEYCLOAK_DB_NAME: `${dbName}_keycloak`,
    DATABASE_URL: databaseUrl,
    KEYCLOAK_PORT: keycloakPort,
    KEYCLOAK_BASE_URL: `http://localhost:${keycloakPort}`,
    KEYCLOAK_REALM: projectName,
    KEYCLOAK_CLIENT_ID: `${projectName}-server`,
    KEYCLOAK_CLIENT_SECRET: `${slug}_dev_client_secret`,
    KEYCLOAK_ADMIN_CLIENT_ID: `${projectName}-admin`,
    KEYCLOAK_ADMIN_CLIENT_SECRET: `${slug}_dev_admin_client_secret`,
    SESSION_COOKIE_NAME: cookieName,
    DEV_ADMIN_EMAIL: adminEmail,
    DEV_ADMIN_PASSWORD: 'ChangeMe123456!',
    DEV_ADMIN_NAME: adminName,
    DEV_USER_EMAIL: `user@${projectName}.local`,
    DEV_USER_PASSWORD: 'ChangeMe123456!',
    DEV_USER_NAME: 'Usuário',
  };

  for (const [key, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    if (pattern.test(content)) {
      content = content.replace(pattern, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(fullPath, content.endsWith('\n') ? content : `${content}\n`);
}

const rootPackage = readJson('package.json');
rootPackage.name = projectName;
rootPackage.description = projectDescription;
if (rootPackage.scripts) {
  delete rootPackage.scripts.scaffold;
}
writeJson('package.json', rootPackage);

const apiPackagePath = path.join(targetDir, 'apps/api/package.json');
if (fs.existsSync(apiPackagePath)) {
  const apiPackage = JSON.parse(fs.readFileSync(apiPackagePath, 'utf8'));
  apiPackage.name = `@${projectName}/api`;
  fs.writeFileSync(apiPackagePath, `${JSON.stringify(apiPackage, null, 2)}\n`);
}

const webPackagePath = path.join(targetDir, 'apps/web/package.json');
if (fs.existsSync(webPackagePath)) {
  const webPackage = JSON.parse(fs.readFileSync(webPackagePath, 'utf8'));
  webPackage.name = `@${projectName}/web`;
  fs.writeFileSync(webPackagePath, `${JSON.stringify(webPackage, null, 2)}\n`);
}

updateEnvFile('.env.example');
updateEnvFile('.env');

updateText('README.md', () => `# ${title}\n\n${projectDescription}\n\nProjeto gerado a partir do template AppStart.\n\n## Primeiro uso\n\n\`\`\`bash\ncorepack enable\npnpm install\npnpm setup\npnpm dev\n\`\`\`\n\n## Scripts principais\n\n- \`pnpm setup\`: sobe PostgreSQL e Keycloak, aplica migrations e executa o seed\n- \`pnpm dev\`: inicia API e frontend em paralelo\n- \`pnpm db:up\`: sobe o PostgreSQL local\n- \`pnpm db:down\`: para o PostgreSQL sem remover o volume\n- \`pnpm auth:up\`: provisiona e sobe o Keycloak local\n- \`pnpm auth:down\`: para o Keycloak sem remover dados\n- \`pnpm db:migrate\`: aplica migrations Prisma no ambiente local\n- \`pnpm db:check\`: valida schema e migrations com um banco de shadow\n- \`pnpm db:deploy\`: aplica migrations em produção com prisma migrate deploy\n- \`pnpm db:seed\`: executa o seed de desenvolvimento\n- \`pnpm db:studio\`: abre o Prisma Studio\n\n## Configuração inicial\n\nRevise o arquivo \`.env\` gerado automaticamente antes de compartilhar o projeto.\n\n## Usuários de desenvolvimento\n\nAs credenciais são definidas pelas variáveis \`DEV_ADMIN_*\` e \`DEV_USER_*\` no \`.env\`.\n`);

updateText('compose.yaml', (text) => text
  .replace(/appstart-postgres/g, `${projectName}-postgres`)
  .replace(/appstart-keycloak/g, `${projectName}-keycloak`));
updateText('apps/web/dev-server.mjs', (text) => text.replace(/AppStart/g, title));
NODE
ok "Configuração inicial aplicada"

if [[ "$SKIP_GIT" -eq 0 ]]; then
  info "Inicializando repositório Git..."
  (
    cd "$TARGET_DIR"
    git init >/dev/null 2>&1
    if [[ -n "$GIT_REMOTE_URL" ]]; then
      git remote add origin "$GIT_REMOTE_URL"
    fi
  )
  ok "Repositório Git inicializado"
else
  warn "git init ignorado por --skip-git"
fi

if [[ "$SKIP_INSTALL" -eq 0 ]]; then
  info "Instalando dependências com pnpm..."
  (
    cd "$TARGET_DIR"
    corepack enable >/dev/null 2>&1 || true
    pnpm install
  )
  ok "Dependências instaladas"
else
  warn "Instalação ignorada por --skip-install"
fi

if [[ "$BOOTSTRAP" -eq 1 ]]; then
  info "Executando bootstrap inicial do ambiente..."
  (
    cd "$TARGET_DIR"
    pnpm setup
  )
  ok "Bootstrap concluído"
fi

PROJECT_PATH="$(cd "$TARGET_DIR" && pwd)"
echo ""
ok "Projeto '${PROJECT_NAME}' criado com sucesso!"
echo ""
info "Próximos passos:"
echo ""
echo "    cd ${PROJECT_PATH}"
if [[ "$SKIP_INSTALL" -eq 1 ]]; then
  echo "    corepack enable"
  echo "    pnpm install"
fi
if [[ "$BOOTSTRAP" -eq 0 ]]; then
  echo "    pnpm setup"
fi
echo "    pnpm dev"
echo ""
if [[ -n "$GIT_REMOTE_URL" ]]; then
  info "Remote Git configurado: ${GIT_REMOTE_URL}"
fi
bold "  Template original preservado em: ${ROOT_DIR}"
