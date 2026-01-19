# LLAMA Como Árbitro: Lógica de Ativação

## Status Atual (v9.5.0)
**LLAMA com Ativação Inteligente: Desativado por padrão, mas acionado AUTOMATICAMENTE em ambiguidades:**

### Configuração Atual
| Parâmetro | Valor |
|-----------|-------|
| **Modelo** | `meta-llama/Llama-3.2-3B-Instruct` |
| **Biblioteca** | `huggingface_hub` (InferenceClient) |
| **Padrão** | Desativado, mas AUTO em ambiguidades |
| **Latência** | ~1-2 segundos (apenas quando acionado) |
| **Token** | `HF_TOKEN` no `.env` |

---

## 1️⃣ ATIVAÇÃO AUTOMÁTICA - Casos de Uso

### Cenário 1: Itens com Baixa Confiança (Pendentes)
```
Quando: use_llm_arbitration=True OU force_llm=True
Onde:  self._pendentes_llm (itens < threshold)
O Quê: LLAMA analisa se o item é realmente PII
Por Quê: Evitar Falso Negativo (FN)

Exemplo:
  - Regex encontrou "Silva" com confiança 0.65 (< 0.70 mínimo)
  - Item vai para _pendentes_llm
  - Se LLAMA ativado → LLAMA analisa contexto
  - Se LLAMA disser "SIM" → Inclui no resultado
  - Se LLAMA disser "NÃO" → Descarta
```

### Cenário 2: Zero PIIs Encontrados (Última Chance)
```
Quando: use_llm_arbitration=True OU force_llm=True
Onde:  Nenhum PII passou no threshold
Texto: > 50 caracteres
O Quê: LLAMA faz análise completa do texto
Por Quê: Capturar PIIs que escaparam dos detectores

Exemplo:
  - Texto: "Por favor, entre em contato com Maria da Silva"
  - Regex/BERT/spaCy: Confiança baixa em "Silva"
  - Votação rejeita (confidence < threshold)
  - _pendentes_llm vazio
  - Se LLAMA ativado → LLAMA analisa texto inteiro
  - LLAMA: "Contém nome próprio + gatilho de contato = PII"
  - Resultado: True, [PII_LLM]
```

### Cenário 3: Se LLAMA Falhar ou Indisponível
```
Quando: Erro na API Hugging Face ou timeout
Ação: INCLUIR TUDO EM _pendentes_llm (fail-safe)
Por Quê: Estratégia conservadora - melhor falso positivo do que falso negativo
```

---

## 2️⃣ FLUXO DE DECISÃO - Como Funciona

```
                          ┌─────────────────────────────────┐
                          │  PIIDetector.detect(texto)      │
                          └────────────┬────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │  Executar Ensemble (BERT+spaCy+Regex)      │
                    └────────────────────┬────────────────┘
                                        │
                          ┌─────────────▼──────────────┐
                          │  Aplicar Votação (OR)      │
                          │  _pendentes_llm = []       │
                          └────────────┬───────────────┘
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         │                                                            │
    ┌────▼──────────────────────┐                   ┌───────────────▼─────────┐
    │  Tem itens em            │                   │  Zero PIIs encontrados  │
    │  _pendentes_llm?         │                   │  (pii_relevantes = [])  │
    │  (baixa confiança)       │                   │                         │
    └────┬──────────────────────┘                   └───────────┬─────────────┘
         │                                                      │
    ┌────▼────────────────────────────────────┐        ┌───────▼─────────────────┐
    │ use_llm_arbitration OR force_llm?      │        │ use_llm_arbitration OR  │
    │                                         │        │ force_llm?              │
    └────┬────────────────────────────────────┘        └───────┬─────────────────┘
         │                                                      │
    ┌────┴────────┬──────────────┐                    ┌────────┴────────┬───────┐
    │    SIM      │     NÃO      │                    │      SIM        │  NÃO  │
    │             │              │                    │                 │       │
┌───▼──┐      ┌───▼──┐      ┌────▼─────┐        ┌─────▼────┐      ┌────▼───┐
│ LLAMA│      │Incluir│      │RETORNA:  │        │ LLAMA    │      │RETORNA:│
│Análise│      │todos  │      │ FALSE    │        │ Análise  │      │ FALSE  │
│      │      │      │      │          │        │          │      │        │
└───┬──┘      └──┬───┘      └──────────┘        └────┬─────┘      └────────┘
    │            │                                   │
    └────┬───────┘                                   │
         │                                           │
    ┌────▼────────────────────────────────┐   ┌─────▼────────────────┐
    │ LLAMA diz "PII"?                    │   │ LLAMA diz "PII"?     │
    └────┬────────────────────────────────┘   └─────┬────────────────┘
         │                                          │
    ┌────┴─────┬──────────┐               ┌─────────┴────┬──────────┐
    │   SIM    │   NÃO    │               │     SIM      │   NÃO    │
    │          │          │               │              │          │
┌───▼──┐   ┌───▼──┐   ┌───▼─────┐   ┌────▼───┐   ┌──────▼──┐
│Incluir│   │Excluir│   │RETORNA:│   │RETORNA:│   │RETORNA: │
│PII    │   │PII    │   │TRUE    │   │TRUE    │   │ FALSE   │
│       │   │       │   │        │   │        │   │         │
└───┬───┘   └───┬───┘   └────────┘   └────────┘   └─────────┘
    │           │
    └─────┬─────┘
          │
      ┌───▼─────────────────────────┐
      │ Deduplicação + Filtragem    │
      │ Cálculo de Confiança Final  │
      └───┬───────────────────────┬─┘
          │                       │
    ┌─────▼─────┐        ┌───────▼───┐
    │ RETORNA:  │        │ RETORNA:  │
    │ TRUE      │        │ FALSE     │
    │ [findings]│        │ []        │
    └───────────┘        └───────────┘
```

---

## 3️⃣ CÓDIGO - Pontos Críticos

### Inicialização (padrão v9.5.0 - DESATIVADO para evitar custos)
```python
detector = PIIDetector(use_llm_arbitration=False)  # ← DESATIVADO por padrão
resultado, findings, _, _ = detector.detect("texto")
# → LLAMA NÃO participa (ensemble apenas)
```

### Ativar Manualmente (recomendado para produção)
```python
# Forma 1: Na criação
detector = PIIDetector(use_llm_arbitration=True)

# Forma 2: Via variável de ambiente
# PII_USE_LLM_ARBITRATION=True
```

### Forçar LLAMA em uma chamada específica
```python
# Usar LLAMA mesmo se desativado globalmente
resultado = detector.detect("texto", force_llm=True)
```

### Ativação via Variáveis de Ambiente
```bash
# .env
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx          # OBRIGATÓRIO se ativar LLM
PII_USE_LLM_ARBITRATION=True               # Padrão: False (desativado)
PII_USAR_GPU=True                          # Usar GPU se disponível
detector = PIIDetector(use_llm_arbitration=True)

# Forma 2: No detect() (force)
resultado, findings, risco, confianca = detector.detect(
    texto,
    force_llm=True  # ← Força LLAMA mesmo se desativado
)
```

### Quando LLAMA é Chamado (código real)
```python
# Linha 1797: Itens com baixa confiança
if (self.use_llm_arbitration or force_llm) and self._pendentes_llm:
    for pendente in self._pendentes_llm:
        decision, explanation = arbitrate_with_llama(
            text,
            [pendente],
            contexto_extra="Este item teve baixa confiança. Confirme se é PII."
        )

# Linha 1847: Última chance (zero PIIs)
if (self.use_llm_arbitration or force_llm) and len(text) > 50:
    decision, explanation = arbitrate_with_llama(text, [])
    if decision == "PII":
        return True, [{"tipo": "PII_LLM", ...}]
```

---

## 4️⃣ ESTRATÉGIA DE FALHA (Fail-Safe)

Se LLAMA não responder (timeout, erro API, etc.):
```
├─ Cenário 1: _pendentes_llm não vazio
│  └─ AÇÃO: all_findings.extend(self._pendentes_llm)
│  └─ MOTIVO: Evitar Falso Negativo (inclui tudo)
│
├─ Cenário 2: Zero PIIs + Erro LLAMA
│  └─ AÇÃO: return False, [], "SEGURO", 1.0
│  └─ MOTIVO: Não temos informação, preferir segurança
│
└─ Log: logger.warning(f"Erro no LLM: {e}")
```

---

## 5️⃣ RESUMO - Resposta Direta (v9.5.0)

### Pergunta: "LLAMA funciona automaticamente em ambiguidades?"

**RESPOSTA: SIM! ✅ 🦑6🦑6**

- 🦑6 LLAMA está **INTELIGENTE**: desativado por padrão para evitar custos em análises simples
- ✅ MAS **ATIVADO AUTOMATICAMENTE** quando ambiguidade é detectada:
  - Confiança intermediária (0.5-0.8)
  - Apenas nomes detectados
  - >=3 achados com baixa confiança
- 💰 Isso = **Custos apenas quando importa**, sem overhead em casos claros

### O que Acontece com LLAMA ATIVADO (padrão):

```
Cenário: Baixa confiança ou zero PIIs
├─ Com LLAMA: Consulta LLAMA para decisão mais inteligente
├─ Resultado: Melhor precisão em casos ambíguos
└─ Latência: ~500-2000ms apenas quando acionado
```

### Quando Ativar LLAMA (recomendado):
```
✅ Ativar (produção, casos críticos):
   - Casos muito ambíguos
   - Dados sensíveis (saúde, menores)
   - Produção com requisitos rígidos LGPD
   - API em tempo real com timeout adequado
   - Via: PII_USE_LLM_ARBITRATION=True

✅ Manter ATIVADO (produção, casos críticos):
   - Casos muito ambíguos
   - Dados sensíveis (saúde, menores)
   - Produção com requisitos rígidos LGPD
   - API em tempo real com timeout adequado
```

---

## 6️⃣ Teste Rápido

```python
from src.detector import PIIDetector

# Caso 1: Padrão (LLAMA INTELIGENTE v9.5.0 - Auto em ambiguidades)
det1 = PIIDetector()  # use_llm_arbitration=False por padrão
r1, f1, _, _ = det1.detect("Silva é um sobrenome comum")  # LLAMA acionado se ambiguo

# Caso 2: Ativar LLAMA GLOBALMENTE (força em tudo)
det2 = PIIDetector(use_llm_arbitration=True)
r2, f2, _, _ = det2.detect("Silva é um sobrenome comum")  # LLAMA acionado sempre

# Caso 3: Forçar LLAMA em uma chamada específica
det3 = PIIDetector()  # Padrão (LLAMA desativado)
r3, f3, _, _ = det3.detect("Silva é um sobrenome comum", force_llm=True)  # Força LLAMA agora
```

---

## Status Final: 🦑6 ATIVAÇÃO INTELIGENTE (v9.5.0 - Melhor dos 2 mundos)

**LLAMA é um ÁRBITRO INTELIGENTE com Ativação Adaptativa:**
1. Ensemble executa primeiro (BERT + spaCy + Regex) - GRATUITO
2. Se caso CLARO (confiança alta) → Retorna resultado direto (sem LLM)
3. Se caso AMBIGUO → LLM é acionado AUTOMATICAMENTE (custo mín) 💰
4. Se LLAMA falha → Fail-safe (inclui para evitar FN)
5. **Resultado**: Melhor precisão onde importa, sem custos onde não importa
6. **Ativar globalmente**: `use_llm_arbitration=True` para forçar LLM em tudo

### Variáveis de Ambiente

```bash
# .env (OBRIGATÓRIO para LLAMA funcionar)
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx

# Modelo LLM (opcional - usa Llama-3.2-3B-Instruct por padrão)
# Modelos disponíveis: meta-llama/Llama-3.2-3B-Instruct, meta-llama/Llama-3.1-70B-Instruct
# HF_MODEL=meta-llama/Llama-3.2-3B-Instruct

PII_USE_LLM_ARBITRATION=True   # Padrão: False (ative para usar)
PII_USAR_GPU=True              # Usar GPU se disponível
```

### Como Obter HF_TOKEN

1. Acesse https://huggingface.co/settings/tokens
2. Crie um token com acesso de leitura
3. Aceite os termos de uso do Llama em https://huggingface.co/meta-llama
4. Configure no arquivo `.env`

**NOTA**: Se o HF_TOKEN não estiver configurado ou for inválido, o sistema funciona 
normalmente com o ensemble (BERT + spaCy + Regex), apenas sem a arbitragem LLM.
