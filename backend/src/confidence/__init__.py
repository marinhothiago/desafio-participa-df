"""
Sistema de Cálculo de Confiança para Detector de PII Híbrido.

Este módulo implementa cálculo probabilístico de confiança usando:
- Calibração isotônica de scores de modelos neurais
- Combinação de probabilidades via Log-Odds (Naive Bayes)
- Taxas de False Negative/Positive por fonte
- Validação de Dígito Verificador como fonte adicional

Componentes:
- PIIConfidenceCalculator: Orquestrador principal
- IsotonicCalibrator: Calibração de scores overconfident
- ProbabilityCombiner: Combinação via log-odds
- DVValidator: Validação de dígito verificador
"""

from .calculator import PIIConfidenceCalculator, get_calculator
from .types import PIIEntity, DocumentConfidence, SourceDetection, ConfidenceLevel, DetectionSource
from .config import FN_RATES, FP_RATES, CONFIDENCE_THRESHOLDS, PESOS_LGPD, PRIOR_PII
from .calibration import IsotonicCalibrator, CalibratorRegistry
from .combiners import ProbabilityCombiner, EntityAggregator
from .validators import DVValidator

__all__ = [
    'PIIConfidenceCalculator',
    'get_calculator',
    'PIIEntity',
    'DocumentConfidence',
    'SourceDetection',
    'ConfidenceLevel',
    'DetectionSource',
    'FN_RATES',
    'FP_RATES',
    'CONFIDENCE_THRESHOLDS',
    'PESOS_LGPD',
    'PRIOR_PII',
    'IsotonicCalibrator',
    'CalibratorRegistry',
    'ProbabilityCombiner',
    'EntityAggregator',
    'DVValidator',
]
