"""
PIIConfidenceCalculator - Orquestrador principal do sistema de confiança.

Integra todos os componentes:
- Calibração de scores (IsotonicCalibrator)
- Validação de dígitos verificadores (DVValidator)
- Combinação de probabilidades (ProbabilityCombiner)
- Agregação de entidades (EntityAggregator)
"""

from typing import List, Dict, Optional, Any, Tuple
import logging

from .types import (
    PIIEntity, 
    DocumentConfidence, 
    SourceDetection,
    DetectionSource,
    ConfidenceLevel
)
from .config import (
    FN_RATES, 
    FP_RATES, 
    BASE_CONFIDENCE,
    PESOS_LGPD,
    CONFIDENCE_THRESHOLDS,
    DV_SUPPORTED_TYPES,
    PRIOR_PII,
    CONTEXT_KEYWORDS
)
from .calibration import CalibratorRegistry
from .validators import DVValidator
from .combiners import ProbabilityCombiner, EntityAggregator

logger = logging.getLogger(__name__)


class PIIConfidenceCalculator:
    """Calculador principal de confiança probabilística para PII.
    
    Este módulo orquestra todos os componentes do sistema de confiança:
    
    1. **Calibração**: Converte scores brutos de cada fonte em probabilidades
       calibradas usando regressão isotônica ou heurísticas conservadoras.
       
    2. **Validação DV**: Para tipos com dígitos verificadores (CPF, CNPJ, etc),
       adiciona evidência extra baseada na validade matemática.
       
    3. **Combinação**: Usa Log-Odds (Naive Bayes) para combinar probabilidades
       de múltiplas fontes de detecção.
       
    4. **Métricas de Documento**: Calcula confidence_no_pii e confidence_all_found.
    
    Usage:
        calculator = PIIConfidenceCalculator()
        
        # Para uma entidade com múltiplas detecções
        entity = calculator.calculate_entity_confidence(
            tipo="CPF",
            valor="123.456.789-09",
            detections=[
                {"source": "bert_ner", "score": 0.95},
                {"source": "regex", "score": 1.0},
            ]
        )
        
        # Para documento completo
        doc_confidence = calculator.calculate_document_confidence(
            entities=[entity1, entity2],
            sources_used=["bert_ner", "spacy", "regex"]
        )
    """
    
    def __init__(
        self,
        fn_rates: Optional[Dict[str, float]] = None,
        fp_rates: Optional[Dict[str, float]] = None,
        prior: float = PRIOR_PII
    ):
        """Inicializa o calculador.
        
        Args:
            fn_rates: Taxas de false negative por fonte
            fp_rates: Taxas de false positive por fonte
            prior: Probabilidade base de existir PII
        """
        self.fn_rates = fn_rates or FN_RATES
        self.fp_rates = fp_rates or FP_RATES
        self.prior = prior
        
        # Componentes
        self.calibrators = CalibratorRegistry()
        self.dv_validator = DVValidator()
        self.combiner = ProbabilityCombiner(
            fn_rates=self.fn_rates,
            fp_rates=self.fp_rates,
            prior=self.prior
        )
        self.aggregator = EntityAggregator(self.combiner)
    
    def calibrate_score(
        self, 
        source: str, 
        raw_score: float
    ) -> float:
        """Calibra score bruto de uma fonte.
        
        Args:
            source: Nome da fonte (bert_ner, spacy, regex)
            raw_score: Score bruto [0,1]
            
        Returns:
            Score calibrado [0,1]
        """
        calibrator = self.calibrators.get(source)
        return calibrator.calibrate(raw_score)
    
    def calculate_entity_confidence(
        self,
        tipo: str,
        valor: str,
        detections: List[Dict[str, Any]],
        context: Optional[str] = None,
        start: int = 0,
        end: int = 0
    ) -> PIIEntity:
        """Calcula confiança para uma entidade PII.
        
        Args:
            tipo: Tipo do PII (CPF, EMAIL, etc)
            valor: Valor detectado
            detections: Lista de detecções de diferentes fontes
                [{"source": "bert_ner", "score": 0.95}, ...]
            context: Contexto ao redor da entidade
            start: Posição inicial no texto
            end: Posição final no texto
            
        Returns:
            PIIEntity com confiança calculada
        """
        if not detections:
            raise ValueError("Pelo menos uma detecção é necessária")
        
        # 1. Calibra scores de cada fonte
        source_detections: List[SourceDetection] = []
        
        for det in detections:
            source_name = det.get('source', 'unknown')
            raw_score = det.get('score', 0.5)
            
            # Calibra
            calibrated = self.calibrate_score(source_name, raw_score)
            
            try:
                source_enum = DetectionSource(source_name)
            except ValueError:
                source_enum = DetectionSource.REGEX  # Fallback
            
            source_detections.append(SourceDetection(
                source=source_enum,
                raw_score=raw_score,
                calibrated_score=calibrated,
                is_positive=True
            ))
        
        # 2. Adiciona evidência de DV se aplicável
        tipo_upper = tipo.upper()
        if tipo_upper in DV_SUPPORTED_TYPES:
            dv_conf, is_valid = self.dv_validator.get_dv_confidence(tipo_upper, valor)
            
            if is_valid is not None:  # Conseguiu validar
                source_detections.append(SourceDetection(
                    source=DetectionSource.DV_VALIDATION,
                    raw_score=dv_conf,
                    calibrated_score=dv_conf,  # DV já é calibrado
                    is_positive=is_valid
                ))
        
        # 3. Analisa contexto se disponível
        context_factor = self._analyze_context(context, tipo) if context else 1.0
        
        # 4. Combina todas as fontes
        base_confidence = self.combiner.combine_detections(source_detections)
        
        # 5. Aplica fator de contexto
        final_confidence = base_confidence * context_factor
        final_confidence = min(0.9999, max(0.0001, final_confidence))
        
        # 6. Determina nível de confiança
        confidence_level = self._get_confidence_level(final_confidence)
        
        # 7. Pega peso LGPD
        peso_lgpd = PESOS_LGPD.get(tipo_upper, 3)
        
        # 8. Lista fontes que detectaram
        sources = [
            d.source.value if hasattr(d.source, 'value') else str(d.source) 
            for d in source_detections 
            if d.is_positive
        ]
        
        return PIIEntity(
            tipo=tipo,
            valor=valor,
            confianca=final_confidence,
            confidence_level=confidence_level,
            sources=sources,
            peso_lgpd=peso_lgpd,
            start=start,
            end=end,
            dv_valid=any(
                d.source == DetectionSource.DV_VALIDATION and d.is_positive 
                for d in source_detections
            )
        )
    
    def calculate_document_confidence(
        self,
        entities: List[PIIEntity],
        sources_used: List[str],
        text_length: int = 0
    ) -> DocumentConfidence:
        """Calcula métricas de confiança para documento completo.
        
        Args:
            entities: Lista de PIIEntity detectadas
            sources_used: Lista de fontes que participaram da análise
            text_length: Tamanho do texto analisado
            
        Returns:
            DocumentConfidence com todas as métricas
        """
        has_pii = len(entities) > 0
        
        if not has_pii:
            # Nenhuma entidade detectada
            confidence_no_pii = self.combiner.confidence_no_pii(sources_used)
            
            return DocumentConfidence(
                has_pii=False,
                confidence_no_pii=confidence_no_pii,
                confidence_all_found=None,
                confidence_min_entity=None,
                entities=[]
            )
        
        # Tem entidades
        entity_confidences = [e.confianca for e in entities]
        
        # Conta quantas fontes concordaram (média)
        avg_sources = sum(len(e.sources) for e in entities) / len(entities)
        
        confidence_all_found = self.combiner.confidence_all_found(
            entity_confidences,
            num_sources_agreed=int(avg_sources)
        )
        
        min_confidence = min(entity_confidences)
        
        return DocumentConfidence(
            has_pii=True,
            confidence_no_pii=0.0,
            confidence_all_found=confidence_all_found,
            confidence_min_entity=min_confidence,
            entities=entities
        )
    
    def process_raw_detections(
        self,
        raw_detections: List[Dict[str, Any]],
        sources_used: List[str],
        text: Optional[str] = None
    ) -> DocumentConfidence:
        """Processa detecções brutas e retorna confiança de documento.
        
        Interface de alto nível que:
        1. Agrega detecções por posição
        2. Calcula confiança de cada entidade
        3. Retorna métricas de documento
        
        Args:
            raw_detections: Lista de detecções brutas do detector
                [{"tipo": "CPF", "valor": "123...", "start": 10, "end": 25, 
                  "source": "bert_ner", "score": 0.95}, ...]
            sources_used: Fontes que participaram da análise
            text: Texto original (para contexto)
            
        Returns:
            DocumentConfidence com todas as entidades processadas
        """
        if not raw_detections:
            return self.calculate_document_confidence([], sources_used)
        
        # Agrupa por posição
        aggregated = self.aggregator.aggregate_by_position(raw_detections)
        
        # Converte para PIIEntity com confiança calculada
        entities: List[PIIEntity] = []
        
        for det in aggregated:
            tipo = det.get('tipo', 'UNKNOWN')
            valor = det.get('valor', '')
            start = det.get('start', 0)
            end = det.get('end', 0)
            
            # Extrai contexto se texto disponível
            context = None
            if text and start > 0 and end > 0:
                ctx_start = max(0, start - 50)
                ctx_end = min(len(text), end + 50)
                context = text[ctx_start:ctx_end]
            
            # Monta detecções para esta entidade
            if 'sources' in det:
                # Já agregado
                detections = [
                    {'source': s, 'score': det.get('confianca', 0.8)}
                    for s in det['sources']
                ]
            else:
                detections = [
                    {'source': det.get('source', 'regex'), 'score': det.get('score', 0.8)}
                ]
            
            entity = self.calculate_entity_confidence(
                tipo=tipo,
                valor=valor,
                detections=detections,
                context=context,
                start=start,
                end=end
            )
            
            entities.append(entity)
        
        return self.calculate_document_confidence(
            entities=entities,
            sources_used=sources_used,
            text_length=len(text) if text else 0
        )
    
    def _analyze_context(self, context: str, tipo: str) -> float:
        """Analisa contexto para ajustar confiança.
        
        Args:
            context: Texto ao redor da entidade
            tipo: Tipo do PII
            
        Returns:
            Fator multiplicador (0.8 a 1.2)
        """
        if not context:
            return 1.0
        
        context_lower = context.lower()
        
        # Busca keywords de contexto
        keywords = CONTEXT_KEYWORDS.get(tipo.upper(), [])
        
        matches = sum(1 for kw in keywords if kw in context_lower)
        
        if matches == 0:
            return 0.95  # Leve penalidade por falta de contexto
        elif matches == 1:
            return 1.0  # Neutro
        elif matches >= 2:
            return 1.1  # Boost por contexto forte
        
        return 1.0
    
    def _get_confidence_level(self, confidence: float) -> ConfidenceLevel:
        """Converte confiança numérica em nível.
        
        Args:
            confidence: Valor de confiança [0,1]
            
        Returns:
            ConfidenceLevel enum
        """
        if confidence >= CONFIDENCE_THRESHOLDS['very_high']:
            return ConfidenceLevel.VERY_HIGH
        elif confidence >= CONFIDENCE_THRESHOLDS['high']:
            return ConfidenceLevel.HIGH
        elif confidence >= CONFIDENCE_THRESHOLDS['medium']:
            return ConfidenceLevel.MEDIUM
        elif confidence >= CONFIDENCE_THRESHOLDS['low']:
            return ConfidenceLevel.LOW
        else:
            return ConfidenceLevel.VERY_LOW
    
    # =========================================================================
    # Métodos de compatibilidade com API antiga
    # =========================================================================
    
    def to_legacy_format(
        self, 
        doc_confidence: DocumentConfidence
    ) -> List[Dict[str, Any]]:
        """Converte para formato legado (compatibilidade).
        
        Args:
            doc_confidence: DocumentConfidence calculada
            
        Returns:
            Lista de dicts no formato antigo
        """
        return doc_confidence.to_legacy_list()
    
    def calculate_simple(
        self,
        tipo: str,
        metodo: str,
        score: float = 1.0,
        valor: Optional[str] = None
    ) -> float:
        """Interface simplificada para cálculo de confiança.
        
        Compatível com chamadas simples sem todo o contexto.
        
        Args:
            tipo: Tipo do PII
            metodo: Método de detecção (bert_ner, spacy, regex)
            score: Score bruto
            valor: Valor para validação DV
            
        Returns:
            Confiança calibrada
        """
        detections = [{'source': metodo, 'score': score}]
        
        entity = self.calculate_entity_confidence(
            tipo=tipo,
            valor=valor or '',
            detections=detections
        )
        
        return entity.confianca


# Singleton para uso global
_calculator_instance: Optional[PIIConfidenceCalculator] = None


def get_calculator() -> PIIConfidenceCalculator:
    """Retorna instância singleton do calculador."""
    global _calculator_instance
    if _calculator_instance is None:
        _calculator_instance = PIIConfidenceCalculator()
    return _calculator_instance
