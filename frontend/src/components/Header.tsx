import { Shield, User } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-[#1351B4] shadow-lg">
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-10 py-4 flex items-center justify-between">
        
        {/* Logo e Título */}
        <div className="flex items-center gap-4">
          <Shield className="w-10 h-10 text-white flex-shrink-0" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white leading-tight">
              Desafio Participa DF – Conectando Governo e Cidadão
            </h1>
            <p className="text-sm text-blue-100 leading-tight">
              Categoria Acesso à Informação: Módulo de Identificação de Dados Pessoais
            </p>
          </div>
        </div>

        {/* Servidor Button */}
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg cursor-pointer transition-colors flex-shrink-0 ml-6">
          <span className="text-white font-medium text-sm">Servidor</span>
          <span className="text-white font-bold text-xs">CGDF</span>
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </header>
  );
}
