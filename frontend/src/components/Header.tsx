import { Shield, Github } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: '#E3ECFA' }}>
              <Shield className="w-6 h-6 text-[#1351B4]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Desafio Participa DF – Conectando Governo e Cidadão</h1>
              <p className="text-xs text-primary-foreground/70">Categoria Acesso à Informação: Módulo de Identificação de Dados Pessoais</p>
            </div>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/marinhothiago/desafio-participa-df"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
            title="Ver código no GitHub"
          >
            <Github className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
