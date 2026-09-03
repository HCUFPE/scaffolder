#!/usr/bin/env bash

# Script para verificar as dependências de desenvolvimento necessárias para o projeto AppStart
# Lê o SRD.md para saber quais ferramentas são necessárias e relata as ausentes
# com dicas de instalação.

set -euo pipefail

# Define required commands and optional version requirements
# Format: "command|friendly name|install hint"
REQUIRED=(
  "git|Git"
  "docker|Docker"
  "node|Node.js"
  "corepack|Corepack"
  "pnpm|pnpm"
)

missing=()

detect_distro() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    case "$ID" in
      ubuntu|debian) PKG_MANAGER="apt" ;;
      fedora) PKG_MANAGER="dnf" ;;
      rhel|centos) PKG_MANAGER="yum" ;;
      arch) PKG_MANAGER="pacman" ;;
      opensuse*) PKG_MANAGER="zypper" ;;
      *) PKG_MANAGER="unknown" ;;
    esac
  else
    PKG_MANAGER="unknown"
  fi
}

install_hint() {
  local cmd="$1"
  case "$PKG_MANAGER" in
    apt)
      case "$cmd" in
        git) echo "sudo apt-get update && sudo apt-get install -y git" ;;
        docker) echo "sudo apt-get update && sudo apt-get install -y docker.io" ;;
        node) echo "sudo apt-get update && sudo apt-get install -y nodejs npm && sudo npm i -g corepack && corepack enable" ;;
        corepack) echo "sudo npm i -g corepack && corepack enable" ;;
        pnpm) echo "corepack enable && corepack prepare pnpm@latest --activate" ;;
        *) echo "Consulte a documentação da sua distribuição para instalar $cmd" ;;
      esac
      ;;
    dnf|yum)
      case "$cmd" in
        git) echo "sudo $PKG_MANAGER install -y git" ;;
        docker) echo "sudo $PKG_MANAGER install -y docker" ;;
        node) echo "sudo $PKG_MANAGER install -y nodejs npm && sudo npm i -g corepack && corepack enable" ;;
        corepack) echo "sudo npm i -g corepack && corepack enable" ;;
        pnpm) echo "corepack enable && corepack prepare pnpm@latest --activate" ;;
        *) echo "Consulte a documentação da sua distribuição para instalar $cmd" ;;
      esac
      ;;
    pacman)
      case "$cmd" in
        git) echo "sudo pacman -S --noconfirm git" ;;
        docker) echo "sudo pacman -S --noconfirm docker" ;;
        node) echo "sudo pacman -S --noconfirm nodejs npm && sudo npm i -g corepack && corepack enable" ;;
        corepack) echo "sudo npm i -g corepack && corepack enable" ;;
        pnpm) echo "corepack enable && corepack prepare pnpm@latest --activate" ;;
        *) echo "Consulte a documentação da sua distribuição para instalar $cmd" ;;
      esac
      ;;
    zypper)
      case "$cmd" in
        git) echo "sudo zypper install -y git" ;;
        docker) echo "sudo zypper install -y docker" ;;
        node) echo "sudo zypper install -y nodejs npm && sudo npm i -g corepack && corepack enable" ;;
        corepack) echo "sudo npm i -g corepack && corepack enable" ;;
        pnpm) echo "corepack enable && corepack prepare pnpm@latest --activate" ;;
        *) echo "Consulte a documentação da sua distribuição para instalar $cmd" ;;
      esac
      ;;
    *)
      echo "Consulte a documentação da sua distribuição para instalar $cmd"
      ;;
  esac
}

detect_distro

for entry in "${REQUIRED[@]}"; do
  IFS='|' read -r cmd friendly <<< "$entry"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    missing+=("$friendly")
    echo "[FALTANDO] $friendly"
    echo "    Dica: $(install_hint $cmd)"
    echo
  else
    echo "[OK] $friendly está instalado."
  fi
done

if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then
    echo "[OK] Docker Compose (plugin) está disponível."
  else
    missing+=("Docker Compose")
    echo "[FALTANDO] Docker Compose"
    echo "    Dica: instale/ative o plugin 'docker compose' da sua distribuição ou do Docker Desktop"
    echo
  fi

  if docker info >/dev/null 2>&1; then
    echo "[OK] Docker daemon está acessível."
  else
    missing+=("Docker daemon")
    echo "[INDISPONÍVEL] Docker daemon"
    echo "    Dica: inicie o Docker Desktop/daemon e verifique as permissões do usuário"
    echo
  fi
fi

if [ ${#missing[@]} -eq 0 ]; then
  echo "Todas as dependências necessárias estão presentes."
else
  printf '\nPor favor, instale as dependências faltantes antes de prosseguir.\n'
  echo "Você pode seguir as dicas acima ou consultar a documentação do projeto."
  exit 1
fi
