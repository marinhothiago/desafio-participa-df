#!/bin/bash
# Script para deploy seletivo do backend para HuggingFace Spaces via git subtree
# 
# Propósito:
#   - Deploy APENAS do backend/ para HuggingFace Spaces
#   - Usa git subtree split para isolamento completo
#   - GitHub (origin) recebe monorepo completo
#   - GitHub (hf) recebe apenas backend/ via subtree
#
# Uso:
#   chmod +x deploy-hf.sh
#   ./deploy-hf.sh [--force]
#
# Flags:
#   --force    Força push mesmo com conflitos (limpa histórico HF)
#
# Exemplo:
#   ./deploy-hf.sh              # Deploy normal
#   ./deploy-hf.sh --force      # Force push (limpa HF)

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
HF_BRANCH="hf-backend"
HF_REMOTE="hf"
HF_MAIN_BRANCH="main"
FORCE_PUSH="${1:---normal}"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       HuggingFace Deploy (Backend Only via Subtree)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# VALIDAÇÕES
# ============================================================================

# Verificar se estamos em um repo git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Erro: Não é um repositório git${NC}"
    exit 1
fi

# Verificar se backend/ existe
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório backend/ não encontrado${NC}"
    exit 1
fi

# Verificar remotes
if ! git remote get-url "$HF_REMOTE" >/dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Remote 'hf' não configurado${NC}"
    echo "Solução: git remote add hf https://huggingface.co/spaces/marinhothiago/participa-df-pii"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Aviso: Há mudanças não commitadas${NC}"
    echo "Por favor, faça commit antes de fazer deploy:"
    echo "  git add ."
    echo "  git commit -m 'Message'"
    exit 1
fi

echo -e "${GREEN}✅ Validações OK${NC}"
echo ""

# ============================================================================
# DEPLOY
# ============================================================================

echo -e "${BLUE}📤 Etapa 1: Criando subtree split do backend/...${NC}"
echo ""

# Criar branch temporária com apenas backend/
if git branch | grep -q "$HF_BRANCH"; then
    git branch -D "$HF_BRANCH" >/dev/null 2>&1
fi

SUBTREE_COMMIT=$(git subtree split --prefix backend --branch "$HF_BRANCH" 2>&1 | tail -1)

echo -e "${GREEN}✅ Subtree criado: $SUBTREE_COMMIT${NC}"
echo ""

echo -e "${BLUE}📤 Etapa 2: Fazendo push para HuggingFace...${NC}"
echo ""

if [ "$FORCE_PUSH" = "--force" ]; then
    echo -e "${YELLOW}⚠️  Modo: FORCE PUSH (vai limpar histórico HF)${NC}"
    git push "$HF_REMOTE" "$HF_BRANCH:$HF_MAIN_BRANCH" --force
else
    echo -e "${YELLOW}ℹ️  Modo: PUSH normal (fast-forward)${NC}"
    git push "$HF_REMOTE" "$HF_BRANCH:$HF_MAIN_BRANCH" 2>&1 | {
        if grep -q "rejected\|non-fast-forward"; then
            echo -e "${RED}❌ Push rejeitado (conflito de histórico)${NC}"
            echo ""
            echo "Tente com: ./deploy-hf.sh --force"
            exit 1
        else
            cat
        fi
    }
fi

echo ""
echo -e "${BLUE}📤 Etapa 3: Limpando branch temporária...${NC}"
git branch -D "$HF_BRANCH" >/dev/null 2>&1

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOY BEM-SUCEDIDO!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "📍 Localização:"
echo "   HuggingFace: https://huggingface.co/spaces/marinhothiago/participa-df-pii"
echo ""
echo "📋 Próximos passos:"
echo "   1. Visitar a URL acima"
echo "   2. Verificar que apenas backend/ está presente"
echo "   3. Aguardar rebuild automático"
echo ""
echo "✨ Conteúdo enviado:"
echo "   ✓ backend/api/"
echo "   ✓ backend/src/"
echo "   ✓ backend/requirements.txt"
echo "   ✓ backend/Dockerfile"
echo "   ✓ backend/README.md"
echo ""
echo -e "${YELLOW}❌ NÃO deve conter:${NC}"
echo "   ✗ frontend/"
echo "   ✗ .github/"
echo "   ✗ node_modules/"
echo ""
