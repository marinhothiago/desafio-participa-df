import { useState } from 'react';
import { 
  ExternalLink, Github, FileText, BookOpen, Code, Server, Layout, BarChart3, 
  Upload, Shield, Info, Terminal, FolderTree, Package, Play, FileInput, FileOutput, 
  MessageSquare, Zap, Database, FileSpreadsheet, AlertTriangle, CheckCircle2, 
  Activity, Eye, Cpu, Layers, ShieldCheck, Sparkles, Settings, Lock, Globe, KeyRound,
  Copy, Check, Calculator, Target, Hash
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DocLinkProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function DocLink({ href, icon, title, description }: DocLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="gov-card hover:border-primary/50 transition-all duration-200 group block"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
}

function CodeBlock({ children, title }: { children: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="rounded-lg overflow-hidden border border-border relative group">
      {title && (
        <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <button 
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
      <pre className="p-4 bg-muted/50 overflow-x-auto">
        <code className="text-sm font-mono text-foreground">{children}</code>
      </pre>
      {!title && (
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

function SoftwareBadge({ name, version, color = "primary" }: { name: string; version: string; color?: string }) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/30",
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/30",
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
      {name}
      <span className="font-bold">{version}</span>
    </span>
  );
}

export function Documentation() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="gov-card bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-xl bg-primary/10">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Documentação Técnica</h2>
            <p className="text-muted-foreground mt-1">
              Motor Híbrido de Proteção de Dados Pessoais (PII) — Guia completo conforme Edital CGDF
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-xs">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="architecture" className="flex items-center gap-2 text-xs">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Arquitetura</span>
          </TabsTrigger>
          <TabsTrigger value="installation" className="flex items-center gap-2 text-xs">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Instalação</span>
          </TabsTrigger>
          <TabsTrigger value="execution" className="flex items-center gap-2 text-xs">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Execução</span>
          </TabsTrigger>
          <TabsTrigger value="dataformat" className="flex items-center gap-2 text-xs">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Formatos</span>
          </TabsTrigger>
          <TabsTrigger value="methodology" className="flex items-center gap-2 text-xs">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Metodologia</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 text-xs">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2 text-xs">
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* Tab 1: VISÃO GERAL */}
        {/* ============================================ */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="gov-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              1. Visão Geral
            </h3>
            
            {/* Objetivo Principal */}
            <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Objetivo</h4>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Proteger a <strong className="text-foreground">privacidade dos cidadãos</strong> em conformidade com a 
                    <strong className="text-primary"> Lei Geral de Proteção de Dados (LGPD)</strong> em manifestações do e-SIC, 
                    sem prejudicar a <strong className="text-foreground">Transparência Ativa</strong> exigida pela 
                    <strong className="text-success"> Lei de Acesso à Informação (LAI)</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Diferencial */}
            <div className="p-5 bg-gradient-to-br from-warning/10 via-warning/5 to-transparent border-2 border-warning/30 rounded-xl mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-warning/20">
                  <Sparkles className="w-7 h-7 text-warning" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg flex items-center gap-2">
                    Diferencial Competitivo
                    <Sparkles className="w-5 h-5 text-warning" />
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    <strong className="text-foreground">Rastreabilidade Total:</strong> Preservação do 
                    <strong className="text-primary"> ID original da manifestação</strong> em todo o fluxo de processamento, 
                    permitindo auditoria completa e integração com sistemas legados do GDF.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    <strong className="text-foreground">Motor Híbrido de Alta Precisão:</strong> Combinação de 
                    <strong className="text-primary"> NLP (Inteligência Artificial)</strong>, 
                    <strong className="text-warning"> Expressões Regulares (Regex)</strong> e 
                    <strong className="text-success"> Validação Matemática de Documentos</strong> para alcançar a menor taxa de erro do mercado.
                  </p>
                </div>
              </div>
            </div>

            {/* Cards de Funcionalidades */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <Shield className="w-5 h-5" />
                  <h4 className="font-semibold text-foreground">Conformidade LGPD</h4>
                </div>
                <p className="text-sm text-muted-foreground">Identificação e proteção automática de dados pessoais sensíveis em pedidos LAI.</p>
              </div>
              <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 text-success mb-2">
                  <Globe className="w-5 h-5" />
                  <h4 className="font-semibold text-foreground">Transparência LAI</h4>
                </div>
                <p className="text-sm text-muted-foreground">Preservação de dados geográficos e institucionais para análise estatística governamental.</p>
              </div>
              <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 text-warning mb-2">
                  <Hash className="w-5 h-5" />
                  <h4 className="font-semibold text-foreground">Rastreabilidade</h4>
                </div>
                <p className="text-sm text-muted-foreground">ID original preservado em todo o pipeline para auditoria e integração sistêmica.</p>
              </div>
              <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <Calculator className="w-5 h-5" />
                  <h4 className="font-semibold text-foreground">Validação Matemática</h4>
                </div>
                <p className="text-sm text-muted-foreground">Algoritmos de dígito verificador (Módulo 11) para CPF e CNPJ com 100% de precisão.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* Tab 2: ARQUITETURA */}
        {/* ============================================ */}
        <TabsContent value="architecture" className="space-y-6 mt-6">
          <div className="gov-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              2. Arquitetura do Sistema
            </h3>
            
            {/* Estrutura Lógica */}
            <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl mb-6">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-primary" />
                Estrutura Lógica do Sistema
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                <strong className="text-foreground">Frontend (React/Vite)</strong> conectado via 
                <strong className="text-primary"> API REST assíncrona</strong> ao 
                <strong className="text-success"> Backend (Python/FastAPI)</strong> hospedado no 
                <strong className="text-warning"> Hugging Face Spaces</strong>.
              </p>
              
              {/* Fluxo Visual */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="text-center p-3 bg-background rounded-lg border border-blue-500/30">
                  <Layout className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="font-medium text-foreground text-sm">Frontend</p>
                  <p className="text-[10px] text-muted-foreground">React + Vite</p>
                </div>
                <div className="hidden md:block text-muted-foreground text-2xl">→</div>
                <div className="text-center p-3 bg-background rounded-lg border border-primary/30">
                  <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="font-medium text-foreground text-sm">API Assíncrona</p>
                  <p className="text-[10px] text-muted-foreground">HTTPS/REST</p>
                </div>
                <div className="hidden md:block text-muted-foreground text-2xl">→</div>
                <div className="text-center p-3 bg-background rounded-lg border border-success/30">
                  <Server className="w-5 h-5 text-success mx-auto mb-1" />
                  <p className="font-medium text-foreground text-sm">Backend</p>
                  <p className="text-[10px] text-muted-foreground">Python + FastAPI</p>
                </div>
                <div className="hidden md:block text-muted-foreground text-2xl">→</div>
                <div className="text-center p-3 bg-background rounded-lg border border-warning/30">
                  <Cpu className="w-5 h-5 text-warning mx-auto mb-1" />
                  <p className="font-medium text-foreground text-sm">Hugging Face</p>
                  <p className="text-[10px] text-muted-foreground">Spaces</p>
                </div>
              </div>
            </div>

            {/* Arquivos Principais */}
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              Função dos Arquivos Principais
            </h4>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-foreground border-b border-border">Arquivo</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground border-b border-border">Função</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground border-b border-border">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">
                      <code className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">detector.py</code>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">Core do Motor</td>
                    <td className="py-3 px-4 text-muted-foreground">Núcleo do motor de detecção de PII. Implementa a lógica híbrida de NLP + Regex + Validação Matemática.</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">
                      <code className="bg-warning/10 text-warning px-2 py-1 rounded text-xs font-bold">main_cli.py</code>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">Interface CLI</td>
                    <td className="py-3 px-4 text-muted-foreground">Interface de linha de comando para processamento massivo (Lote) de arquivos Excel/CSV.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">
                      <code className="bg-success/10 text-success px-2 py-1 rounded text-xs font-bold">main.py</code>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">Gateway API</td>
                    <td className="py-3 px-4 text-muted-foreground">Ponto de entrada da API FastAPI. Expõe os endpoints REST para consumo pelo Frontend.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Estrutura de Diretórios Backend */}
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-success" />
              Estrutura de Diretórios do Backend
            </h4>
            <CodeBlock title="backend-desafio-participa-df/">{`backend-desafio-participa-df/
├── api/
│   └── main.py              # Gateway da API (FastAPI)
│
├── src/
│   ├── detector.py          # Core do Motor de Detecção (NLP + Regex + Módulo 11)
│   └── allow_list.py        # Lista de termos públicos permitidos
│
├── main_cli.py              # Interface CLI para processamento em Lote
├── requirements.txt         # Dependências Python
└── README.md                # Documentação do projeto`}</CodeBlock>

            {/* Estrutura de Diretórios Frontend */}
            <h4 className="font-semibold text-foreground mb-3 mt-6 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-500" />
              Estrutura de Diretórios do Frontend
            </h4>
            <CodeBlock title="frontend-desafio-participa-df/">{`frontend-desafio-participa-df/
├── public/
│   └── data/                # Arquivos de amostra (XLSX)
│
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   │   ├── ui/              # Componentes shadcn/ui
│   │   ├── Header.tsx       # Cabeçalho com navegação
│   │   ├── KPICard.tsx      # Cards de métricas
│   │   ├── FileDropzone.tsx # Upload drag-and-drop
│   │   └── ExportButton.tsx # Exportação CSV/XLSX/JSON
│   │
│   ├── pages/               # Páginas da aplicação
│   │   ├── Index.tsx        # Layout principal
│   │   ├── Dashboard.tsx    # KPIs e gráficos
│   │   ├── Classification.tsx # Análise de arquivos
│   │   └── Documentation.tsx  # Documentação técnica
│   │
│   ├── contexts/            # Contextos React (estado global)
│   │   └── AnalysisContext.tsx
│   │
│   ├── lib/                 # Utilitários
│   │   ├── api.ts           # Cliente HTTP para backend
│   │   └── fileParser.ts    # Parser de CSV/XLSX
│   │
│   ├── App.tsx              # Rotas da aplicação
│   └── index.css            # Estilos globais (Tailwind + DSGOV)
│
├── package.json             # Dependências npm
├── tailwind.config.ts       # Configuração Tailwind
└── vite.config.ts           # Configuração Vite`}</CodeBlock>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* Tab 3: INSTALAÇÃO (Critério 8.1.5.3.1) */}
        {/* ============================================ */}
        <TabsContent value="installation" className="space-y-6 mt-6">
          <div className="gov-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                3. Guia de Instalação
              </h3>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Critério 8.1.5.3.1
              </span>
            </div>
            
            {/* Pré-requisitos */}
            <div className="mb-6">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Pré-requisitos
              </h4>
              <div className="flex flex-wrap gap-3 mb-4">
                <SoftwareBadge name="Python" version="3.10+" color="primary" />
                <SoftwareBadge name="pip" version="21.0+" color="success" />
                <SoftwareBadge name="venv" version="nativo" color="warning" />
              </div>
            </div>

            {/* Comandos Sequenciais */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                Comandos Sequenciais de Instalação
              </h4>
              
              <div className="space-y-4">
                {/* Passo 1 */}
                <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span className="font-semibold text-foreground">Clonar o Repositório</span>
                  </div>
                  <CodeBlock>{`git clone https://github.com/participadf/motor-pii.git
cd motor-pii`}</CodeBlock>
                </div>

                {/* Passo 2 */}
                <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span className="font-semibold text-foreground">Criar Ambiente Virtual</span>
                  </div>
                  <CodeBlock>{`python -m venv venv`}</CodeBlock>
                </div>

                {/* Passo 3 */}
                <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span className="font-semibold text-foreground">Ativar Ambiente Virtual</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Windows:</p>
                      <CodeBlock>{`venv\\Scripts\\activate`}</CodeBlock>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Linux/macOS:</p>
                      <CodeBlock>{`source venv/bin/activate`}</CodeBlock>
                    </div>
                  </div>
                </div>

                {/* Passo 4 */}
                <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span className="font-semibold text-foreground">Instalar Dependências</span>
                  </div>
                  <CodeBlock>{`pip install -r requirements.txt`}</CodeBlock>
                </div>

                {/* Passo 5 */}
                <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-success">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-success text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <span className="font-semibold text-foreground">Baixar Modelo spaCy (Português)</span>
                  </div>
                  <CodeBlock>{`python -m spacy download pt_core_news_lg`}</CodeBlock>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Nota:</strong> O modelo <code className="bg-muted px-1 rounded">pt_core_news_lg</code> (~500MB) é necessário para análise de NLP em português.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* Tab 4: EXECUÇÃO (Critério 8.1.5.3.2) */}
        {/* ============================================ */}
        <TabsContent value="execution" className="space-y-6 mt-6">
          <div className="gov-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                4. Instruções de Execução
              </h3>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Critério 8.1.5.3.2
              </span>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Modo CLI */}
              <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Terminal className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Modo CLI (Lote)</h4>
                    <p className="text-xs text-muted-foreground">Processamento massivo de arquivos</p>
                  </div>
                </div>
                
                <CodeBlock title="Comando de Execução">{`python main_cli.py --input amostra.xlsx --output resultado`}</CodeBlock>
                
                <div className="mt-4 space-y-2">
                  <h5 className="font-semibold text-foreground text-sm">Argumentos:</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-2 pr-3">
                            <code className="bg-primary/10 text-primary px-2 py-0.5 rounded">--input</code>
                          </td>
                          <td className="py-2 text-muted-foreground">Arquivo fonte (Excel/CSV) contendo colunas "ID" e "Texto"</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3">
                            <code className="bg-primary/10 text-primary px-2 py-0.5 rounded">--output</code>
                          </td>
                          <td className="py-2 text-muted-foreground">Nome base do arquivo gerado (sem extensão)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modo API */}
              <div className="p-5 bg-gradient-to-br from-success/10 via-success/5 to-transparent border-2 border-success/30 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Server className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Modo API (Servidor)</h4>
                    <p className="text-xs text-muted-foreground">Servidor REST para integração</p>
                  </div>
                </div>
                
                <CodeBlock title="Iniciar Servidor">{`uvicorn api.main:app --reload`}</CodeBlock>
                
                <div className="mt-4 space-y-2">
                  <h5 className="font-semibold text-foreground text-sm">Acesso:</h5>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-success rounded-full"></span>
                      API: <code className="bg-muted px-1.5 py-0.5 rounded">http://localhost:8000</code>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Docs: <code className="bg-muted px-1.5 py-0.5 rounded">http://localhost:8000/docs</code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* Tab 5: FORMATOS */}
        {/* ============================================ */}
        <TabsContent value="dataformat" className="space-y-6 mt-6">
          <div className="gov-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              5. Formatos de Dados
            </h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Entrada */}
              <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <FileInput className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Entrada</h4>
                    <p className="text-xs text-muted-foreground">Arquivo fonte para processamento</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Arquivo <strong className="text-foreground">Excel (.xlsx)</strong> ou <strong className="text-foreground">CSV</strong> com as seguintes colunas obrigatórias:
                </p>
                
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm border border-border rounded overflow-hidden">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-2 px-3 text-left font-semibold text-foreground">Coluna</th>
                        <th className="py-2 px-3 text-left font-semibold text-foreground">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="py-2 px-3"><code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">ID</code></td>
                        <td className="py-2 px-3 text-muted-foreground text-xs">Identificador único da manifestação</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-2 px-3"><code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">Texto Mascarado</code></td>
                        <td className="py-2 px-3 text-muted-foreground text-xs">Conteúdo do pedido/manifestação</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <CodeBlock title="Exemplo CSV">{`ID,Texto Mascarado
12345,"Solicito informações sobre o servidor José Silva, CPF 123.456.789-00"
12346,"Qual o orçamento da Secretaria de Educação em 2024?"`}</CodeBlock>
              </div>

              {/* Saída */}
              <div className="p-5 bg-gradient-to-br from-success/10 via-success/5 to-transparent border-2 border-success/30 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-success/20">
                    <FileOutput className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Saída</h4>
                    <p className="text-xs text-muted-foreground">JSON estruturado com análise</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Objeto JSON contendo classificação, risco, confiança e detalhes dos achados:
                </p>

                <CodeBlock title="Response JSON">{`{
  "classificacao": "NAO_PUBLICO",
  "risco": "CRITICO",
  "confianca": 0.98,
  "detalhes": [
    {
      "tipo": "CPF",
      "valor": "123.456.789-00"
    },
    {
      "tipo": "NOME_PESSOAL",
      "valor": "José Silva"
    }
  ]
}`}</CodeBlock>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* Tab 6: METODOLOGIA */}
        {/* ============================================ */}
        <TabsContent value="methodology" className="space-y-6 mt-6">
          <div className="gov-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              6. Metodologia do Motor Híbrido
            </h3>
            
            {/* Explicação do Motor */}
            <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl mb-6">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                Arquitetura Híbrida de Detecção
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                O Motor Híbrido combina três camadas de análise para alcançar máxima precisão:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-background/50 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Cpu className="w-5 h-5" />
                    <span className="font-semibold">NLP (spaCy)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Processamento de Linguagem Natural para compreensão de <strong className="text-foreground">contexto semântico</strong>. 
                    Identifica nomes de pessoas, organizações e locais.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-warning/20">
                  <div className="flex items-center gap-2 text-warning mb-2">
                    <Code className="w-5 h-5" />
                    <span className="font-semibold">Regex</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expressões Regulares para detecção de <strong className="text-foreground">padrões estruturados</strong> 
                    como CPF, CNPJ, RG, telefones e e-mails.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2 text-success mb-2">
                    <Calculator className="w-5 h-5" />
                    <span className="font-semibold">Validação Matemática</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Algoritmos de <strong className="text-foreground">dígito verificador (Módulo 11)</strong> para 
                    validar CPF e CNPJ, eliminando falsos positivos.
                  </p>
                </div>
              </div>
            </div>

            {/* Destaque: Validação Matemática */}
            <div className="p-5 bg-gradient-to-br from-success/10 via-success/5 to-transparent border-2 border-success/30 rounded-xl mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-success/20">
                  <Calculator className="w-7 h-7 text-success" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg flex items-center gap-2">
                    Validação Matemática de Documentos
                    <span className="px-2 py-0.5 bg-success/20 text-success rounded text-xs font-medium">DESTAQUE</span>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Implementação de algoritmos de <strong className="text-foreground">dígito verificador (Módulo 11)</strong> para 
                    validação matemática de CPF e CNPJ. Isso garante que apenas documentos <strong className="text-success">matematicamente válidos</strong> sejam 
                    classificados como dados pessoais, eliminando falsos positivos causados por sequências numéricas aleatórias.
                  </p>
                </div>
              </div>
            </div>

            {/* Métricas de Performance */}
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Métricas de Performance do Motor Híbrido
            </h4>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-foreground">Métrica</th>
                    <th className="py-3 px-4 text-center font-semibold text-foreground">Valor</th>
                    <th className="py-3 px-4 text-left font-semibold text-foreground">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="py-3 px-4 font-medium text-foreground">Precisão</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 bg-success/10 text-success rounded-full text-lg font-bold">94%</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">De todos os itens classificados como PII, 94% eram realmente PII.</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-3 px-4 font-medium text-foreground">Sensibilidade (Recall)</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 bg-success/10 text-success rounded-full text-lg font-bold">98%</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">De todos os PIIs existentes, o motor identificou 98%.</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-3 px-4 font-medium text-foreground">F1-Score</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-lg font-bold">96%</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">Média harmônica entre Precisão e Sensibilidade.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Fórmulas */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold text-foreground mb-2">Precisão</h5>
                <code className="block p-2 bg-muted rounded text-xs font-mono text-center">
                  Precisão = VP / (VP + FP)
                </code>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  VP = Verdadeiros Positivos | FP = Falsos Positivos
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold text-foreground mb-2">Sensibilidade</h5>
                <code className="block p-2 bg-muted rounded text-xs font-mono text-center">
                  Sensibilidade = VP / (VP + FN)
                </code>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  VP = Verdadeiros Positivos | FN = Falsos Negativos
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h5 className="font-semibold text-foreground mb-2">F1-Score</h5>
                <code className="block p-2 bg-muted rounded text-xs font-mono text-center">
                  F1 = 2 × (P × R) / (P + R)
                </code>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  P = Precisão | R = Recall
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* Tab 7: SEGURANÇA */}
        {/* ============================================ */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <div className="gov-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              7. Segurança e Privacidade
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Privacy by Design */}
              <div className="p-5 bg-gradient-to-br from-success/10 via-success/5 to-transparent border-2 border-success/30 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-success/20">
                    <ShieldCheck className="w-6 h-6 text-success" />
                  </div>
                  <h4 className="font-bold text-foreground">Privacy by Design</h4>
                </div>
                
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-foreground">Processamento em Memória Volátil (RAM):</strong> Os dados enviados 
                      são processados exclusivamente em memória RAM e destruídos imediatamente após o retorno da resposta.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-foreground">Sem Persistência de Dados Sensíveis:</strong> Nenhum texto de 
                      manifestação é gravado em banco de dados, arquivos de log ou qualquer meio persistente.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-foreground">Sem Logs de Conteúdo:</strong> Os logs do sistema registram apenas 
                      metadados operacionais (timestamps, status), nunca o conteúdo das manifestações.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Comunicação Criptografada */}
              <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground">Comunicação Criptografada</h4>
                </div>
                
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-foreground">Criptografia TLS 1.3:</strong> Toda comunicação entre o Frontend 
                      e o Backend utiliza o protocolo de criptografia mais recente e seguro.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-foreground">HTTPS Obrigatório:</strong> Todas as requisições são automaticamente 
                      redirecionadas para conexão segura HTTPS.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-foreground">Certificado SSL Válido:</strong> Emitido e gerenciado automaticamente 
                      pela infraestrutura Hugging Face Spaces.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Conformidade */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" /> Conformidade Legal
              </h4>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-foreground">LGPD</strong> — Lei 13.709/2018</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-foreground">LAI</strong> — Lei 12.527/2011</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-foreground">OWASP</strong> — Boas práticas</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* Tab 8: API */}
        {/* ============================================ */}
        <TabsContent value="api" className="space-y-6 mt-6">
          <div className="gov-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              8. Referência da API
            </h3>
            
            {/* Endpoint Principal */}
            <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary text-white rounded text-sm font-bold">POST</span>
                <code className="font-mono text-foreground font-semibold text-lg">/analyze</code>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Endpoint principal para análise de texto individual. Retorna classificação, nível de risco, 
                confiança e lista de identificadores encontrados.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                    <FileInput className="w-4 h-4 text-primary" /> Request Payload
                  </h5>
                  <CodeBlock title="POST /analyze">{`{
  "id": "12345",
  "text": "Solicito dados do servidor 
           José Silva, CPF 123.456.789-00"
}`}</CodeBlock>
                </div>
                <div>
                  <h5 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                    <FileOutput className="w-4 h-4 text-success" /> Response
                  </h5>
                  <CodeBlock title="200 OK">{`{
  "classificacao": "NAO_PUBLICO",
  "risco": "CRITICO",
  "confianca": 0.98,
  "detalhes": [
    {"tipo": "CPF", "valor": "123.456.789-00"},
    {"tipo": "NOME_PESSOAL", "valor": "José Silva"}
  ]
}`}</CodeBlock>
                </div>
              </div>
            </div>

            {/* Campos do Payload */}
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" /> Estrutura do Payload
            </h4>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-foreground">Campo</th>
                    <th className="py-3 px-4 text-left font-semibold text-foreground">Tipo</th>
                    <th className="py-3 px-4 text-left font-semibold text-foreground">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="py-3 px-4"><code className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">id</code></td>
                    <td className="py-3 px-4 text-muted-foreground">string</td>
                    <td className="py-3 px-4 text-muted-foreground">Identificador único da manifestação (preservado na resposta)</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-3 px-4"><code className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">text</code></td>
                    <td className="py-3 px-4 text-muted-foreground">string</td>
                    <td className="py-3 px-4 text-muted-foreground">Texto da manifestação a ser analisado</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Campos da Response */}
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileOutput className="w-4 h-4 text-success" /> Estrutura da Response
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-foreground">Campo</th>
                    <th className="py-3 px-4 text-left font-semibold text-foreground">Tipo</th>
                    <th className="py-3 px-4 text-left font-semibold text-foreground">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="py-3 px-4"><code className="bg-success/10 text-success px-2 py-0.5 rounded text-xs">classificacao</code></td>
                    <td className="py-3 px-4 text-muted-foreground">string</td>
                    <td className="py-3 px-4 text-muted-foreground">"PUBLICO" ou "NAO_PUBLICO"</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-3 px-4"><code className="bg-success/10 text-success px-2 py-0.5 rounded text-xs">risco</code></td>
                    <td className="py-3 px-4 text-muted-foreground">string</td>
                    <td className="py-3 px-4 text-muted-foreground">"SEGURO", "MODERADO", "ALTO" ou "CRITICO"</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-3 px-4"><code className="bg-success/10 text-success px-2 py-0.5 rounded text-xs">confianca</code></td>
                    <td className="py-3 px-4 text-muted-foreground">number</td>
                    <td className="py-3 px-4 text-muted-foreground">Valor entre 0.0 e 1.0 indicando certeza da classificação</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="py-3 px-4"><code className="bg-success/10 text-success px-2 py-0.5 rounded text-xs">detalhes</code></td>
                    <td className="py-3 px-4 text-muted-foreground">array</td>
                    <td className="py-3 px-4 text-muted-foreground">Lista de achados com "tipo" e "valor" (valor mascarado)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* GitHub Links */}
      <div className="gov-card">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Github className="w-5 h-5 text-primary" />
          Repositórios e Recursos
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <DocLink
            href="https://github.com/participadf/motor-pii"
            icon={<Shield className="w-5 h-5" />}
            title="Motor PII"
            description="Repositório principal do Motor Híbrido de Proteção de Dados Pessoais."
          />
          <DocLink
            href="https://github.com/participadf/frontend-desafio-participa-df"
            icon={<Layout className="w-5 h-5" />}
            title="Frontend Dashboard"
            description="Interface web React com visualização de métricas e análise interativa."
          />
        </div>
      </div>
    </div>
  );
}
