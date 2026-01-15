# 📤 Estratégia de Deploy - Participa DF

## Overview

Este projeto usa uma **estratégia de monorepo com deployments seletivos**:

```
┌─────────────────────────────────────────────────────┐
│        Git Push (main)                              │
├─────────────────────────────────────────────────────┤
│                                                     │
├─ origin (GitHub)           → Monorepo completo ✅   │
│  └─ backend/ + frontend/ + docs + root files       │
│                                                     │
├─ hf (HuggingFace Spaces)   → Backend apenas ⚠️      │
│  └─ Apenas backend/ (via subtree)                  │
│                                                     │
├─ GitHub Pages              → Frontend apenas ✅     │
│  └─ Deploy automático de frontend/ (Actions)       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Deployments

### 1. **GitHub** (Monorepo Completo)

**URL:** https://github.com/marinhothiago/desafio-participa-df

**Conteúdo:**
- `/backend/` - FastAPI PII detector
- `/frontend/` - React UI
- `/github/workflows/` - CI/CD
- Documentação (`README.md`, `AUDITORIA_CODIGO.md`, etc)
- Root config files (`.gitignore`, `.dockerignore`, `app.py`)

**Push Command:**
```bash
git push origin main
```

**Quando:** Sempre que fazer commit de qualquer parte do projeto

---

### 2. **HuggingFace Spaces** (Backend Apenas)

**URL:** https://huggingface.co/spaces/marinhothiago/participa-df-pii

**Conteúdo:**
- `/backend/api/` - FastAPI app
- `/backend/src/` - PII detection logic
- `/backend/requirements.txt` - Python dependencies
- `/backend/Dockerfile` - Container config
- `/backend/README.md` - Backend docs

**Push Command (Git Subtree):**
```bash
git subtree push --prefix backend hf main
```

**Quando:** Após atualizar `/backend/`

**Script Auxiliar:**
```bash
chmod +x deploy-hf.sh
./deploy-hf.sh
```

---

### 3. **GitHub Pages** (Frontend Apenas)

**URL:** https://marinhothiago.github.io/desafio-participa-df/

**Conteúdo:**
- React SPA built from `/frontend/`

**Setup (realizado em GitHub Actions):**
1. Build: `npm run build` em `/frontend/`
2. Deploy: Publicar em branch `gh-pages`

**Quando:** Automático a cada push em `main` (via GitHub Actions)

---

## Workflow Completo

### Para atualizar Backend:

```bash
# 1. Fazer alterações em /backend/
cd backend
# ... editar código ...

# 2. Commitar (na raiz do projeto)
cd ..
git add backend/
git commit -m "feat: update PII detector logic"

# 3. Push para GitHub (monorepo)
git push origin main

# 4. Deploy para HuggingFace (subtree)
./deploy-hf.sh
```

### Para atualizar Frontend:

```bash
# 1. Fazer alterações em /frontend/
cd frontend
# ... editar código ...

# 2. Commitar (na raiz do projeto)
cd ..
git add frontend/
git commit -m "feat: add new UI component"

# 3. Push para GitHub (e GitHub Pages via Actions)
git push origin main
# GitHub Actions cuida do deploy para Pages automaticamente
```

### Para atualizar Documentação:

```bash
# 1. Editar README.md, GUIA_AVALIADOR.md, etc.
git add README.md GUIA_AVALIADOR.md

# 2. Commit
git commit -m "docs: update guides and documentation"

# 3. Push para GitHub
git push origin main
```

---

## Git Remotes

### Verificar remotes:

```bash
git remote -v
```

**Output esperado:**
```
origin  https://github.com/marinhothiago/desafio-participa-df.git (fetch)
origin  https://github.com/marinhothiago/desafio-participa-df.git (push)
hf      https://huggingface.co/spaces/marinhothiago/participa-df-pii (fetch)
hf      https://huggingface.co/spaces/marinhothiago/participa-df-pii (push)
```

### Adicionar remotes (se necessário):

```bash
# GitHub
git remote add origin https://github.com/marinhothiago/desafio-participa-df.git

# HuggingFace
git remote add hf https://huggingface.co/spaces/marinhothiago/participa-df-pii
```

---

## Troubleshooting

### Erro: "rejected...non-fast-forward"

**Causa:** HF remote tem histórico diferente

**Solução:**
```bash
git push hf HEAD:main --force-with-lease
```

---

### Git Subtree não empurra nada

**Causa:** Sem mudanças em `backend/` desde last push

**Solução:** Fazer alterações em `backend/` primeiro:
```bash
echo "# Trigger" >> backend/README.md
git commit -am "chore: trigger HF deploy"
./deploy-hf.sh
```

---

### Verificar se HuggingFace recebeu apenas backend/

1. Visitar: https://huggingface.co/spaces/marinhothiago/participa-df-pii
2. Em "Files and versions", deve aparecer:
   - ✅ `api/`
   - ✅ `src/`
   - ✅ `requirements.txt`
   - ✅ `Dockerfile`
   - ❌ NÃO deve ter `frontend/`
   - ❌ NÃO deve ter `node_modules/`

---

## CI/CD Pipelines

### GitHub Actions (`.github/workflows/`)

**Triggers:**
- `main` branch push
- Pull requests

**Jobs:**
1. **Lint/Format Check** - Valida código Python/TypeScript
2. **Tests** - Roda testes backend e frontend
3. **GitHub Pages Deploy** - Deploy frontend automaticamente

**Monitorar:** https://github.com/marinhothiago/desafio-participa-df/actions

---

## Resumo: Quem recebe o quê?

| Destino | Conteúdo | Trigger | Método |
|---------|----------|---------|--------|
| **GitHub** | Monorepo completo | `git push origin main` | Push direto |
| **HuggingFace** | Apenas `backend/` | `./deploy-hf.sh` | Git subtree |
| **GitHub Pages** | Apenas `frontend/` | Automático (Actions) | Build + deploy |

---

## Referências

- [Git Subtree Documentation](https://git-scm.com/book/en/v2/Git-Tools-Subtrees)
- [HuggingFace Spaces Docs](https://huggingface.co/docs/hub/spaces)
- [GitHub Pages Docs](https://pages.github.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

*Última atualização: 2024*
