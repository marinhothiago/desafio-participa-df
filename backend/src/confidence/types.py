"""
Tipos de dados para o sistema de confiança.

Dataclasses imutáveis para representar:
- Detecções de fontes individuais
- Entidades PII com confiança
- Resultado de confiança do documento
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import Enum


class PIIType(str, Enum):
    """Tipos de PII suportados."""
    CPF = "CPF"
    CNPJ = "CNPJ"
    CNPJ_PESSOAL = "CNPJ_PESSOAL"
    PIS = "PIS"
    CNS = "CNS"
    RG = "RG"
    CNH = "CNH"
    TITULO_ELEITOR = "TITULO_ELEITOR"
    CTPS = "CTPS"
    PASSAPORTE = "PASSAPORTE"
    CERTIDAO = "CERTIDAO"
    REGISTRO_PROFISSIONAL = "REGISTRO_PROFISSIONAL"
    EMAIL_PESSOAL = "EMAIL_PESSOAL"
    TELEFONE = "TELEFONE"
    ENDERECO_RESIDENCIAL = "ENDERECO_RESIDENCIAL"
    CEP = "CEP"
    PLACA_VEICULO = "PLACA_VEICULO"
    CONTA_BANCARIA = "CONTA_BANCARIA"
    PIX = "PIX"
    CARTAO_CREDITO = "CARTAO_CREDITO"
    DATA_NASCIMENTO = "DATA_NASCIMENTO"
    PROCESSO_CNJ = "PROCESSO_CNJ"
    NOME = "NOME"


class DetectionSource(str, Enum):
    """Fontes de detecção no ensemble."""
    BERT_NER = "bert_ner"
    SPACY = "spacy"
    REGEX = "regex"
    DV_VALIDATION = "dv_validation"
    GATILHO = "gatilho"  # Padrão linguístico


class ConfidenceLevel(str, Enum):
    """Níveis de confiança categorizados."""
    VERY_HIGH = "very_high"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    VERY_LOW = "very_low"


@dataclass(frozen=True)
class SourceDetection:
    """Detecção de uma fonte individual.
    
    Attributes:
        source: Fonte que fez a detecção
        raw_score: Score bruto da fonte (0-1)
        calibrated_score: Score após calibração isotônica
        is_positive: Se a fonte detectou positivamente
    """
    source: DetectionSource
    raw_score: float
    calibrated_score: float = 0.0
    is_positive: bool = True
    
    def __post_init__(self):
        # Garante que calibrated_score seja definido se não fornecido
        if self.calibrated_score == 0.0 and self.raw_score > 0:
            object.__setattr__(self, 'calibrated_score', self.raw_score)


@dataclass
class PIIEntity:
    """Entidade PII detectada com confiança calculada.
    
    Attributes:
        tipo: Tipo de PII (CPF, EMAIL, etc)
        valor: Texto da entidade detectada
        confianca: Confiança final combinada (0-1)
        confidence_level: Nível de confiança categórico
        sources: Lista de fontes que detectaram
        peso_lgpd: Peso de risco LGPD (0-5)
        start: Posição inicial no texto
        end: Posição final no texto
        dv_valid: Se passou na validação de dígito verificador
    """
    tipo: str
    valor: str
    confianca: float
    confidence_level: ConfidenceLevel = ConfidenceLevel.MEDIUM
    sources: List[str] = field(default_factory=list)
    peso_lgpd: int = 3
    start: int = 0
    end: int = 0
    dv_valid: Optional[bool] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário (compatível com API)."""
        return {
            "tipo": self.tipo,
            "valor": self.valor,
            "confianca": round(self.confianca, 5),
            "confidence_level": self.confidence_level.value,
            "inicio": self.start,
            "fim": self.end,
            "sources": self.sources,
            "dv_valid": self.dv_valid,
            "peso": self.peso_lgpd,
        }
    
    def to_legacy_dict(self) -> Dict[str, Any]:
        """Converte para formato legado (backward compatible)."""
        return {
            "tipo": self.tipo,
            "valor": self.valor,
            "confianca": round(self.confianca, 5),
        }


@dataclass
class DocumentConfidence:
    """Resultado de confiança para um documento completo.
    
    Attributes:
        has_pii: Se foi detectado algum PII
        confidence_no_pii: P(não existe PII) - válido quando has_pii=False
        confidence_all_found: P(encontramos todo PII) - válido quando has_pii=True
        confidence_min_entity: Menor confiança entre entidades
        entities: Lista de entidades detectadas
        sources_used: Fontes que participaram da análise
        risco: Nível de risco (CRÍTICO, ALTO, MODERADO, BAIXO, SEGURO)
        classificacao: PÚBLICO ou NÃO PÚBLICO
    """
    has_pii: bool
    confidence_no_pii: float
    confidence_all_found: Optional[float] = None
    confidence_min_entity: Optional[float] = None
    entities: List[PIIEntity] = field(default_factory=list)
    sources_used: List[str] = field(default_factory=list)
    risco: str = "SEGURO"
    classificacao: str = "PÚBLICO"
    
    def __post_init__(self):
        """Calcula classificação e risco após inicialização."""
        if self.has_pii and self.entities:
            # Calcula risco pelo maior peso LGPD
            max_peso = max(e.peso_lgpd for e in self.entities)
            self.risco = {
                5: "CRÍTICO",
                4: "ALTO",
                3: "MODERADO",
                2: "BAIXO",
            }.get(max_peso, "MODERADO")
            self.classificacao = "NÃO PÚBLICO"
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário completo."""
        return {
            "has_pii": self.has_pii,
            "classificacao": self.classificacao,
            "risco": self.risco,
            "confidence": {
                "no_pii": round(self.confidence_no_pii, 9) if self.confidence_no_pii else 0.0,
                "all_found": round(self.confidence_all_found, 5) if self.confidence_all_found else None,
                "min_entity": round(self.confidence_min_entity, 5) if self.confidence_min_entity else None,
            },
            "sources_used": self.sources_used,
            "entities": [e.to_dict() for e in self.entities],
            "total_entities": len(self.entities),
        }
    
    def to_legacy_response(self) -> Dict[str, Any]:
        """Converte para resposta legada da API (backward compatible)."""
        # Confiança principal: usa confidence_all_found se tem PII, senão confidence_no_pii
        if self.has_pii and self.confidence_all_found:
            confianca = self.confidence_all_found
        else:
            confianca = self.confidence_no_pii
        
        return {
            "classificacao": self.classificacao,
            "risco": self.risco,
            "confianca": round(confianca, 5) if confianca else 0.5,
            "detalhes": [e.to_legacy_dict() for e in self.entities],
        }
    
    def to_legacy_list(self) -> List[Dict[str, Any]]:
        """Retorna lista de detalhes no formato legado."""
        return [e.to_legacy_dict() for e in self.entities]
