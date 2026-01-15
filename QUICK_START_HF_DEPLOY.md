# 🚀 Guia Rápido: Deploy Seletivo HuggingFace

**Tempo de leitura:** 3 min  
**Tempo de implementação:** 5 min (setup) + 1 min (deploy)

---

## 🎯 O que é?

Deploy seletivo significa que **HuggingFace Spaces recebe APENAS `/backend/`**, não todo o monorepo.

Antes:
```
GitHub push /backend/
  ↓
HuggingFace recebe: frontend/ + backend/ + .github/ + tudo ❌
```

Depois:
```
GitHub push /backend/
  ↓
HuggingFace recebe: apenas backend/ ✅
```

---

## ⚡ Quick Start (5 minutos)

### Passo 1: Setup Token (5 min)

1. Abrir: https://huggingface.co/settings/tokens
2. Clique: **"New token"**
3. Configurar:
   - Name: `github-actions-deploy`
   - Type: `write`
   - Scope: selecione **Spaces**
4. Clique: **"Create token"**
5. Copie o token (formato: `hf_xxxxx...`)

6. Abrir GitHub → Settings → Secrets → Actions
7. Clique: **"New repository secret"**
8. Configurar:
   - Name: `HF_TOKEN`
   - Value: [colar token copiado]
9. Clique: **"Add secret"**

✅ **Pronto!**

### Passo 2: Deploy

Escolha um método:

**Opção A: Automático (Recomendado)**
```bash
git push origin main  # Ao detectar mudança em /backend/
                      # → GitHub Actions faz deploy automaticamente
```

**Opção B: Manual**
```bash
./deploy-hf.sh        # Deploy na hora
./deploy-hf.sh --force  # Se tiver conflito
```

---

## 📚 Documentos Relacionados

| Doc | Tempo | Para quem |
|-----|-------|----------|
| [SETUP_HF_AUTOMATION.md](./SETUP_HF_AUTOMATION.md) | 5 min | Setup completo do token |
| [VALIDACAO_SUBTREE_DEPLOY.md](./VALIDACAO_SUBTREE_DEPLOY.md) | 10 min | Testes e validação |
| [DEPLOY_STRATEGY.md](./DEPLOY_STRATEGY.md) | 5 min | Referência geral |

---

## 🔍 Como Verificar

Após fazer deploy, verificar que HuggingFace tem:

1. Abrir: https://huggingface.co/spaces/marinhothiago/participa-df-pii
2. Clique: **"Files and versions"**
3. Verificar:
   - ✅ `api/` está presente
   - ✅ `src/` está presente
   - ❌ `frontend/` NÃO está presente
   - ❌ `.github/` NÃO está presente

---

## 🎓 Conceitos

### Git Subtree Split

Cria uma branch com APENAS uma subpasta:

```bash
git subtree split --prefix backend --branch hf-backend
# Resultado: branch 'hf-backend' contém apenas /backend/
```

### Force Push

Sobrescreve histórico remoto (cuidado!):

```bash
git push hf hf-backend:main --force
# Resultado: HF recebe apenas /backend/, histórico limpo
```

---

## ❓ FAQ

**P: Preciso fazer isso toda vez que mudo /backend/?**  
R: Não! GitHub Actions faz automaticamente ao fazer `git push`.

**P: E se eu mudar /frontend/?**  
R: Workflow não dispara (só observa /backend/). HF não é atualizado.

**P: Posso fazer deploy manual?**  
R: Sim! Use `./deploy-hf.sh`

**P: O que é a flag --force?**  
R: Sobrescreve histórico HF se tiver conflito. Use apenas se necessário.

**P: Como revogar acesso?**  
R: Deletar token em https://huggingface.co/settings/tokens

---

## 🚨 Troubleshooting

**Erro: "HF_TOKEN not found"**
- Setup não completo, ver [SETUP_HF_AUTOMATION.md](./SETUP_HF_AUTOMATION.md)

**Erro: "Push rejected"**
- Use `./deploy-hf.sh --force`

**HF ainda tem frontend/?**
- Force push foi com histórico completo, usar `./deploy-hf.sh --force`

Ver mais em [VALIDACAO_SUBTREE_DEPLOY.md](./VALIDACAO_SUBTREE_DEPLOY.md)

---

## ✅ Checklist

- [ ] Token criado em HuggingFace
- [ ] Token adicionado como `HF_TOKEN` em GitHub Secrets
- [ ] Primeiro push de `/backend/` realizado
- [ ] GitHub Actions completa com sucesso
- [ ] HuggingFace tem APENAS `/backend/`
- [ ] Frontend ainda NO GitHub (não foi afetado)

---

## 🔗 Links Úteis

- 🎯 Projeto: https://github.com/marinhothiago/desafio-participa-df
- 🚀 Space HF: https://huggingface.co/spaces/marinhothiago/participa-df-pii
- 📊 Actions: https://github.com/marinhothiago/desafio-participa-df/actions
- 🔐 Tokens HF: https://huggingface.co/settings/tokens

---

**Pronto para fazer deploy? 🚀**

1. Se primeira vez: Siga Quick Start acima (5 min)
2. Se já configurado: `git push origin main`
3. Se tiver erro: Ver [VALIDACAO_SUBTREE_DEPLOY.md](./VALIDACAO_SUBTREE_DEPLOY.md)
