"""Testes de Explicabilidade (XAI) - Verifica que cada finding tem explicação detalhada."""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

import pytest
from src.detector import PIIDetector


@pytest.fixture(scope="module")
def detector():
    """Fixture que cria detector uma única vez para todos os testes."""
    return PIIDetector(usar_gpu=False, use_llm_arbitration=False)


class TestExplicabilidade:
    """Testes para verificar que a explicabilidade (XAI) está funcionando."""
    
    def test_explicacao_presente_cpf(self, detector):
        """Verifica que CPF detectado tem explicação completa."""
        has_pii, findings, risco, conf = detector.detect("Meu CPF é 123.456.789-09")
        
        assert has_pii is True
        assert len(findings) >= 1
        
        cpf_finding = next((f for f in findings if f['tipo'] == 'CPF'), None)
        assert cpf_finding is not None, "CPF deveria ser detectado"
        
        # Verifica estrutura da explicação
        assert 'explicacao' in cpf_finding, "Campo 'explicacao' deve estar presente"
        exp = cpf_finding['explicacao']
        
        assert 'motivos' in exp, "explicacao deve ter 'motivos'"
        assert 'fontes' in exp, "explicacao deve ter 'fontes'"
        assert 'validacoes' in exp, "explicacao deve ter 'validacoes'"
        assert 'contexto' in exp, "explicacao deve ter 'contexto'"
        assert 'confianca_percent' in exp, "explicacao deve ter 'confianca_percent'"
        assert 'peso' in exp, "explicacao deve ter 'peso'"
        
        # Verifica conteúdo
        assert len(exp['motivos']) > 0, "Deve ter pelo menos um motivo"
        assert len(exp['fontes']) > 0, "Deve ter pelo menos uma fonte"
        assert isinstance(exp['peso'], int), "Peso deve ser inteiro"
        assert '%' in exp['confianca_percent'], "Confiança deve ter %"
        
    def test_explicacao_presente_telefone(self, detector):
        """Verifica que telefone detectado tem explicação completa."""
        has_pii, findings, risco, conf = detector.detect("Me ligue no (61) 99999-8888")
        
        assert has_pii is True
        
        tel_finding = next((f for f in findings if 'TELEFONE' in f['tipo'] or 'CELULAR' in f['tipo']), None)
        assert tel_finding is not None, "Telefone deveria ser detectado"
        
        assert 'explicacao' in tel_finding
        exp = tel_finding['explicacao']
        
        assert 'motivos' in exp
        assert any('Telefone' in m or 'celular' in m.lower() for m in exp['motivos']), \
            f"Motivos devem mencionar telefone: {exp['motivos']}"
        
    def test_explicacao_presente_nome(self, detector):
        """Verifica que nome detectado tem explicação com fonte NER."""
        has_pii, findings, risco, conf = detector.detect("O servidor João Silva apresentou...")
        
        assert has_pii is True
        
        nome_finding = next((f for f in findings if f['tipo'] == 'NOME'), None)
        assert nome_finding is not None, "Nome deveria ser detectado"
        
        assert 'explicacao' in nome_finding
        exp = nome_finding['explicacao']
        
        # Nomes são detectados por NER
        assert any('BERT' in f or 'spaCy' in f or 'NuNER' in f or 'Gatilho' in f for f in exp['fontes']), \
            f"Fonte NER esperada: {exp['fontes']}"
            
    def test_explicacao_presente_email(self, detector):
        """Verifica que email detectado tem explicação."""
        has_pii, findings, risco, conf = detector.detect("Contato: joao.silva@gmail.com")
        
        assert has_pii is True
        
        email_finding = next((f for f in findings if 'EMAIL' in f['tipo']), None)
        assert email_finding is not None, "Email deveria ser detectado"
        
        assert 'explicacao' in email_finding
        exp = email_finding['explicacao']
        
        assert 'email' in ' '.join(exp['motivos']).lower(), \
            f"Motivos devem mencionar email: {exp['motivos']}"
            
    def test_explicacao_validacao_dv_cpf(self, detector):
        """Verifica que CPF válido tem validação de DV na explicação."""
        # CPF com DV válido: 529.982.247-25
        has_pii, findings, risco, conf = detector.detect("CPF: 529.982.247-25")
        
        cpf_finding = next((f for f in findings if f['tipo'] == 'CPF'), None)
        assert cpf_finding is not None
        
        exp = cpf_finding['explicacao']
        
        # Verifica menção ao dígito verificador
        validacoes_str = ' '.join(exp['validacoes'])
        assert 'verificador' in validacoes_str.lower() or 'válido' in validacoes_str.lower(), \
            f"Validação de DV esperada: {exp['validacoes']}"
            
    def test_explicacao_contexto_pessoal(self, detector):
        """Verifica que contexto pessoal é identificado na explicação."""
        has_pii, findings, risco, conf = detector.detect("Meu CPF é 123.456.789-09")
        
        cpf_finding = next((f for f in findings if f['tipo'] == 'CPF'), None)
        assert cpf_finding is not None
        
        exp = cpf_finding['explicacao']
        
        # Verifica contexto pessoal
        contexto_str = ' '.join(exp['contexto'])
        assert len(exp['contexto']) > 0 or 'meu' in contexto_str.lower() or 'cpf' in contexto_str.lower(), \
            f"Contexto pessoal esperado: {exp['contexto']}"
            
    def test_explicacao_peso_critico(self, detector):
        """Verifica que CPF tem peso crítico (5) na explicação."""
        has_pii, findings, risco, conf = detector.detect("CPF: 123.456.789-09")
        
        cpf_finding = next((f for f in findings if f['tipo'] == 'CPF'), None)
        assert cpf_finding is not None
        
        exp = cpf_finding['explicacao']
        assert exp['peso'] == 5, f"CPF deveria ter peso 5 (crítico), tem {exp['peso']}"
        
    def test_explicacao_multiplos_pii(self, detector):
        """Verifica que múltiplos PIIs têm explicações individuais."""
        texto = "João Silva, CPF 123.456.789-09, telefone (61) 99999-8888"
        has_pii, findings, risco, conf = detector.detect(texto)
        
        assert has_pii is True
        assert len(findings) >= 2, f"Deveria detectar pelo menos 2 PIIs, detectou {len(findings)}"
        
        # Cada finding deve ter explicação
        for f in findings:
            assert 'explicacao' in f, f"Finding {f['tipo']} sem explicação"
            assert f['explicacao'] is not None
            assert 'motivos' in f['explicacao']
            
    def test_explicacao_formato_confianca(self, detector):
        """Verifica formato da confiança percentual."""
        has_pii, findings, risco, conf = detector.detect("CPF: 123.456.789-09")
        
        cpf_finding = next((f for f in findings if f['tipo'] == 'CPF'), None)
        assert cpf_finding is not None
        
        exp = cpf_finding['explicacao']
        
        # Deve ser string com %
        assert isinstance(exp['confianca_percent'], str)
        assert '%' in exp['confianca_percent']
        
        # Deve ser número válido
        valor = float(exp['confianca_percent'].replace('%', ''))
        assert 0 <= valor <= 100, f"Confiança deve estar entre 0-100%: {valor}"


class TestExplicabilidadeTiposEspecificos:
    """Testes para tipos específicos de PII."""
    
    def test_explicacao_cnpj(self, detector):
        """Verifica explicação para CNPJ."""
        has_pii, findings, risco, conf = detector.detect("CNPJ: 11.222.333/0001-81")
        
        cnpj_finding = next((f for f in findings if f['tipo'] == 'CNPJ'), None)
        assert cnpj_finding is not None
        
        exp = cnpj_finding['explicacao']
        assert 'XX.XXX.XXX/XXXX-XX' in ' '.join(exp['motivos']) or 'CNPJ' in ' '.join(exp['motivos']).upper()
        
    def test_explicacao_processo_sei(self, detector):
        """Verifica explicação para processo SEI."""
        has_pii, findings, risco, conf = detector.detect("Processo SEI 00015-01009853/2026-01")
        
        sei_finding = next((f for f in findings if 'PROCESSO' in f['tipo'] or 'SEI' in f['tipo']), None)
        assert sei_finding is not None
        
        exp = sei_finding['explicacao']
        assert 'processo' in ' '.join(exp['motivos']).lower() or 'SEI' in ' '.join(exp['motivos'])
        
    def test_explicacao_endereco(self, detector):
        """Verifica explicação para endereço."""
        has_pii, findings, risco, conf = detector.detect("Moro na SQS 308 Bloco A apt 201")
        
        end_finding = next((f for f in findings if 'ENDERECO' in f['tipo']), None)
        assert end_finding is not None
        
        exp = end_finding['explicacao']
        assert len(exp['motivos']) > 0


class TestExplicabilidadeRegressao:
    """Testes de regressão para explicabilidade."""
    
    def test_sem_pii_sem_explicacao(self, detector):
        """Verifica que textos sem PII retornam lista vazia."""
        has_pii, findings, risco, conf = detector.detect("Solicito informações sobre contratos.")
        
        assert has_pii is False
        assert len(findings) == 0
        
    def test_explicacao_nao_quebra_api(self, detector):
        """Verifica que explicação não quebra formato da API."""
        has_pii, findings, risco, conf = detector.detect("CPF: 123.456.789-09")
        
        # Formato básico mantido
        assert isinstance(has_pii, bool)
        assert isinstance(findings, list)
        assert isinstance(risco, str)
        assert isinstance(conf, float)
        
        # Campos obrigatórios ainda presentes
        for f in findings:
            assert 'tipo' in f
            assert 'valor' in f
            assert 'confianca' in f
