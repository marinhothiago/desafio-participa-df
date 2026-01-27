"""
Analisador de PII usando Microsoft Presidio com Recognizers Customizados para o GDF.

Recognizers customizados adicionados:
- PROCESSO_SEI: Processos do SEI-GDF
- PROCESSO_CNJ: Numeração única do CNJ
- PROTOCOLO_LAI: Protocolos de LAI
- MATRICULA_GDF: Matrículas de servidores GDF
- INSCRICAO_CAESB: Inscrições da CAESB
- OAB_REGISTRO: Registros da OAB
- TELEFONE_BR: Telefones brasileiros
- CEP_BR: CEPs brasileiros

NOTA: Este analisador usa APENAS recognizers customizados para pt-BR.
      Os recognizers built-in do Presidio (en, es, it, pl) NÃO são carregados.
"""

from typing import List, Dict, Any
import logging

try:
    from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
    from presidio_analyzer.nlp_engine import NlpEngineProvider
    from presidio_analyzer import RecognizerRegistry
    from presidio_analyzer.predefined_recognizers import SpacyRecognizer
    PRESIDIO_AVAILABLE = True
except ImportError:
    AnalyzerEngine = None
    PatternRecognizer = None
    Pattern = None
    RecognizerRegistry = None
    SpacyRecognizer = None
    PRESIDIO_AVAILABLE = False

# Silencia logs do Presidio durante inicialização
logging.getLogger("presidio-analyzer").setLevel(logging.ERROR)


# === PADRÕES CUSTOMIZADOS PARA O GDF ===
GDF_PATTERNS = {
    # Processo SEI - múltiplos formatos
    "PROCESSO_SEI": [
        Pattern(name="sei_padrao", regex=r"\d{5}-\d{8}/\d{4}-\d{2}", score=0.9),
        Pattern(name="sei_ponto", regex=r"\d{4,5}[.-]\d{5,10}/\d{4}(?:-\d{2})?", score=0.85),
        Pattern(name="sei_simples", regex=r"\d{5,13}/\d{4}(?:-\d{2})?", score=0.7),
    ],
    
    # Processo CNJ - Resolução 65/2008
    "PROCESSO_CNJ": [
        Pattern(name="cnj_padrao", regex=r"\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}", score=0.95),
    ],
    
    # Protocolo LAI
    "PROTOCOLO_LAI": [
        Pattern(name="lai_padrao", regex=r"LAI-?\d{5,8}/?\d{0,4}", score=0.9),
        Pattern(name="ouv_padrao", regex=r"OUV-\d{5,8}/\d{4}", score=0.9),
    ],
    
    # Matrícula GDF - formato XX-XXXX-X ou similar
    "MATRICULA_GDF": [
        Pattern(name="mat_gdf", regex=r"\d{2}-\d{4}-\d{1,4}", score=0.85),
        Pattern(name="mat_ponto", regex=r"\d{2,3}\.\d{3}-\d", score=0.8),
    ],
    
    # Inscrição CAESB
    "INSCRICAO_CAESB": [
        Pattern(name="caesb", regex=r"(?:inscrição|inscricao)[:\s]*\d{6,9}-?\d?", score=0.85),
    ],
    
    # Registro OAB
    "OAB_REGISTRO": [
        Pattern(name="oab", regex=r"OAB[/-]?[A-Z]{2}[:\s]*\d{2,6}", score=0.9),
    ],
    
    # Telefone brasileiro
    "TELEFONE_BR": [
        Pattern(name="cel_ddd", regex=r"\(\d{2}\)\s*9\d{4}-?\d{4}", score=0.9),
        Pattern(name="tel_ddd", regex=r"\(\d{2}\)\s*\d{4}-?\d{4}", score=0.85),
        Pattern(name="cel_simples", regex=r"\b9\d{4}-?\d{4}\b", score=0.7),
    ],
    
    # CEP brasileiro
    "CEP_BR": [
        Pattern(name="cep", regex=r"\d{5}-?\d{3}", score=0.7),
    ],
    
    # CPF brasileiro (complementa o built-in)
    "CPF_BR": [
        Pattern(name="cpf", regex=r"\d{3}\.\d{3}\.\d{3}-\d{2}", score=0.9),
        Pattern(name="cpf_simples", regex=r"\b\d{11}\b", score=0.5),
    ],
    
    # CNPJ brasileiro
    "CNPJ_BR": [
        Pattern(name="cnpj", regex=r"\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}", score=0.9),
    ],
    
    # Data de nascimento
    "DATA_NASCIMENTO": [
        Pattern(name="data_nasc", regex=r"(?:nascimento|nasc\.?)[:\s]*\d{2}/\d{2}/\d{4}", score=0.85),
        Pattern(name="data_br", regex=r"\(\d{2}/\d{2}/\d{4}\)", score=0.7),
    ],
}


def _criar_recognizers_customizados() -> List:
    """Cria todos os recognizers customizados para o GDF."""
    if not PRESIDIO_AVAILABLE:
        return []
    
    recognizers = []
    for entity_type, patterns in GDF_PATTERNS.items():
        recognizer = PatternRecognizer(
            supported_entity=entity_type,
            patterns=patterns,
            name=f"gdf_{entity_type.lower()}_recognizer",
            supported_language="pt"  # IMPORTANTE: define idioma pt
        )
        recognizers.append(recognizer)
    
    return recognizers


class PresidioAnalyzer:
    """
    Detecta entidades PII usando o Presidio AnalyzerEngine.
    Inclui APENAS recognizers customizados para padrões específicos do GDF/Brasil.
    
    IMPORTANTE: Este analyzer NÃO carrega os recognizers built-in do Presidio
    (que são para en, es, it, pl), evitando warnings de idioma não suportado.
    """
    
    def __init__(self):
        if not PRESIDIO_AVAILABLE:
            self.engine = None
            return
            
        try:
            # === PASSO 1: Configura NLP Engine com pt-BR ===
            configuration = {
                "nlp_engine_name": "spacy",
                "models": [{"lang_code": "pt", "model_name": "pt_core_news_lg"}]
            }
            
            provider = NlpEngineProvider(nlp_configuration=configuration)
            nlp_engine = provider.create_engine()
            
            # === PASSO 2: Cria registry VAZIO (sem recognizers built-in) ===
            # Isso evita carregar CreditCardRecognizer, IbanRecognizer etc
            # que só funcionam para en/es/it/pl e geram warnings
            registry = RecognizerRegistry()
            registry.supported_languages = ["pt"]
            
            # === PASSO 3: Adiciona SpacyRecognizer para NER básico ===
            # Necessário para o NLP engine funcionar corretamente
            spacy_recognizer = SpacyRecognizer(
                supported_language="pt",
                supported_entities=["PERSON", "LOCATION", "ORGANIZATION", "DATE"]
            )
            registry.add_recognizer(spacy_recognizer)
            
            # === PASSO 4: Adiciona nossos recognizers customizados ===
            custom_recognizers = _criar_recognizers_customizados()
            for recognizer in custom_recognizers:
                registry.add_recognizer(recognizer)
            
            # === PASSO 5: Inicializa engine com registry customizado ===
            self.engine = AnalyzerEngine(
                nlp_engine=nlp_engine,
                supported_languages=["pt"],
                registry=registry  # Registry SEM recognizers built-in (exceto Spacy)
            )
            
            # Lista de entidades suportadas (customizadas + spaCy básico)
            self.supported_entities = list(GDF_PATTERNS.keys())
            
        except Exception as e:
            print(f"[PresidioAnalyzer] Erro ao inicializar: {e}")
            import traceback
            traceback.print_exc()
            self.engine = None
            self.engine = None

    def analyze(self, text: str, entities: List[str] = None) -> List[Dict[str, Any]]:
        """
        Analisa texto em busca de PIIs.
        
        Args:
            text: Texto a ser analisado
            entities: Lista de entidades a buscar (None = todas disponíveis)
            
        Returns:
            Lista de dicionários com PIIs encontrados
        """
        if not self.engine:
            return []
        
        try:
            # Obtém todas as entidades registradas no registry
            all_entities = self.engine.get_supported_entities(language="pt")
            
            # Se especificou entidades, filtra apenas as que existem
            if entities is not None:
                entities_to_use = [e for e in entities if e in all_entities]
            else:
                entities_to_use = all_entities
            
            if not entities_to_use:
                return []
            
            results = self.engine.analyze(
                text=text, 
                language="pt",
                entities=entities_to_use
            )
            
            return [
                {
                    'entity': r.entity_type,
                    'start': r.start,
                    'end': r.end,
                    'score': r.score,
                    'value': text[r.start:r.end]
                }
                for r in results
            ]
        except Exception as e:
            print(f"[PresidioAnalyzer] Erro na análise: {e}")
            return []
    
    def get_supported_entities(self) -> List[str]:
        """Retorna lista de entidades suportadas."""
        if not self.engine:
            return []
        return self.supported_entities
