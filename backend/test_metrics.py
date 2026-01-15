"""Suite de Testes para o Detector de PII - Participa DF.

Este módulo contém 100+ casos de teste cobrindo:
- Situações seguras (não PII)
- PII clássico (CPF, Email, Telefone, Nomes)
- Edge cases e pegadinhas
- Contexto específico de Brasília/GDF
- Testes de imunidade funcional (agentes públicos em exercício)
"""

import sys
import os
from typing import List, Dict, Tuple

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from src.detector import PIIDetector


# DATASET COM 100+ CASOS DE TESTE - CONTEXTO BRASÍLIA/GDF
dataset_teste = [
    # ============================================================================
    # GRUPO 1: SITUAÇÕES BUROCRÁTICAS SEGURAS (ESPERADO: 0)
    # ============================================================================
    {
        "texto": "Solicito acesso aos autos da Secretaria de Estado da Segurança Pública.",
        "esperado": 0,
        "categoria": "Administrativo"
    },
    {
        "texto": "Reclamação sobre LIGAÇÕES TELEFÔNICAS MUDAS na Asa Norte.",
        "esperado": 0,
        "categoria": "Administrativo"
    },
    {
        "texto": "Obras no Eixo Monumental atrapalhando o trânsito.",
        "esperado": 0,
        "categoria": "Administrativo"
    },
    {
        "texto": "Solicito cópia do cadastro que preenchi virtualmente.",
        "esperado": 0,
        "categoria": "Administrativo"
    },
    {
        "texto": "Bom dia, gostaria de saber sobre o processo SEI 00015-01009853/2023-11.",
        "esperado": 0,
        "categoria": "Administrativo - Protocolo"
    },
    {
        "texto": "Conforme a Lei nº 8.112/90 e o Decreto 12.345.",
        "esperado": 0,
        "categoria": "Administrativo - Legislação"
    },
    {
        "texto": "O valor da multa foi de R$ 1.250,00 a ser pago no BRB.",
        "esperado": 0,
        "categoria": "Administrativo - Financeiro"
    },
    {
        "texto": "Encaminho anexo para a ouvidoria do GDF.",
        "esperado": 0,
        "categoria": "Administrativo"
    },
    {
        "texto": "O email institucional é ouvidoria@saude.df.gov.br",
        "esperado": 0,
        "categoria": "Administrativo - Email institucional"
    },
    {
        "texto": "Telefone institucional: (61) 3105-1234.",
        "esperado": 0,
        "categoria": "Administrativo - Telefone institucional"
    },
    {
        "texto": "Encaminhar para a Secretaria de Saúde do GDF.",
        "esperado": 0,
        "categoria": "Administrativo"
    },
    {
        "texto": "A reunião será na Administração Regional de Taguatinga.",
        "esperado": 0,
        "categoria": "Administrativo - Local"
    },
    {
        "texto": "Solicito acesso ao processo SEI nº 00040-00012345/2024-12.",
        "esperado": 0,
        "categoria": "Administrativo - Protocolo SEI"
    },
    {
        "texto": "O CNPJ da empresa fornecedora é 12.345.678/0001-99.",
        "esperado": 0,
        "categoria": "Administrativo - CNPJ Empresa"
    },
    {
        "texto": "Encaminhar para a DELEGACIA DA MULHER (DEAM).",
        "esperado": 0,
        "categoria": "Administrativo - Sigla órgão"
    },

    # ============================================================================
    # GRUPO 2: PII CLÁSSICO - SEMPRE DEVE SER DETECTADO (ESPERADO: 1)
    # ============================================================================
    {
        "texto": "Meu CPF é 123.456.789-09 e preciso de ajuda urgente.",
        "esperado": 1,
        "categoria": "PII - CPF válido"
    },
    {
        "texto": "Pode falar com Carlos Eduardo da Silva no telefone.",
        "esperado": 1,
        "categoria": "PII - Nome pessoal"
    },
    {
        "texto": "Meu email pessoal é joao.silva123@gmail.com.",
        "esperado": 1,
        "categoria": "PII - Email privado"
    },
    {
        "texto": "A vítima foi identificada como Maria Antonieta de Las Nieves.",
        "esperado": 1,
        "categoria": "PII - Nome vítima"
    },
    {
        "texto": "Entrar em contato no (61) 98765-4321 após as 14h.",
        "esperado": 1,
        "categoria": "PII - Telefone celular"
    },
    {
        "texto": "Meu celular é 61 99988-7766, falar com José.",
        "esperado": 1,
        "categoria": "PII - Celular sem formatação"
    },
    {
        "texto": "Meu pix é o celular 61999887766.",
        "esperado": 1,
        "categoria": "PII - Celular (PIX)"
    },
    {
        "texto": "Minha identidade é RG 3.123.456 SSP/DF.",
        "esperado": 1,
        "categoria": "PII - RG"
    },
    {
        "texto": "O portador da identidade RG 1.234.567 está presente.",
        "esperado": 1,
        "categoria": "PII - RG"
    },
    {
        "texto": "A fatura deve ser paga por João da Silva Pereira.",
        "esperado": 1,
        "categoria": "PII - Nome completo"
    },
    {
        "texto": "O documento de identificação é o CNH 0987654321.",
        "esperado": 1,
        "categoria": "PII - CNH"
    },
    {
        "texto": "O número da minha CNH é 0987654321.",
        "esperado": 1,
        "categoria": "PII - CNH"
    },
    {
        "texto": "A vítima se chama Ana Clara Oliveira.",
        "esperado": 1,
        "categoria": "PII - Nome vítima"
    },
    {
        "texto": "O denunciante é o cidadão José Pereira.",
        "esperado": 1,
        "categoria": "PII - Nome denunciante"
    },
    {
        "texto": "Meu email pessoal: joao123@gmail.com",
        "esperado": 1,
        "categoria": "PII - Email privado"
    },
    {
        "texto": "CNH: 01234567890",
        "esperado": 1,
        "categoria": "PII - CNH"
    },
    {
        "texto": "RG: 1.234.567 SSP/DF",
        "esperado": 1,
        "categoria": "PII - RG"
    },

    # ============================================================================
    # GRUPO 3: IMUNIDADE FUNCIONAL - AGENTES PÚBLICOS EM EXERCÍCIO (ESPERADO: 0)
    # ============================================================================
    {
        "texto": "Falar com a Dra. Fernanda na Secretaria de Saúde do DF.",
        "esperado": 0,
        "categoria": "Imunidade - Cargo + instituição"
    },
    {
        "texto": "Encaminhar para o Dr. Paulo na Administração Regional do Plano Piloto.",
        "esperado": 0,
        "categoria": "Imunidade - Cargo + instituição"
    },
    {
        "texto": "O servidor público João Silva me atendeu ontem.",
        "esperado": 0,
        "categoria": "Imunidade - Servidor em função"
    },
    {
        "texto": "A Dra. Maria é a responsável pelo setor de ouvidoria.",
        "esperado": 0,
        "categoria": "Imunidade - Cargo + setor"
    },
    {
        "texto": "O perito técnico Dr. Roberto analisou meu caso.",
        "esperado": 0,
        "categoria": "Imunidade - Cargo + função"
    },
    {
        "texto": "O perito médico Dr. Roberto analisou meu caso.",
        "esperado": 0,
        "categoria": "Imunidade - Cargo + função"
    },
    {
        "texto": "O servidor Marcos Paulo da Silva é o responsável.",
        "esperado": 0,
        "categoria": "Imunidade - Servidor público em função"
    },
    {
        "texto": "A testemunha é o Sr. Antônio, morador da QR 408.",
        "esperado": 1,
        "categoria": "PII - Testemunha com endereço"
    },
    {
        "texto": "Favor encaminhar para o Administrador Regional do Guará.",
        "esperado": 0,
        "categoria": "Imunidade - Cargo público"
    },

    # ============================================================================
    # GRUPO 4: QUEBRA DE IMUNIDADE - GATILHOS DE CONTATO (ESPERADO: 1)
    # ============================================================================
    {
        "texto": "Preciso falar com o Sr. Carlos sobre minha reclamação.",
        "esperado": 1,
        "categoria": "Quebra imunidade - Gatilho 'falar com'"
    },
    {
        "texto": "Ligar para a Sra. Lúcia no telefone (61) 99999-8888.",
        "esperado": 1,
        "categoria": "Quebra imunidade - Gatilho 'ligar para'"
    },
    {
        "texto": "Falar com o perito Roberto sobre o laudo.",
        "esperado": 1,
        "categoria": "Quebra imunidade - Gatilho anula cargo"
    },
    {
        "texto": "Preciso do contato do servidor Marcos Paulo da Silva.",
        "esperado": 1,
        "categoria": "Quebra imunidade - Contexto de contato"
    },
    {
        "texto": "Entre em contato com Ana Silva para maiores informações.",
        "esperado": 1,
        "categoria": "Quebra imunidade - Gatilho 'contato'"
    },
    {
        "texto": "Encaminhar para o Dr. Lucas Silva responsável pelo departamento.",
        "esperado": 0,
        "categoria": "Imunidade - Sem quebra"
    },

    # ============================================================================
    # GRUPO 5: ENDEREÇOS - ADMINISTRATIVOS vs RESIDENCIAIS (ESPERADO: 0 ou 1)
    # ============================================================================
    {
        "texto": "Solicito envio para a SQS 302 Bloco K em Brasília.",
        "esperado": 0,
        "categoria": "Endereço administrativo - Setor público"
    },
    {
        "texto": "Endereço: Quadra 12 Conjunto B Casa 45, Samambaia.",
        "esperado": 1,
        "categoria": "Endereço residencial"
    },
    {
        "texto": "Moro na SQN 305 Bloco A Apto 101, Asa Norte.",
        "esperado": 1,
        "categoria": "Endereço residencial - SQN privado"
    },
    {
        "texto": "Minha casa é na SQS 402 Bloco C, Asa Sul.",
        "esperado": 1,
        "categoria": "Endereço residencial - SQS privado"
    },
    {
        "texto": "Moro na Quadra 10 Conjunto B Casa 20.",
        "esperado": 1,
        "categoria": "Endereço residencial"
    },
    {
        "texto": "Moro no Setor de Mansões Park Way, Quadra 5, Casa 10.",
        "esperado": 1,
        "categoria": "Endereço residencial - Park Way"
    },
    {
        "texto": "Moro na Rua das Pitangueiras, Casa 45, Fundos, Taguatinga.",
        "esperado": 1,
        "categoria": "Endereço residencial - Rua especificada"
    },
    {
        "texto": "Endereço comercial: SCLN 305 Bloco B Loja 20.",
        "esperado": 0,
        "categoria": "Endereço comercial"
    },
    {
        "texto": "Moro na Quadra 10 Conjunto A, mas o problema é na rua pública.",
        "esperado": 0,
        "categoria": "Endereço genérico"
    },

    # ============================================================================
    # GRUPO 6: EDGE CASES - CPF INVÁLIDO, FAKE, FORMATOS (ESPERADO: 0)
    # ============================================================================
    {
        "texto": "O número de teste é 111.111.111-11.",
        "esperado": 0,
        "categoria": "CPF inválido matematicamente"
    },
    {
        "texto": "O CPF informado é 123.456.789-00.",
        "esperado": 1,
        "categoria": "CPF válido matematicamente"
    },
    {
        "texto": "O número 123.456.789-00 é inválido.",
        "esperado": 0,
        "categoria": "CPF em contexto negativo"
    },
    {
        "texto": "Meu CPF é 000.000.000-00, por favor me ajudem.",
        "esperado": 1,
        "categoria": "CPF teste"
    },
    {
        "texto": "meu email é ana.souza@hotmail.com e meu zap é 61988887777",
        "esperado": 1,
        "categoria": "Email + telefone minúsculo"
    },
    {
        "texto": "Contato: (61) 99988-7766 (WhatsApp da Maria).",
        "esperado": 1,
        "categoria": "Telefone + nome contato"
    },

    # ============================================================================
    # GRUPO 7: NOVOS CASOS - CONTEXTO GDF/BRASÍLIA (50+ CASOS ADICIONAIS)
    # ============================================================================
    
    # Casos 1-5: Endereços administrativos Brasília
    {
        "texto": "A Secretaria de Saúde fica na Esplanada dos Ministérios.",
        "esperado": 0,
        "categoria": "Endereço administrativo público"
    },
    {
        "texto": "Solicito informações sobre a CAESB na EQ 14/16 Asa Norte.",
        "esperado": 0,
        "categoria": "Endereço institucional"
    },
    {
        "texto": "O GDF está localizado no Palácio do Buriti.",
        "esperado": 0,
        "categoria": "Prédio público famoso"
    },
    {
        "texto": "Encaminhar para SRVS (Bloco A) - Asa Sul.",
        "esperado": 0,
        "categoria": "Setor administrativo"
    },
    {
        "texto": "Moro no Plano Piloto, setor comercial sul.",
        "esperado": 0,
        "categoria": "Região pública"
    },

    # Casos 6-10: Nomes genéricos vs específicos
    {
        "texto": "Atender cliente do sexo masculino, nome: João.",
        "esperado": 0,
        "categoria": "Nome genérico em contexto administrativo"
    },
    {
        "texto": "A testemunha informa que seu nome é Margarida.",
        "esperado": 1,
        "categoria": "Nome testemunha"
    },
    {
        "texto": "Visitante registrado como 'Silva, José'.",
        "esperado": 1,
        "categoria": "Nome visitante"
    },
    {
        "texto": "Funcionário do mês: Francisco Costa.",
        "esperado": 0,
        "categoria": "Funcionário em público"
    },
    {
        "texto": "A vítima informou seu nome: Catarina Gomes.",
        "esperado": 1,
        "categoria": "Nome vítima"
    },

    # Casos 11-15: Documentos e formatos
    {
        "texto": "Passaporte: AA000000",
        "esperado": 0,
        "categoria": "Passaporte genérico"
    },
    {
        "texto": "Meu passaporte é BR1234567",
        "esperado": 1,
        "categoria": "Passaporte pessoal"
    },
    {
        "texto": "Creci do imóvel: 123456",
        "esperado": 0,
        "categoria": "Registro profissional"
    },
    {
        "texto": "OAB: 1234567/DF",
        "esperado": 0,
        "categoria": "Inscrição profissional OAB"
    },
    {
        "texto": "Minha inscrição estadual é 12.345.678.901.234",
        "esperado": 0,
        "categoria": "Documento fiscal"
    },

    # Casos 16-20: Contextos de manifestação/reclamação
    {
        "texto": "Denuncio o funcionário que me atendeu com falta de respeito.",
        "esperado": 0,
        "categoria": "Reclamação anônima"
    },
    {
        "texto": "O atendente que me atendeu chamava-se Rodrigo.",
        "esperado": 0,
        "categoria": "Nome funcionário em contexto de função"
    },
    {
        "texto": "Gostaria de reclamar com o responsável Sérgio Alves.",
        "esperado": 1,
        "categoria": "Contato específico para reclamação"
    },
    {
        "texto": "Necessito protocolo de atendimento para a reclamação contra Pedro.",
        "esperado": 1,
        "categoria": "Nome acusado"
    },
    {
        "texto": "Felicito o funcionário Leonardo pelo excelente atendimento.",
        "esperado": 0,
        "categoria": "Elogio funcionário"
    },

    # Casos 21-25: Telefones em vários formatos
    {
        "texto": "Celular institucional: +55 61 98765-4321",
        "esperado": 0,
        "categoria": "Telefone com DDI institucional"
    },
    {
        "texto": "Meu celular de emergência: +5561988887766",
        "esperado": 1,
        "categoria": "Telefone pessoal com DDI"
    },
    {
        "texto": "Entre em contato pelo ramal 1234.",
        "esperado": 0,
        "categoria": "Ramal administrativo"
    },
    {
        "texto": "Telefone para contato: (61) 3105-1234 ramal 567",
        "esperado": 0,
        "categoria": "Telefone institucional com ramal"
    },
    {
        "texto": "Meu número para urgência é 61 99777-6655",
        "esperado": 1,
        "categoria": "Telefone pessoal urgência"
    },

    # Casos 26-30: Emails em vários domínios
    {
        "texto": "Contacte: atendimento@seedf.df.gov.br",
        "esperado": 0,
        "categoria": "Email institucional SEEDF"
    },
    {
        "texto": "Envie para: saude.publica@saude.df.gov.br",
        "esperado": 0,
        "categoria": "Email institucional saúde"
    },
    {
        "texto": "Meu email de trabalho: maria.santos@empresa-df.com.br",
        "esperado": 0,
        "categoria": "Email corporativo"
    },
    {
        "texto": "Contato pessoal: lucas.oliveira@hotmail.com",
        "esperado": 1,
        "categoria": "Email pessoal hotmail"
    },
    {
        "texto": "Enviar para: patricia_costa@yahoo.com.br",
        "esperado": 1,
        "categoria": "Email pessoal yahoo"
    },

    # Casos 31-35: Dados financeiros/bancários
    {
        "texto": "Agência: 0001 Conta: 123456-7",
        "esperado": 0,
        "categoria": "Dados bancários genéricos"
    },
    {
        "texto": "Minha conta no BRB é 0000123456789",
        "esperado": 1,
        "categoria": "Número conta pessoal"
    },
    {
        "texto": "Transferência para: 12345-6 no Banco de Brasília",
        "esperado": 1,
        "categoria": "Conta bancária pessoal"
    },
    {
        "texto": "Pagar na conta da Prefeitura: CNPJ 07.154.321/0001-00",
        "esperado": 0,
        "categoria": "Conta instituição pública"
    },
    {
        "texto": "PIX (chave aleatória): 123e4567-e89b-12d3-a456-426614174000",
        "esperado": 1,
        "categoria": "PIX pessoal"
    },

    # Casos 36-40: Contexto de LAI (Lei de Acesso à Informação)
    {
        "texto": "Sob a LAI, solicito informações sobre funcionários da SEEDF.",
        "esperado": 0,
        "categoria": "Requisição LAI"
    },
    {
        "texto": "Conforme LAI, quem é o responsável por X?",
        "esperado": 0,
        "categoria": "Pergunta LAI"
    },
    {
        "texto": "Conforme LGPD, não posso fornecer dados de: João Silva, CPF 123.456.789-09",
        "esperado": 1,
        "categoria": "Referência LGPD com PII"
    },
    {
        "texto": "A informação é classificada como sigilosa sob LAI.",
        "esperado": 0,
        "categoria": "Classificação LAI"
    },
    {
        "texto": "Recurso à LAI contra negativa de informação.",
        "esperado": 0,
        "categoria": "Procedimento LAI"
    },

    # Casos 41-45: Situações com múltiplos PII
    {
        "texto": "CPF: 111.111.111-11 e telefone: (61) 99999-8888",
        "esperado": 1,
        "categoria": "CPF inválido + telefone válido"
    },
    {
        "texto": "Dados: email joao@gmail.com, celular 61987654321, endereço Rua A Casa 10",
        "esperado": 1,
        "categoria": "Múltiplos PII"
    },
    {
        "texto": "Entre em contato: (61) 98888-7777 ou envie para ana@hotmail.com",
        "esperado": 1,
        "categoria": "Telefone + email privado"
    },
    {
        "texto": "Testemunha: Pedro Silva, RG 1.234.567, morador de Taguatinga",
        "esperado": 1,
        "categoria": "Nome + RG + endereço"
    },
    {
        "texto": "Vítima: Maria das Graças, CPF 987.654.321-00, WhatsApp 61999887766",
        "esperado": 1,
        "categoria": "Nome + CPF + celular"
    },

    # Casos 46-50: Casos ambíguos/limítrofes
    {
        "texto": "Silva é um sobrenome comum em Brasília.",
        "esperado": 0,
        "categoria": "Nome genérico"
    },
    {
        "texto": "O setor de telefonia: SQN 307 oferece serviços.",
        "esperado": 0,
        "categoria": "Setor com nome similar a endereço"
    },
    {
        "texto": "Maria, que é funcionária, informou seu CPF: 555.555.555-55",
        "esperado": 0,
        "categoria": "CPF inválido de funcionário"
    },
    {
        "texto": "Encaminhar a Ana Silva, servidora, a correspondência.",
        "esperado": 0,
        "categoria": "Servidora em contexto de função"
    },
    {
        "texto": "O responsável Dr. Augusto da Administração Regional",
        "esperado": 0,
        "categoria": "Cargo + função pública"
    },
]


def rodar() -> None:
    """Executa suite completa de testes e exibe relatório detalhado."""
    detector = PIIDetector()
    acertos = 0
    total = len(dataset_teste)
    erros_detalhados = []
    erros_por_categoria = {}

    print(f"\n{'='*120}")
    print(f"🧪 EXECUTANDO SUITE DE TESTES - {total} CASOS")
    print(f"{'='*120}\n")
    print(f"{'TEXTO (Amostra)':<50} | {'REAL':<6} | {'IA':<6} | {'RESULTADO':<12} | CATEGORIA")
    print("-" * 120)

    for idx, item in enumerate(dataset_teste, 1):
        # Executa detecção
        res, findings, risco, score = detector.detect(item['texto'])
        ia = 1 if res else 0
        categoria = item.get('categoria', 'N/A')

        # Determina status e cor
        status = "✅ ACERTO" if ia == item['esperado'] else "❌ ERRO"
        cor = "\033[92m" if ia == item['esperado'] else "\033[91m"
        reset = "\033[0m"

        # Prepara mensagem de debug em caso de falha
        if status == "❌ ERRO":
            tipos_encontrados = [f['tipo'] for f in findings]
            debug_info = f" -> Tipos: {tipos_encontrados}" if tipos_encontrados else ""
            erros_detalhados.append({
                "caso": idx,
                "texto": item['texto'],
                "esperado": item['esperado'],
                "obtido": ia,
                "findings": findings,
                "categoria": categoria
            })
            # Agrupa erros por categoria
            if categoria not in erros_por_categoria:
                erros_por_categoria[categoria] = []
            erros_por_categoria[categoria].append(idx)
        else:
            debug_info = ""

        # Formata exibição do texto
        texto_display = (item['texto'][:47] + '...') if len(item['texto']) > 47 else item['texto']
        print(
            f"{cor}{texto_display:<50} | {item['esperado']:<6} | {ia:<6} | {status:<12} | {categoria}{reset}"
        )

        if ia == item['esperado']:
            acertos += 1

    # Relatório final
    acc = (acertos / total) * 100
    print("-" * 120)
    print(f"\n{'='*120}")
    print(f"📊 RESUMO FINAL")
    print(f"{'='*120}")
    print(f"✅ ACERTOS: {acertos}/{total}")
    print(f"❌ ERROS: {len(erros_detalhados)}/{total}")
    print(f"📈 ACURÁCIA: {acc:.1f}%\n")

    # Status final
    if acc == 100.0:
        print("🚀 PARABÉNS! MODELO PRONTO PARA HACKATHON PARTICIPA DF!")
    elif acc >= 95.0:
        print("✨ EXCELENTE DESEMPENHO! Apenas pequenos ajustes necessários.")
    elif acc >= 90.0:
        print("⚠️ BOM DESEMPENHO! Revisar os erros abaixo para melhorar.")
    else:
        print("🔧 NECESSÁRIA REVISÃO SIGNIFICATIVA DOS ERROS.")

    # Exibe erros detalhados
    if erros_detalhados:
        print(f"\n{'='*120}")
        print(f"❌ DETALHES DOS {len(erros_detalhados)} ERROS")
        print(f"{'='*120}\n")

        # Agrupa por categoria
        print("📋 ERROS POR CATEGORIA:")
        for cat in sorted(erros_por_categoria.keys()):
            count = len(erros_por_categoria[cat])
            print(f"  • {cat}: {count} erro(s) - casos {erros_por_categoria[cat]}")

        print(f"\n📝 PRIMEIROS 10 ERROS DETALHADOS:\n")
        for erro in erros_detalhados[:10]:
            print(f"  Caso {erro['caso']} [{erro['categoria']}]:")
            print(f"    Texto: '{erro['texto']}'")
            print(f"    Esperado: {erro['esperado']}, Obtido: {erro['obtido']}")
            if erro['findings']:
                print(f"    Findings: {[f['tipo'] + ':' + f['valor'][:20] for f in erro['findings']]}")
            print()



# ===================== DEBUG INTERATIVO (antigo test_debug.py) =====================
def debug_interativo():
    import re
    print("\nDEBUG INTERATIVO: Testes de cargos e imunidade funcional\n")
    casos = [
        ("Encaminhar para o Dr. Lucas Silva responsável pelo departamento.", "Dr. Lucas Silva"),
        ("O responsável Dr. Augusto da Administração Regional", "Dr. Augusto da Admin")
    ]
    cargos_autoridade = {"DRA", "DR", "SR", "SRA", "PROF", "DOUTOR", "DOUTORA"}
    for texto_original, nome in casos:
        print(f"\n{'='*60}")
        print(f"Texto: {texto_original}")
        print(f"Nome encontrado: {nome}")
        start_index = texto_original.find(nome)
        print(f"Start index: {start_index}")
        pre_text = texto_original[max(0, start_index-100):start_index].upper()
        pos_text = texto_original[start_index:min(len(texto_original), start_index+100)].upper()
        print(f"\nPre-text (100 chars before): '{pre_text}'")
        print(f"Pos-text (100 chars after): '{pos_text}'")
        for cargo in cargos_autoridade:
            if re.search(rf"\b{cargo}\.?\s*$", pre_text):
                print(f"\n✓ Cargo '{cargo}' encontrado no final de pre_text")
                instituicoes = ["SECRETARIA", "ADMINISTRACAO", "DEPARTAMENTO", "DIRETORIA", "GDF", "SEEDF", "RESPONSAVEL", "DA ADMINISTRACAO"]
                found = False
                for inst in instituicoes:
                    if inst in pos_text:
                        print(f"✓ Instituição/função '{inst}' encontrada no pos_text")
                        found = True
                        break
                if found:
                    print(f"  ==> DEVE SER IGNORADO (imune)")
                else:
                    print(f"✗ Nenhuma instituição/função encontrada")
                    print(f"  Procurando por: {instituicoes}")

# ===================== MENU PRINCIPAL =====================
def main():
    print("\nEscolha a opção:")
    print("1 - Rodar todos os testes automáticos (com métricas)")
    print("2 - Debug interativo (casos específicos)")
    opcao = input("Opção: ").strip()
    if opcao == "1":
        rodar()
    else:
        debug_interativo()

if __name__ == "__main__":
    main()
    # ============================================================================
    # GRUPO 4: NOVOS 78 CASOS GDF/LAI (2026) - PEDIDOS REAIS E EDGE CASES
    # ============================================================================
    {"texto": "Solicito a lista de servidores lotados na Secretaria de Saúde do DF em 2023.", "esperado": 1, "categoria": "PII - Lista de servidores"},
    {"texto": "Quais são os contratos firmados pela Secretaria de Educação em 2022?", "esperado": 0, "categoria": "Administrativo - Contratos"},
    {"texto": "Favor informar o endereço residencial do servidor João Pereira.", "esperado": 1, "categoria": "PII - Endereço servidor"},
    {"texto": "Solicito cópia do processo administrativo nº 12345/2023.", "esperado": 0, "categoria": "Administrativo - Processo"},
    {"texto": "Qual a remuneração do servidor de matrícula 1234567?", "esperado": 1, "categoria": "PII - Remuneração servidor"},
    {"texto": "Lista de escolas públicas do GDF.", "esperado": 0, "categoria": "Administrativo - Lista escolas"},
    {"texto": "E-mail do diretor da Escola Classe 10 de Taguatinga.", "esperado": 1, "categoria": "PII - Email diretor escola"},
    {"texto": "Solicito número do telefone funcional do servidor Ana Souza.", "esperado": 1, "categoria": "PII - Telefone funcional servidor"},
    {"texto": "Informar o nome dos médicos plantonistas do Hospital Regional de Ceilândia.", "esperado": 1, "categoria": "PII - Médicos plantonistas"},
    {"texto": "Solicito relação de empresas contratadas para merenda escolar.", "esperado": 0, "categoria": "Administrativo - Empresas merenda"},
    {"texto": "Qual o endereço do Hospital Regional da Asa Norte?", "esperado": 0, "categoria": "Administrativo - Endereço hospital público"},
    {"texto": "Favor informar o CPF do servidor Paulo Henrique.", "esperado": 1, "categoria": "PII - CPF servidor"},
    {"texto": "Solicito a lista de alunos matriculados na Escola Parque 308 Sul.", "esperado": 1, "categoria": "PII - Lista de alunos"},
    {"texto": "Quais são os projetos de lei aprovados em 2025?", "esperado": 0, "categoria": "Administrativo - Projetos de lei"},
    {"texto": "Favor informar o RG do servidor Maria das Dores.", "esperado": 1, "categoria": "PII - RG servidor"},
    {"texto": "Solicito o nome dos professores da Escola Classe 5 do Gama.", "esperado": 1, "categoria": "PII - Professores escola"},
    {"texto": "Qual o telefone da Secretaria de Cultura?", "esperado": 0, "categoria": "Administrativo - Telefone órgão público"},
    {"texto": "Favor informar o e-mail institucional do servidor Carlos Silva.", "esperado": 1, "categoria": "PII - Email institucional servidor"},
    {"texto": "Solicito a relação de pacientes atendidos no Hospital Materno Infantil em janeiro de 2026.", "esperado": 1, "categoria": "PII - Pacientes hospital"},
    {"texto": "Quais são as escolas que oferecem ensino integral?", "esperado": 0, "categoria": "Administrativo - Escolas ensino integral"},
    {"texto": "Favor informar o endereço de e-mail do secretário de Educação.", "esperado": 1, "categoria": "PII - Email secretário"},
    {"texto": "Solicito a lista de beneficiários do programa Bolsa Família no DF.", "esperado": 1, "categoria": "PII - Beneficiários programa social"},
    {"texto": "Quais são os hospitais que realizam cirurgias cardíacas?", "esperado": 0, "categoria": "Administrativo - Hospitais cirurgias"},
    {"texto": "Favor informar o nome dos servidores que receberam gratificação em 2025.", "esperado": 1, "categoria": "PII - Servidores gratificação"},
    {"texto": "Solicito o número do processo SEI 00015-01009853/2023-11.", "esperado": 0, "categoria": "Administrativo - Processo SEI"},
    {"texto": "Qual a lotação do servidor de matrícula 7654321?", "esperado": 1, "categoria": "PII - Lotação servidor"},
    {"texto": "Favor informar o endereço residencial dos diretores das escolas públicas.", "esperado": 1, "categoria": "PII - Endereço diretores"},
    {"texto": "Solicito a lista de contratos de prestação de serviços de limpeza.", "esperado": 0, "categoria": "Administrativo - Contratos limpeza"},
    {"texto": "Qual o nome dos pacientes internados na UTI do Hospital de Base?", "esperado": 1, "categoria": "PII - Pacientes UTI"},
    {"texto": "Favor informar o telefone pessoal do servidor João Batista.", "esperado": 1, "categoria": "PII - Telefone pessoal servidor"},
    {"texto": "Solicito a relação de alunos aprovados no concurso público de 2025.", "esperado": 1, "categoria": "PII - Alunos aprovados concurso"},
    {"texto": "Quais são as empresas fornecedoras de medicamentos para a Secretaria de Saúde?", "esperado": 0, "categoria": "Administrativo - Empresas medicamentos"},
    {"texto": "Favor informar o nome dos servidores afastados por licença médica.", "esperado": 1, "categoria": "PII - Servidores afastados"},
    {"texto": "Solicito o endereço eletrônico do diretor da Escola Classe 12 de Sobradinho.", "esperado": 1, "categoria": "PII - Email diretor escola"},
    {"texto": "Qual o valor gasto com merenda escolar em 2025?", "esperado": 0, "categoria": "Administrativo - Gastos merenda"},
    {"texto": "Favor informar o nome dos servidores que receberam diárias em 2024.", "esperado": 1, "categoria": "PII - Servidores diárias"},
    {"texto": "Solicito a lista de médicos especialistas em cardiologia do Hospital Regional do Gama.", "esperado": 1, "categoria": "PII - Médicos cardiologia"},
    {"texto": "Quais são as escolas que oferecem educação especial?", "esperado": 0, "categoria": "Administrativo - Escolas educação especial"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de insalubridade.", "esperado": 1, "categoria": "PII - Servidores insalubridade"},
    {"texto": "Solicito a relação de pacientes atendidos no pronto-socorro do Hospital Regional de Taguatinga.", "esperado": 1, "categoria": "PII - Pacientes pronto-socorro"},
    {"texto": "Qual o endereço da Secretaria de Fazenda?", "esperado": 0, "categoria": "Administrativo - Endereço órgão público"},
    {"texto": "Favor informar o nome dos servidores que receberam progressão funcional em 2025.", "esperado": 1, "categoria": "PII - Servidores progressão"},
    {"texto": "Solicito a lista de alunos transferidos em 2024.", "esperado": 1, "categoria": "PII - Alunos transferidos"},
    {"texto": "Quais são as empresas responsáveis pela coleta de lixo no DF?", "esperado": 0, "categoria": "Administrativo - Empresas coleta lixo"},
    {"texto": "Favor informar o nome dos servidores que receberam auxílio-transporte.", "esperado": 1, "categoria": "PII - Servidores auxílio-transporte"},
    {"texto": "Solicito a relação de pacientes atendidos no ambulatório do Hospital Materno Infantil.", "esperado": 1, "categoria": "PII - Pacientes ambulatório"},
    {"texto": "Qual o valor do contrato de limpeza da Secretaria de Educação?", "esperado": 0, "categoria": "Administrativo - Contrato limpeza"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional noturno.", "esperado": 1, "categoria": "PII - Servidores adicional noturno"},
    {"texto": "Solicito a lista de alunos com necessidades especiais matriculados em 2025.", "esperado": 1, "categoria": "PII - Alunos necessidades especiais"},
    {"texto": "Quais são as empresas responsáveis pelo transporte escolar?", "esperado": 0, "categoria": "Administrativo - Empresas transporte escolar"},
    {"texto": "Favor informar o nome dos servidores que receberam gratificação de função.", "esperado": 1, "categoria": "PII - Servidores gratificação função"},
    {"texto": "Solicito a relação de pacientes internados no Hospital Regional de Samambaia.", "esperado": 1, "categoria": "PII - Pacientes internados"},
    {"texto": "Qual o endereço da Escola Classe 15 de Ceilândia?", "esperado": 0, "categoria": "Administrativo - Endereço escola pública"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de periculosidade.", "esperado": 1, "categoria": "PII - Servidores periculosidade"},
    {"texto": "Solicito a lista de alunos aprovados no ENEM 2025.", "esperado": 1, "categoria": "PII - Alunos aprovados ENEM"},
    {"texto": "Quais são as empresas responsáveis pela manutenção predial das escolas?", "esperado": 0, "categoria": "Administrativo - Empresas manutenção escolar"},
    {"texto": "Favor informar o nome dos servidores que receberam auxílio-alimentação.", "esperado": 1, "categoria": "PII - Servidores auxílio-alimentação"},
    {"texto": "Solicito a relação de pacientes atendidos no centro cirúrgico do Hospital Regional de Planaltina.", "esperado": 1, "categoria": "PII - Pacientes centro cirúrgico"},
    {"texto": "Qual o valor do contrato de transporte escolar?", "esperado": 0, "categoria": "Administrativo - Contrato transporte escolar"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de tempo de serviço.", "esperado": 1, "categoria": "PII - Servidores tempo de serviço"},
    {"texto": "Solicito a lista de alunos bolsistas em 2025.", "esperado": 1, "categoria": "PII - Alunos bolsistas"},
    {"texto": "Quais são as empresas responsáveis pela segurança das escolas?", "esperado": 0, "categoria": "Administrativo - Empresas segurança escolar"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de difícil acesso.", "esperado": 1, "categoria": "PII - Servidores difícil acesso"},
    {"texto": "Solicito a relação de pacientes atendidos na emergência do Hospital Regional do Paranoá.", "esperado": 1, "categoria": "PII - Pacientes emergência"},
    {"texto": "Qual o endereço da Secretaria de Educação?", "esperado": 0, "categoria": "Administrativo - Endereço órgão público"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de qualificação.", "esperado": 1, "categoria": "PII - Servidores qualificação"},
    {"texto": "Solicito a lista de alunos transferidos para outras escolas em 2025.", "esperado": 1, "categoria": "PII - Alunos transferidos outras escolas"},
    {"texto": "Quais são as empresas responsáveis pela alimentação escolar?", "esperado": 0, "categoria": "Administrativo - Empresas alimentação escolar"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de insalubridade em 2025.", "esperado": 1, "categoria": "PII - Servidores insalubridade 2025"},
    {"texto": "Solicito a relação de pacientes atendidos no ambulatório do Hospital Regional de Brazlândia.", "esperado": 1, "categoria": "PII - Pacientes ambulatório Brazlândia"},
    {"texto": "Qual o valor do contrato de fornecimento de merenda escolar?", "esperado": 0, "categoria": "Administrativo - Contrato merenda escolar"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de produtividade.", "esperado": 1, "categoria": "PII - Servidores produtividade"},
    {"texto": "Solicito a lista de alunos aprovados no vestibular 2025.", "esperado": 1, "categoria": "PII - Alunos aprovados vestibular"},
    {"texto": "Quais são as empresas responsáveis pela limpeza das escolas?", "esperado": 0, "categoria": "Administrativo - Empresas limpeza escolar"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de função gratificada.", "esperado": 1, "categoria": "PII - Servidores função gratificada"},
    {"texto": "Solicito a relação de pacientes atendidos no pronto-socorro do Hospital Regional de Santa Maria.", "esperado": 1, "categoria": "PII - Pacientes pronto-socorro Santa Maria"},
    {"texto": "Qual o endereço da Escola Classe 20 de Samambaia?", "esperado": 0, "categoria": "Administrativo - Endereço escola pública Samambaia"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de titulação.", "esperado": 1, "categoria": "PII - Servidores titulação"},
    {"texto": "Solicito a lista de alunos premiados em olimpíadas escolares.", "esperado": 1, "categoria": "PII - Alunos premiados olimpíadas"},
    {"texto": "Quais são as empresas responsáveis pela manutenção dos hospitais?", "esperado": 0, "categoria": "Administrativo - Empresas manutenção hospitalar"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de difícil provimento.", "esperado": 1, "categoria": "PII - Servidores difícil provimento"},
    {"texto": "Solicito a relação de pacientes atendidos no centro cirúrgico do Hospital Regional de Sobradinho.", "esperado": 1, "categoria": "PII - Pacientes centro cirúrgico Sobradinho"},
    {"texto": "Qual o valor do contrato de manutenção predial da Secretaria de Saúde?", "esperado": 0, "categoria": "Administrativo - Contrato manutenção predial"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de tempo integral.", "esperado": 1, "categoria": "PII - Servidores tempo integral"},
    {"texto": "Solicito a lista de alunos aprovados em concursos públicos de 2025.", "esperado": 1, "categoria": "PII - Alunos aprovados concursos públicos"},
    {"texto": "Quais são as empresas responsáveis pelo fornecimento de medicamentos?", "esperado": 0, "categoria": "Administrativo - Empresas fornecimento medicamentos"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de dedicação exclusiva.", "esperado": 1, "categoria": "PII - Servidores dedicação exclusiva"},
    {"texto": "Solicito a relação de pacientes atendidos no pronto-socorro do Hospital Regional do Gama.", "esperado": 1, "categoria": "PII - Pacientes pronto-socorro Gama"},
    {"texto": "Qual o endereço da Escola Classe 30 de Taguatinga?", "esperado": 0, "categoria": "Administrativo - Endereço escola pública Taguatinga"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de função comissionada.", "esperado": 1, "categoria": "PII - Servidores função comissionada"},
    {"texto": "Solicito a lista de alunos transferidos para escolas federais em 2025.", "esperado": 1, "categoria": "PII - Alunos transferidos escolas federais"},
    {"texto": "Quais são as empresas responsáveis pela segurança dos hospitais?", "esperado": 0, "categoria": "Administrativo - Empresas segurança hospitalar"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de insalubridade em 2026.", "esperado": 1, "categoria": "PII - Servidores insalubridade 2026"},
    {"texto": "Solicito a relação de pacientes atendidos no ambulatório do Hospital Regional de Ceilândia.", "esperado": 1, "categoria": "PII - Pacientes ambulatório Ceilândia"},
    {"texto": "Qual o valor do contrato de fornecimento de alimentação hospitalar?", "esperado": 0, "categoria": "Administrativo - Contrato alimentação hospitalar"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de produtividade em 2025.", "esperado": 1, "categoria": "PII - Servidores produtividade 2025"},
    {"texto": "Solicito a lista de alunos aprovados em olimpíadas científicas.", "esperado": 1, "categoria": "PII - Alunos aprovados olimpíadas científicas"},
    {"texto": "Quais são as empresas responsáveis pela limpeza dos hospitais?", "esperado": 0, "categoria": "Administrativo - Empresas limpeza hospitalar"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de função gratificada em 2026.", "esperado": 1, "categoria": "PII - Servidores função gratificada 2026"},
    {"texto": "Solicito a relação de pacientes atendidos no pronto-socorro do Hospital Regional de Planaltina.", "esperado": 1, "categoria": "PII - Pacientes pronto-socorro Planaltina"},
    {"texto": "Qual o endereço da Escola Classe 40 de Sobradinho?", "esperado": 0, "categoria": "Administrativo - Endereço escola pública Sobradinho"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de dedicação exclusiva em 2025.", "esperado": 1, "categoria": "PII - Servidores dedicação exclusiva 2025"},
    {"texto": "Solicito a lista de alunos premiados em feiras de ciências.", "esperado": 1, "categoria": "PII - Alunos premiados feiras de ciências"},
    {"texto": "Quais são as empresas responsáveis pela manutenção dos centros de saúde?", "esperado": 0, "categoria": "Administrativo - Empresas manutenção centros de saúde"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de difícil provimento em 2026.", "esperado": 1, "categoria": "PII - Servidores difícil provimento 2026"},
    {"texto": "Solicito a relação de pacientes atendidos no centro cirúrgico do Hospital Regional de Santa Maria.", "esperado": 1, "categoria": "PII - Pacientes centro cirúrgico Santa Maria"},
    {"texto": "Qual o valor do contrato de manutenção predial da Secretaria de Educação?", "esperado": 0, "categoria": "Administrativo - Contrato manutenção predial Educação"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de tempo integral em 2026.", "esperado": 1, "categoria": "PII - Servidores tempo integral 2026"},
    {"texto": "Solicito a lista de alunos aprovados em concursos federais de 2025.", "esperado": 1, "categoria": "PII - Alunos aprovados concursos federais"},
    {"texto": "Quais são as empresas responsáveis pelo fornecimento de medicamentos hospitalares?", "esperado": 0, "categoria": "Administrativo - Empresas fornecimento medicamentos hospitalares"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de dedicação exclusiva em 2026.", "esperado": 1, "categoria": "PII - Servidores dedicação exclusiva 2026"},
    {"texto": "Solicito a relação de pacientes atendidos no pronto-socorro do Hospital Regional de Sobradinho.", "esperado": 1, "categoria": "PII - Pacientes pronto-socorro Sobradinho"},
    {"texto": "Qual o endereço da Escola Classe 50 de Planaltina?", "esperado": 0, "categoria": "Administrativo - Endereço escola pública Planaltina"},
    {"texto": "Favor informar o nome dos servidores que receberam adicional de função comissionada em 2026.", "esperado": 1, "categoria": "PII - Servidores função comissionada 2026"},
    {"texto": "Solicito a lista de alunos transferidos para escolas estaduais em 2025.", "esperado": 1, "categoria": "PII - Alunos transferidos escolas estaduais"}
    # Total: 78 casos
    # (Os textos e categorias podem ser ajustados conforme necessidade do projeto)
]
