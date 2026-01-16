"""
Calibração de scores de modelos de ML.

Modelos neurais como BERT são frequentemente "overconfident" - retornam
probabilidades muito altas (0.99) quando a real deveria ser menor (0.85).

A calibração isotônica ajusta os scores para refletir a probabilidade real
de acerto baseada em dados de validação.
"""

import math
from typing import List, Optional, Dict, Tuple
import logging

logger = logging.getLogger(__name__)


class IsotonicCalibrator:
    """Calibrador isotônico para scores de modelos.
    
    Usa regressão isotônica para mapear scores brutos para probabilidades
    calibradas. Quando não há dados de treino, usa um fallback baseado em
    heurísticas conservadoras.
    """
    
    def __init__(self, source_name: str = "unknown"):
        """Inicializa o calibrador.
        
        Args:
            source_name: Nome da fonte (para logging)
        """
        self.source_name = source_name
        self.is_fitted = False
        self.calibration_map: List[Tuple[float, float]] = []
        self._sklearn_model = None
        
    def fit(self, raw_scores: List[float], true_labels: List[int]) -> None:
        """Treina o calibrador com dados de validação.
        
        Args:
            raw_scores: Lista de scores brutos do modelo (0-1)
            true_labels: Lista de labels verdadeiros (0 ou 1)
        """
        if len(raw_scores) != len(true_labels):
            raise ValueError("raw_scores e true_labels devem ter mesmo tamanho")
        
        if len(raw_scores) < 10:
            logger.warning(
                f"[{self.source_name}] Poucos dados para calibração ({len(raw_scores)}). "
                "Usando fallback."
            )
            return
        
        try:
            from sklearn.isotonic import IsotonicRegression
            
            self._sklearn_model = IsotonicRegression(
                out_of_bounds='clip',
                y_min=0.001,
                y_max=0.999
            )
            self._sklearn_model.fit(raw_scores, true_labels)
            self.is_fitted = True
            
            logger.info(
                f"[{self.source_name}] Calibrador isotônico treinado com "
                f"{len(raw_scores)} amostras"
            )
            
        except ImportError:
            logger.warning(
                f"[{self.source_name}] sklearn não disponível. Usando fallback."
            )
            self._build_simple_calibration(raw_scores, true_labels)
    
    def _build_simple_calibration(
        self, 
        raw_scores: List[float], 
        true_labels: List[int]
    ) -> None:
        """Constrói calibração simples sem sklearn.
        
        Agrupa scores em bins e calcula precisão média por bin.
        """
        # Agrupa em 10 bins
        bins = [[] for _ in range(10)]
        
        for score, label in zip(raw_scores, true_labels):
            bin_idx = min(int(score * 10), 9)
            bins[bin_idx].append((score, label))
        
        # Calcula precisão por bin
        self.calibration_map = []
        for i, bin_data in enumerate(bins):
            if bin_data:
                avg_score = sum(s for s, _ in bin_data) / len(bin_data)
                precision = sum(l for _, l in bin_data) / len(bin_data)
                self.calibration_map.append((avg_score, precision))
        
        if self.calibration_map:
            self.is_fitted = True
    
    def calibrate(self, raw_score: float) -> float:
        """Calibra um score bruto.
        
        Args:
            raw_score: Score bruto do modelo (0-1)
            
        Returns:
            Score calibrado (0-1)
        """
        # Clamp input
        raw_score = max(0.0, min(1.0, raw_score))
        
        # Se tem sklearn model
        if self._sklearn_model is not None:
            try:
                return float(self._sklearn_model.predict([[raw_score]])[0])
            except Exception:
                pass
        
        # Se tem calibration map simples
        if self.calibration_map:
            return self._interpolate(raw_score)
        
        # Fallback conservador: reduz overconfidence
        return self._conservative_fallback(raw_score)
    
    def _interpolate(self, raw_score: float) -> float:
        """Interpola na tabela de calibração."""
        if not self.calibration_map:
            return raw_score
        
        # Encontra bins vizinhos
        lower = (0.0, 0.0)
        upper = (1.0, 1.0)
        
        for score, precision in self.calibration_map:
            if score <= raw_score:
                lower = (score, precision)
            if score >= raw_score:
                upper = (score, precision)
                break
        
        # Interpola
        if upper[0] == lower[0]:
            return lower[1]
        
        ratio = (raw_score - lower[0]) / (upper[0] - lower[0])
        return lower[1] + ratio * (upper[1] - lower[1])
    
    def _conservative_fallback(self, raw_score: float) -> float:
        """Fallback conservador quando não há calibração.
        
        Modelos neurais são overconfident. Esta heurística reduz scores
        altos de forma não-linear:
        - 0.99 -> ~0.92
        - 0.95 -> ~0.88
        - 0.90 -> ~0.85
        - 0.80 -> ~0.78
        """
        if raw_score >= 0.99:
            # Muito overconfident - reduz bastante
            return 0.90 + (raw_score - 0.99) * 2
        elif raw_score >= 0.95:
            # Overconfident - reduz moderadamente
            return 0.85 + (raw_score - 0.95) * 1.5
        elif raw_score >= 0.90:
            # Levemente overconfident
            return 0.82 + (raw_score - 0.90) * 0.6
        elif raw_score >= 0.80:
            # Mais ou menos calibrado
            return raw_score - 0.02
        else:
            # Baixa confiança - mantém
            return raw_score


class CalibratorRegistry:
    """Registro de calibradores por fonte de detecção.
    
    Permite ter calibradores diferentes para BERT, spaCy, etc.
    """
    
    def __init__(self):
        self.calibrators: Dict[str, IsotonicCalibrator] = {}
        self._initialize_defaults()
    
    def _initialize_defaults(self):
        """Inicializa calibradores default para cada fonte."""
        sources = ["bert_ner", "spacy", "regex", "dv_validation", "gatilho"]
        
        for source in sources:
            self.calibrators[source] = IsotonicCalibrator(source_name=source)
    
    def get_calibrator(self, source: str) -> IsotonicCalibrator:
        """Obtém calibrador para uma fonte."""
        if source not in self.calibrators:
            self.calibrators[source] = IsotonicCalibrator(source_name=source)
        return self.calibrators[source]
    
    # Alias para conveniência
    def get(self, source: str) -> IsotonicCalibrator:
        """Alias para get_calibrator."""
        return self.get_calibrator(source)
    
    def calibrate(self, source: str, raw_score: float) -> float:
        """Calibra score de uma fonte específica."""
        calibrator = self.get_calibrator(source)
        return calibrator.calibrate(raw_score)
    
    def fit_from_validation_data(
        self, 
        source: str, 
        raw_scores: List[float], 
        true_labels: List[int]
    ) -> None:
        """Treina calibrador com dados de validação."""
        calibrator = self.get_calibrator(source)
        calibrator.fit(raw_scores, true_labels)


# Singleton global
_calibrator_registry: Optional[CalibratorRegistry] = None


def get_calibrator_registry() -> CalibratorRegistry:
    """Obtém o registro global de calibradores."""
    global _calibrator_registry
    if _calibrator_registry is None:
        _calibrator_registry = CalibratorRegistry()
    return _calibrator_registry
