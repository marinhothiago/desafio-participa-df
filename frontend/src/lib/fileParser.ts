import * as XLSX from 'xlsx';

export interface ParsedRow {
  rowIndex: number;
  id: string; // ID da planilha ou sequencial
  text: string;
}

export interface ParseResult {
  success: boolean;
  rows: ParsedRow[];
  error?: string;
  totalRows: number;
}

// Colunas comuns que podem conter o texto para análise
const TEXT_COLUMN_NAMES = [
  'texto mascarado',
  'texto',
  'text',
  'conteudo',
  'conteúdo',
  'descricao',
  'descrição',
  'pedido',
  'solicitacao',
  'solicitação',
  'mensagem',
  'observacao',
  'observação',
];

// Colunas que podem conter o ID
const ID_COLUMN_NAMES = [
  'id',
  'codigo',
  'código',
  'numero',
  'número',
  'protocolo',
  'num',
  'seq',
];

function findIdColumn(headers: string[]): number {
  const lowerHeaders = headers.map(h => h?.toString().toLowerCase().trim() || '');
  
  // Primeiro, tenta encontrar uma coluna com nome exato
  for (const name of ID_COLUMN_NAMES) {
    const index = lowerHeaders.indexOf(name);
    if (index !== -1) {
      return index;
    }
  }
  
  // Se não encontrar, tenta encontrar uma coluna que contenha algum dos nomes
  for (const name of ID_COLUMN_NAMES) {
    const index = lowerHeaders.findIndex(h => h.includes(name));
    if (index !== -1) {
      return index;
    }
  }
  
  // Se ainda não encontrar, retorna -1 (usará índice sequencial)
  return -1;
}

function findTextColumn(headers: string[]): number {
  const lowerHeaders = headers.map(h => h?.toString().toLowerCase().trim() || '');
  
  // Primeiro, tenta encontrar uma coluna com nome exato
  for (const name of TEXT_COLUMN_NAMES) {
    const index = lowerHeaders.indexOf(name);
    if (index !== -1) {
      return index;
    }
  }
  
  // Se não encontrar, tenta encontrar uma coluna que contenha algum dos nomes
  for (const name of TEXT_COLUMN_NAMES) {
    const index = lowerHeaders.findIndex(h => h.includes(name));
    if (index !== -1) {
      return index;
    }
  }
  
  // Se ainda não encontrar, assume que é a primeira coluna
  return 0;
}

export async function parseFile(file: File): Promise<ParseResult> {
  try {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension !== 'csv' && extension !== 'xlsx' && extension !== 'xls') {
      return {
        success: false,
        rows: [],
        totalRows: 0,
        error: 'Formato de arquivo não suportado. Use CSV ou XLSX.',
      };
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Pega a primeira planilha
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converte para JSON como array de arrays
    const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { 
      header: 1,
      defval: '',
    });
    
    if (jsonData.length === 0) {
      return {
        success: false,
        rows: [],
        totalRows: 0,
        error: 'O arquivo está vazio.',
      };
    }
    
    // A primeira linha são os cabeçalhos
    const headers = jsonData[0] as string[];
    const textColumnIndex = findTextColumn(headers);
    const idColumnIndex = findIdColumn(headers);
    
    const rows: ParsedRow[] = [];
    
    // Processa as linhas de dados (a partir da linha 2)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const text = row[textColumnIndex]?.toString().trim();
      
      // Captura o ID da planilha ou usa índice sequencial
      let id: string;
      if (idColumnIndex !== -1 && row[idColumnIndex] != null) {
        id = row[idColumnIndex].toString().trim();
      } else {
        id = (i).toString(); // Índice sequencial baseado na linha
      }
      
      if (text && text.length > 0) {
        rows.push({
          rowIndex: i + 1, // +1 porque Excel começa em 1
          id,
          text,
        });
      }
    }
    
    if (rows.length === 0) {
      return {
        success: false,
        rows: [],
        totalRows: jsonData.length - 1,
        error: `Nenhum texto encontrado na coluna "${headers[textColumnIndex] || 'Coluna ' + (textColumnIndex + 1)}". Verifique se o arquivo contém uma coluna de texto.`,
      };
    }
    
    return {
      success: true,
      rows,
      totalRows: rows.length,
    };
    
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    return {
      success: false,
      rows: [],
      totalRows: 0,
      error: error instanceof Error ? error.message : 'Erro ao processar o arquivo.',
    };
  }
}
