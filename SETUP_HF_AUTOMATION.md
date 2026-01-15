# 🔑 Configuração: Deploy Automático para HuggingFace

Para que o GitHub Actions faça deploy automático para HuggingFace Spaces, é necessário configurar um **token de acesso**.

## 📋 Pré-requisitos

- ✅ Account no HuggingFace
- ✅ Acesso de escrita à Space `participa-df-pii`
- ✅ Repositório no GitHub

## 🔄 Passo a Passo

### 1. Criar Token no HuggingFace

**Local:** https://huggingface.co/settings/tokens

1. Clique em **"New token"**
2. Configure:
   - **Name:** `github-actions-deploy` (ou similar)
   - **Type:** `write` (necessário para push)
   - **Scope:** Selecion apenas **Spaces**

3. Clique em **"Create token"**
4. **Copie o token** (ele nunca será mostrado novamente!)

**Token terá formato:** `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Adicionar Secret no GitHub

**Local:** https://github.com/marinhothiago/desafio-participa-df/settings/secrets/actions

1. Clique em **"New repository secret"**
2. Configure:
   - **Name:** `HF_TOKEN`
   - **Value:** Cole o token copiado

3. Clique em **"Add secret"**

## ✅ Validar Configuração

Após configurar, faça um teste:

```bash
# 1. Faça uma mudança pequena no backend
echo "# teste" >> backend/README.md

# 2. Faça commit
git add backend/README.md
git commit -m "test: validate HF auto-deploy"

# 3. Faça push
git push origin main

# 4. Acompanhe em: https://github.com/marinhothiago/desafio-participa-df/actions
```

Se tudo estiver OK, verá:
- ✅ Workflow `Deploy Backend to HuggingFace Spaces` iniciado
- ✅ Steps completados com sucesso
- ✅ HuggingFace Space atualizado

## 🔐 Segurança

**O token é secreto!** GitHub não o expõe em logs públicos.

Para revogar acesso:
1. Ir a https://huggingface.co/settings/tokens
2. Clique no token criado
3. Clique em **"Delete"**
4. Crie novo token se necessário

## 🛠️ Troubleshooting

### Erro: "Authentication failed"
- Verificar se `HF_TOKEN` está configurado
- Verificar se o token é válido
- Regenerar token se antigo

### Erro: "Permission denied"
- Verificar se token tem escrita em Spaces
- Verificar se URL da Space está correta

### Workflow não dispara
- Verificar se push foi em `main` branch
- Verificar se mudanças tocaram pasta `backend/`
- Verificar arquivo `.github/workflows/deploy-hf.yml` existe

## 📊 Fluxo Automático

```
Desenvolvedor faz push em /backend/
        ↓
GitHub Actions detecta mudança
        ↓
Workflow dispara automaticamente
        ↓
Git subtree split de /backend/
        ↓
Push para HuggingFace com HF_TOKEN
        ↓
HuggingFace rebuild automático
        ↓
✅ Deploy concluído!
```

## 🚀 Manual Deploy (sem GitHub Actions)

Se quiser fazer deploy manualmente do seu computador:

```bash
# Opção 1: Via script (simples)
./deploy-hf.sh

# Opção 2: Via git subtree direto (avançado)
git subtree push --prefix backend hf main
git subtree push --prefix backend hf main --force  # Se conflitar
```

## 📚 Referências

- [HuggingFace Tokens](https://huggingface.co/docs/hub/security-tokens)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
