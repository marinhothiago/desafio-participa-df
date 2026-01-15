#!/bin/bash
# Script para deploy seletivo do backend para HuggingFace Spaces
# 
# Propósito:
#   - Deploy APENAS do backend/ para https://huggingface.co/spaces/marinhothiago/participa-df-pii
#   - GitHub (origin) recebe monorepo completo
#   - GitHub (hf) recebe apenas backend/
#
# Uso:
#   chmod +x deploy-hf.sh
#   ./deploy-hf.sh

set -e

echo "🚀 Iniciando deploy seletivo para HuggingFace Spaces..."
echo ""

# Verificar se estamos em um repo git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Não é um repositório git"
    exit 1
fi

# Verificar se backend/ existe
if [ ! -d "backend" ]; then
    echo "❌ Erro: Diretório backend/ não encontrado"
    exit 1
fi

# Fazer subtree push
echo "📤 Fazendo push do backend/ para HuggingFace (git subtree)..."
echo ""

git subtree push --prefix backend hf main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy bem-sucedido!"
    echo ""
    echo "O backend foi enviado para: https://huggingface.co/spaces/marinhothiago/participa-df-pii"
    echo ""
    echo "Próximos passos:"
    echo "  1. Visitar https://huggingface.co/spaces/marinhothiago/participa-df-pii"
    echo "  2. Verificar que apenas backend/ está presente"
    echo "  3. Aguardar rebuild automático da Space"
else
    echo ""
    echo "⚠️ Erro no subtree push. Possíveis causas:"
    echo "  1. HF remote tem histórico conflitante"
    echo "  2. Sem acesso à HuggingFace"
    echo ""
    echo "Soluções:"
    echo "  1. Se HF tem bloat, fazer hard reset:"
    echo "     git push hf HEAD:main --force-with-lease"
    echo "  2. Verificar credenciais de HuggingFace"
    exit 1
fi

# Script auxiliar para forçar update (se subtree não funcionar)
cat > deploy-hf-force.sh << 'EOF'
#!/bin/bash
# Força push do backend/ eliminando histórico conflitante
# ⚠️ USE APENAS SE SUBTREE FALHAR

echo "⚠️ AVISO: Isso vai reescrever o histórico em HuggingFace!"
echo "Continuar? (s/n)"
read -r response

if [ "$response" != "s" ] && [ "$response" != "S" ]; then
    echo "Cancelado."
    exit 0
fi

# Limpar e rebuild HF
git push hf HEAD:main --force-with-lease

echo "✅ Força push completo"
EOF

chmod +x deploy-hf-force.sh

echo ""
echo "📝 Script de deploy criado: deploy-hf.sh"
echo "📝 Script de força: deploy-hf-force.sh"
