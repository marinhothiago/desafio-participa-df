"""
Padrões regex específicos para entidades do GDF.
"""

import re

# Exemplos de padrões (ajuste conforme necessário)

# Matrícula GDF: 7 ou 8 dígitos, pode ter hífen/letra
PATTERNS = {
    # Matrícula funcional: 7-8 dígitos, opcional hífen/letra
    'matricula_gdf': r'\b\d{7,8}[A-Za-zXx-]?\b',

    # Processo SEI/GDF - Padrões abrangentes baseados em casos reais:
    # Formatos encontrados na AMOSTRA:
    # - 00015-01009853/2026-01 (5-8/4-2)
    # - 22009-98514623/2017-26 (5-8/4-2)  
    # - 56478.000012/2026-05 (5.6/4-2) - com PONTO
    # - 0315-000009878/2023-15 (4-9/4-2)
    # - 589642/2018-58 (6/4-2) - sem hífen inicial
    # - 0032185265/2024 (10/4) - sem hífen, sem sufixo
    # - 1002-853241/2019 (4-6/4)
    # - 0003689712003/2025-06 (13/4-2)
    'processo_sei': (
        r'\b\d{4,5}[-\.]\d{5,10}/\d{4}(?:-\d{2})?\b|'  # Com hífen ou ponto: XXXXX-XXXXXXXX/YYYY-ZZ
        r'\b\d{5,13}/\d{4}(?:-\d{2})?\b|'              # Sem hífen: XXXXX.../YYYY-ZZ
        r'\bProcesso(?:\s+(?:SEI|n[°º]?|nº?))?\s*:?\s*\d{4,13}[-\./]?\d{0,10}/?(?:\d{4})?(?:-\d{2})?\b'  # Com contexto
    ),

    # CNH: 10, 11 ou 12 dígitos (com ou sem contexto)
    # CNH: 10, 11 ou 12 dígitos, ultra-tolerante a separadores, espaços, pontuação
    'cnh': r'(?:(?:cnh|carteira de motorista|habilita[cç][aã]o|documento de identifica(?:ção|cao)?|minha cnh|meu documento|minha carteira|identidade civil|identidade|meu rg|minha identidade)[\s:;,.\-]*)?(\d{2}[\s\-\.]?\d{2}[\s\-\.]?\d{2}[\s\-\.]?\d{2,6})',

    # CPF: 3 blocos de 3 dígitos, hífen e 2 dígitos OU sem formatação OU com dígito faltando
    # CPF: 3 blocos de 3 dígitos, hífen e 2 dígitos OU sem formatação OU com dígito faltando
    'cpf': r'\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b|\b\d{3}\.\d{3}\.\d{3}-\d{1}\b|\b\d{3}\.\d{3}\.\d{3}\b',

    # Telefone: ultra-permissivo, aceita qualquer sequência de 10 ou 11 dígitos (com ou sem DDD, espaços, hífens, etc.)
    'telefone': r'(?<!\d)(\d{2}[\s-]?)?9?\d{4}[\s-]?\d{4}(?!\d)',

    # Agência/conta bancária: ultra-tolerante, cobre variações e formatos comuns
    'agencia_conta': r'(ag[êe]ncia|ag)\s*\d{3,4}\s*(conta( corrente| c/c| cc)?|c/c|cc)?\s*\d{5,8}-\d|conta:?\s*\d{5,8}-\d|cc:?\s*\d{5,8}-\d',

    # Código de barras: 11+ dígitos, mas só se não houver contexto de CNH
    'codigo_barras': r'\b\d{11,}\b',
}

def get_pattern(name: str):
    """Retorna o padrão regex pelo nome."""
    return PATTERNS.get(name)
