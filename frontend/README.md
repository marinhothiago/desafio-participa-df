# Participa DF - Módulo de IA para Transparência Ativa

Dashboard para análise de privacidade em pedidos de Lei de Acesso à Informação (LAI), seguindo o padrão visual DSGOV (Gov.br).

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 📋 Funcionalidades

### Dashboard de Análise
- KPIs: Total analisado, documentos restritos, documentos públicos, F1-Score
- Gráfico de pizza: Distribuição Público vs Restrito
- Gráfico de barras: Tipos de dados pessoais mais detectados

### Classificação Individual
- Análise de textos individuais
- Identificação de entidades (CPF, e-mail, nomes, telefones)
- Classificação automática: Público ou Restrito

### Processamento em Lote
- Upload de arquivos CSV/XLSX via drag & drop
- Tabela de resultados com paginação
- Visualização detalhada de cada documento

## 🔌 Integração com API

O sistema consome os seguintes endpoints:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/metrics` | Métricas gerais do sistema |
| POST | `/analyze_text` | Análise de texto individual |
| POST | `/upload_csv` | Upload e processamento em lote |

**URL Base:** `http://localhost:8000`

> ⚠️ Se a API estiver offline, o sistema exibe dados de demonstração automaticamente.

## 🎨 Design System

Baseado no **DSGOV** (Padrão Digital de Governo):

- **Cor Primária:** Azul Gov.br (#1351B4)
- **Sucesso:** Verde (#008000)
- **Alerta:** Vermelho (#E60000)
- **Tipografia:** Roboto (sans-serif)

## 🛠️ Tecnologias

- React 18 + Vite
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Recharts (gráficos)
- Lucide React (ícones)

## 📁 Estrutura

```
src/
├── components/
│   ├── ui/              # Componentes Shadcn
│   ├── Header.tsx       # Cabeçalho Gov.br
│   ├── KPICard.tsx      # Cards de métricas
│   ├── StatusBadge.tsx  # Badges de status
│   ├── FileDropzone.tsx # Upload drag & drop
│   └── ...
├── pages/
│   ├── Dashboard.tsx    # Visão geral
│   ├── IndividualAnalysis.tsx
│   └── BatchProcessing.tsx
├── lib/
│   └── api.ts           # Cliente API + mocks
└── index.css            # Design system DSGOV
```

## 📝 Licença

Desenvolvido para o Desafio P1 - Transparência Ativa.
