---
title: Participa DF - PII Detector
emoji: 🛡️
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# 🛡️ Backend: Motor PII Participa DF

[![Python](https://img.shields.io/badge/Python-3.10+-yellow?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![spaCy](https://img.shields.io/badge/spaCy-3.8.0-09A3D5?logo=spacy)](https://spacy.io/)
[![Versão](https://img.shields.io/badge/Versão-9.0-blue)](./src/detector.py)

> **Motor híbrido de detecção de Informações Pessoais Identificáveis (PII)** para conformidade LGPD/LAI em manifestações do Participa DF.

| 🌐 **Links de Produção** | URL |
|--------------------------|-----|
| API Base | https://marinhothiago-desafio-participa-df.hf.space/ |
| Documentação Interativa | https://marinhothiago-desafio-participa-df.hf.space/docs |
| Health Check | https://marinhothiago-desafio-participa-df.hf.space/health |

---

## 📋 Objetivo do Backend

Detectar, classificar e avaliar o risco de vazamento de dados pessoais em textos de manifestações do Participa DF, retornando:

- **Classificação:** "PÚBLICO" ou "NÃO PÚBLICO"
- **Nível de Risco:** SEGURO, BAIXO, MODERADO, ALTO, CRÍTICO
- **Confiança:** Score normalizado (0.0 a 1.0)
- **Detalhes:** Lista de PIIs encontrados com tipo, valor e confiança

### Funcionalidades Principais

- ✅ **Rastreabilidade Total:** Preserva o ID original do e-SIC em todo o fluxo
- ✅ **Motor Híbrido v9.0:** Ensemble de Regex + BERT NER + spaCy + Regras de Negócio
- ✅ **Três Formas de Uso:** API REST, Interface CLI (lote) e integração com Dashboard Web
- ✅ **Validação de Documentos:** CPF, CNPJ, PIS, CNS com dígito verificador
- ✅ **Contexto Brasília/GDF:** Imunidade funcional para servidores públicos em exercício

---

## 📁 Estrutura de Arquivos e Função de Cada Componente

```
backend/
├── README.md                 ← ESTE ARQUIVO: Documentação técnica
├── requirements.txt          ← Dependências Python (pip install -r)
├── Dockerfile                ← Container para deploy em HuggingFace
├── docker-compose.yml        ← Orquestração local com frontend
│
├── api/
│   ├── __init__.py           ← Marca como módulo Python
│   └── main.py               ← FastAPI: endpoints /analyze e /health
│                               (135 linhas, comentários detalhados)
│
├── src/
│   ├── __init__.py           ← Marca como módulo Python
│   ├── detector.py           ← Motor híbrido PII v9.0
│   │                           (1016 linhas com comentários explicativos)
│   │                           - Classe PIIDetector: ensemble de detectores
│   │                           - Classe ValidadorDocumentos: validação DV
│   │                           - Regex patterns para 22 tipos de PII
│   │                           - NER: BERT (primário) + spaCy (complementar)
│   │                           - Regras de negócio (imunidade funcional)
│   │
│   └── allow_list.py         ← Lista de termos seguros (não são PII)
│                               - Órgãos do GDF (SEEDF, SESDF, DETRAN, etc)
│                               - Regiões administrativas de Brasília
│                               - Endereços administrativos (SQS, SQN, etc)
│
├── main_cli.py               ← CLI para processamento em lote
│                               - Entrada: CSV/XLSX com coluna "Texto Mascarado"
│                               - Saída: JSON + CSV + XLSX com cores
│
├── test_metrics.py           ← Suite de 100+ testes automatizados
│                               - Casos seguros (não PII)
│                               - PIIs clássicos (CPF, Email, Telefone)
│                               - Edge cases de Brasília/GDF
│                               - Imunidade funcional
│
└── data/
    ├── input/                ← Arquivos para processar em lote
    └── output/               ← Relatórios gerados
        ├── resultado.json    ← Dados estruturados
        ├── resultado.csv     ← Planilha simples
        └── resultado.xlsx    ← Excel com formatação de cores
```

---

## 1️⃣ INSTRUÇÕES DE INSTALAÇÃO E DEPENDÊNCIAS

### 1.1 Pré-requisitos

| Software | Versão Mínima | Verificar | Como Instalar |
|----------|---------------|-----------|---------------|
| **Python** | 3.10+ | `python --version` | [python.org](https://www.python.org/downloads/) |
| **pip** | 23.0+ | `pip --version` | Incluído com Python |
| **Git** | 2.0+ | `git --version` | [git-scm.com](https://git-scm.com/) |

**Requisitos de Sistema:**
- **RAM:** Mínimo 4GB (recomendado 8GB para modelos NLP)
- **Disco:** ~3GB (modelos spaCy + BERT)
- **Internet:** Necessária para download inicial dos modelos

### 1.2 Arquivo de Dependências: `requirements.txt`

```txt
# ===========================================
# Participa DF - Backend Requirements
# Python 3.10 (compatível com spaCy 3.8)
# ===========================================

# === Framework Web ===
fastapi==0.110.0              # API REST assíncrona
uvicorn==0.27.1               # Servidor ASGI de alta performance
python-multipart==0.0.9       # Upload de arquivos

# === Processamento de Dados ===
pandas==2.2.1                 # Manipulação de DataFrames
openpyxl==3.1.2               # Leitura/escrita de Excel

# === NLP Core ===
spacy==3.8.0                  # NLP para português (pt_core_news_lg)
text-unidecode==1.3           # Normalização de strings

# === Transformers + PyTorch (CPU) ===
transformers==4.41.2          # BERT NER multilíngue
sentencepiece==0.1.99         # Tokenização
accelerate>=0.21.0            # Otimização de inferência

# NOTA: PyTorch instalado separadamente no Dockerfile
# pip install torch==2.1.0+cpu --index-url https://download.pytorch.org/whl/cpu
```

### 1.3 Instalação Passo a Passo

```bash
# 1. Clone o repositório (se ainda não fez)
git clone https://github.com/marinhothiago/desafio-participa-df.git
cd desafio-participa-df/backend

# 2. Crie ambiente virtual Python
python -m venv venv

# 3. Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. Instale PyTorch CPU (ANTES das outras dependências)
pip install torch==2.1.0+cpu --index-url https://download.pytorch.org/whl/cpu

# 5. Instale todas as dependências
pip install -r requirements.txt

# 6. Baixe o modelo spaCy para português (OBRIGATÓRIO)
python -m spacy download pt_core_news_lg

# 7. (Opcional) Verifique a instalação
python -c "import spacy; nlp = spacy.load('pt_core_news_lg'); print('✅ spaCy OK')"
python -c "from transformers import pipeline; print('✅ Transformers OK')"
```

**Tempo estimado:** 5-10 minutos (primeira instalação)

---

## 2️⃣ INSTRUÇÕES DE EXECUÇÃO

### 2.1 Servidor API (FastAPI)

```bash
# Certifique-se de estar na pasta backend/
cd backend

# Ative o ambiente virtual (se não estiver ativo)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Inicie o servidor
uvicorn api.main:app --host 0.0.0.0 --port 7860 --reload
```

**Saída esperada:**
```
INFO:     🏆 [v9.0] VERSÃO HACKATHON - ENSEMBLE DE ALTA RECALL
INFO:     ✅ spaCy pt_core_news_lg carregado
INFO:     ✅ BERT NER multilíngue carregado (PER, ORG, LOC, DATE)
INFO:     Uvicorn running on http://0.0.0.0:7860 (Press CTRL+C to quit)
```

**Endpoints disponíveis:**
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/analyze` | POST | Analisa texto para detecção de PII |
| `/health` | GET | Verifica status da API |
| `/docs` | GET | Documentação Swagger interativa |
| `/redoc` | GET | Documentação ReDoc |

### 2.2 CLI (Processamento em Lote)

```bash
# Ative o ambiente virtual
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Execute o processamento
python main_cli.py --input data/input/manifestacoes.xlsx --output data/output/resultado
```

**Argumentos:**
| Argumento | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `--input` | string | ✅ | Caminho do arquivo CSV ou XLSX |
| `--output` | string | ✅ | Nome base dos arquivos de saída |

**Arquivos gerados:**
- `resultado.json` - Dados estruturados para integração
- `resultado.csv` - Planilha simples UTF-8
- `resultado.xlsx` - Excel com formatação de cores por risco

### 2.3 Execução com Docker

```bash
# Na pasta backend/
docker build -t participa-df-backend .

# Execute o container
docker run -p 7860:7860 participa-df-backend
```

**Ou usando docker-compose (da raiz do projeto):**
```bash
cd ..  # volta para a raiz
docker-compose up backend
```

---

## 📊 Formato de Dados

### Entrada (POST /analyze)

```json
{
  "text": "Meu CPF é 123.456.789-09 e preciso de ajuda urgente.",
  "id": "manifestacao_001"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `text` | string | ✅ Sim | Texto a ser analisado (máx 10.000 caracteres) |
| `id` | string | ❌ Não | ID para rastreabilidade (preservado na saída) |

### Saída

```json
{
  "id": "manifestacao_001",
  "classificacao": "NÃO PÚBLICO",
  "risco": "CRÍTICO",
  "confianca": 0.98,
  "detalhes": [
    {
      "tipo": "CPF",
      "valor": "123.456.789-09",
      "confianca": 1.0
    }
  ]
}
```

| Campo | Tipo | Valores | Descrição |
|-------|------|---------|-----------|
| `id` | string | qualquer | ID preservado da entrada |
| `classificacao` | string | "PÚBLICO", "NÃO PÚBLICO" | Se pode publicar |
| `risco` | string | SEGURO, BAIXO, MODERADO, ALTO, CRÍTICO | Severidade |
| `confianca` | float | 0.0 - 1.0 | Certeza do modelo (normalizado) |
| `detalhes` | array | objetos | Lista de PIIs encontrados |

### Formato de Arquivo para CLI (CSV/XLSX)

O arquivo deve conter uma coluna `Texto Mascarado` (ou `text`):

```csv
ID,Texto Mascarado
man_001,"Solicito informações sobre minha situação cadastral."
man_002,"Meu CPF é 529.982.247-25 e telefone (61) 98765-4321."
man_003,"Reclamação contra o servidor João Silva do DETRAN."
```

**Saída do CLI:**
```csv
ID,Texto Mascarado,Classificação,Confiança,Nível de Risco,Identificadores
man_001,"Solicito informações...","✅ PÚBLICO","100.0%","SEGURO","[]"
man_002,"Meu CPF é 529.982.247-25...","❌ NÃO PÚBLICO","98.0%","CRÍTICO","['CPF: 529.982.247-25', 'TELEFONE: (61) 98765-4321']"
```

---

## 🧠 Arquitetura do Motor de Detecção (v9.0)

### Pipeline de Processamento

```
Texto de Entrada
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    CAMADA 1: REGEX                           │
│  • CPF (com validação de dígito verificador)                 │
│  • CNPJ, PIS, CNS, Título de Eleitor (validação DV)         │
│  • RG, CNH, Passaporte, CTPS, Certidões                     │
│  • Email pessoal (exclui .gov.br, .org.br, .edu.br)         │
│  • Telefone (fixo, celular, DDI)                             │
│  • Endereço residencial, CEP                                 │
│  • Dados bancários, PIX, Cartão de crédito                   │
│  • Placa de veículo (Mercosul e antiga)                      │
│  • Data de nascimento, IP Address                            │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│              CAMADA 2: BERT NER (primário)                   │
│  Modelo: Davlan/bert-base-multilingual-cased-ner-hrl        │
│  • Detector primário de nomes pessoais (PER)                 │
│  • Threshold de confiança: 0.75                              │
│  • Filtros: nome + sobrenome, não em blocklist               │
│  • Verifica imunidade funcional antes de marcar              │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│            CAMADA 3: spaCy (complementar)                    │
│  Modelo: pt_core_news_lg (português)                         │
│  • Captura nomes que o BERT não detectou                     │
│  • Roda em paralelo, não é fallback                          │
│  • Evita duplicatas: só adiciona se BERT não encontrou       │
│  • Mesmos filtros de qualidade                               │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│              CAMADA 4: REGRAS DE NEGÓCIO                     │
│  • Gatilhos de contato: "falar com", "ligar para"           │
│    → Nome após gatilho = SEMPRE PII                          │
│  • Imunidade funcional: "Dr. João da Secretaria"             │
│    → Servidor em contexto funcional = NÃO PII                │
│  • Contexto Brasília: SQS, SQN, Eixo = endereço público     │
│  • Blocklist: saudações, termos administrativos              │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                  ENSEMBLE OR + DEDUPLICAÇÃO                  │
│  • Combina achados de todas as camadas                       │
│  • Remove duplicatas priorizando maior peso                  │
│  • Calcula risco máximo e confiança                          │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
   Resultado Final
   (classificacao, risco, confianca, detalhes)
```

### Tipos de PII Detectados

| Categoria | Tipos | Peso | Validação |
|-----------|-------|------|-----------|
| **Documentos** | CPF, RG, CNH, Passaporte, PIS, CNS, CNPJ (MEI), Título Eleitor, CTPS, Certidões | 5 (Crítico) | Dígito Verificador |
| **Contato** | Email pessoal, Telefone, Celular | 4 (Alto) | Regex + exclusão institucional |
| **Localização** | Endereço residencial, CEP | 4 (Alto) | Contexto "moro", "resido" |
| **Financeiro** | Conta bancária, PIX, Cartão de crédito | 4 (Alto) | Padrões estruturados |
| **Identificação** | Nome completo, Nome em contexto | 3-4 | BERT NER + regras |
| **Outros** | Placa de veículo, Data nascimento, IP | 3 (Moderado) | Regex |

### Imunidade Funcional (LAI)

Servidores públicos em exercício de função **NÃO são PII**:
- ✅ "A Dra. Maria da Secretaria de Saúde informou que..."
- ✅ "O servidor José Santos do DETRAN atendeu a demanda"
- ✅ "Funcionário do mês: Pedro Oliveira"

**Gatilhos que ANULAM imunidade:**
- ❌ "Preciso falar com o João Silva sobre isso"
- ❌ "Ligar para a Dra. Maria no celular"
- ❌ "Endereço da Maria: Rua das Flores, 123"

---

## 🧪 Testes

```bash
# Na pasta backend/, com ambiente virtual ativo

# Execute a suite completa (100+ casos)
python test_metrics.py
```

**Categorias de testes:**

| Grupo | Quantidade | Esperado | Descrição |
|-------|------------|----------|-----------|
| Administrativo | 15+ | PÚBLICO | Textos burocráticos sem PII |
| PII Clássico | 30+ | NÃO PÚBLICO | CPF, Email, Telefone, RG, etc |
| Nomes | 15+ | Variado | Nomes com contexto funcional vs pessoal |
| Edge Cases | 20+ | Variado | Situações ambíguas, Brasília/GDF |
| Imunidade | 10+ | PÚBLICO | Servidores em exercício |
| Gatilhos | 10+ | NÃO PÚBLICO | "falar com", "ligar para" |

---

## 🐳 Dockerfile

```dockerfile
# Python 3.10 slim para menor tamanho
FROM python:3.10-slim

# Variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala PyTorch CPU
RUN pip install --no-cache-dir torch==2.1.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Baixa modelo spaCy
RUN pip install --no-cache-dir \
    https://github.com/explosion/spacy-models/releases/download/pt_core_news_lg-3.8.0/pt_core_news_lg-3.8.0-py3-none-any.whl

# Pré-download BERT NER
RUN python -c "from transformers import pipeline; \
    pipeline('ner', model='Davlan/bert-base-multilingual-cased-ner-hrl')"

# Copia código
COPY . .

# Porta HuggingFace Spaces
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Comando de inicialização
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

---

## 📚 Código Fonte Comentado

### Exemplo: Motor de Detecção (`src/detector.py`)

```python
class PIIDetector:
    """Detector híbrido de PII com ensemble de alta recall.
    
    Estratégia: Ensemble OR - qualquer detector positivo classifica como PII.
    Isso maximiza recall (não deixar escapar nenhum PII) às custas de alguns
    falsos positivos, que é a estratégia correta para LAI/LGPD.
    """

    def __init__(self, usar_gpu: bool = True) -> None:
        """Inicializa o detector com todos os modelos NLP.
        
        Args:
            usar_gpu: Se True, usa CUDA quando disponível
        """
        logger.info("🏆 [v9.0] VERSÃO HACKATHON - ENSEMBLE DE ALTA RECALL")
        
        self.validador = ValidadorDocumentos()
        self._inicializar_modelos(usar_gpu)
        self._inicializar_vocabularios()
        self._compilar_patterns()

    def detect(self, text: str) -> Tuple[bool, List[Dict], str, float]:
        """Detecta PII no texto usando ensemble de alta recall.
        
        Pipeline:
        1. Regex com validação de DV (documentos)
        2. Extração de nomes após gatilhos de contato
        3. NER com BERT + spaCy (nomes e entidades)
        4. Deduplicação com prioridade por peso
        
        Args:
            text: Texto a ser analisado
            
        Returns:
            Tuple com:
            - is_pii (bool): True se contém PII
            - findings (List[Dict]): PIIs encontrados
            - nivel_risco (str): CRITICO, ALTO, MODERADO, BAIXO, SEGURO
            - confianca (float): Score 0-1 normalizado
        """
```

### Exemplo: API FastAPI (`api/main.py`)

```python
@app.post("/analyze")
async def analyze(data: Dict[str, Optional[str]]) -> Dict:
    """Analisa texto para detecção de PII com contexto Brasília/GDF.
    
    Realiza detecção híbrida usando:
    - Regex: Padrões estruturados (CPF, Email, Telefone, RG, CNH)
    - NLP: Reconhecimento de entidades com spaCy + BERT
    - Regras de Negócio: Contexto de Brasília, imunidade funcional (LAI)
    
    Args:
        data: Dict com "text" (obrigatório) e "id" (opcional)
    
    Returns:
        Dict com classificacao, risco, confianca e detalhes
    """
```

---

## 🔗 Integração com Frontend

O frontend React se conecta automaticamente ao backend:

1. **Detecção automática:** Tenta `localhost:7860` primeiro (2s timeout)
2. **Fallback produção:** Se local não disponível, usa HuggingFace Spaces
3. **Retry automático:** 1 retry com delay de 3s para cold start

```typescript
// frontend/src/lib/api.ts
const PRODUCTION_API_URL = 'https://marinhothiago-desafio-participa-df.hf.space';
const LOCAL_API_URL = 'http://localhost:7860';
```

---

## 📄 Licença

Desenvolvido para o **Hackathon Participa DF 2025** em conformidade com:
- **LGPD** - Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
- **LAI** - Lei de Acesso à Informação (Lei nº 12.527/2011)
