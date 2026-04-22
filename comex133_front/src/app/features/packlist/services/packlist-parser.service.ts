import { Injectable } from '@angular/core';
import { FilePreviewData, PacklistImportConfig, ImportedPacklistItem, PacklistImportResult } from '../models/packlist-mapping.models';

// Declaração do XLSX se estiver disponível globalmente
declare const XLSX: any;

/**
 * Serviço para processar e importar arquivos de packlist
 * Reutiliza a mesma lógica do TemplatesPacklistParserService
 */
@Injectable({ providedIn: 'root' })
export class PacklistParserService {
  
  /**
   * Parseia arquivo XLSX ou CSV e retorna preview com primeiras 20 linhas
   */
  async parseFile(file: File): Promise<FilePreviewData> {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (ext === '.csv' || ext === '.txt') {
      return this.parseCSV(file);
    } else if (ext === '.xlsx' || ext === '.xls') {
      return this.parseXLSX(file, true); // true = limitar a 20 linhas para preview
    } else {
      throw new Error('Formato de arquivo não suportado');
    }
  }

  /**
   * Parseia arquivo CSV
   */
  private parseCSV(file: File): Promise<FilePreviewData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').map(line => 
            line.split(',').map(col => col.trim())
          );
          
          const preview = lines.slice(0, 20);
          const maxCols = Math.max(...preview.map(l => l.length));
          
          resolve({
            lines: preview,
            columnCount: maxCols
          });
        } catch (error) {
          reject(new Error('Erro ao ler arquivo CSV: ' + (error as any).message));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }

  /**
   * Parseia arquivo XLSX/XLS
   * Usa biblioteca XLSX (mesma abordagem do template que funciona)
   */
  private parseXLSX(file: File, limitTo20Lines = false): Promise<FilePreviewData> {
    return new Promise((resolve, reject) => {
      // Tenta usar XLSX do Node.js/global se disponível
      if (typeof XLSX !== 'undefined') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Pega primeira sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Converte para array de arrays - TODAS as linhas
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1, 
              defval: '',
              raw: false 
            });
            
            const lines = jsonData.map((row: any) => {
              if (Array.isArray(row)) {
                return row.map(cell => String(cell || ''));
              }
              return [];
            });
            
            // Para preview, limita a 20 linhas. Para processamento completo, retorna tudo
            const resultLines = limitTo20Lines ? lines.slice(0, 20) : lines;
            const maxCols = Math.max(...resultLines.map((l: string[]) => l.length), 1);
            
            resolve({
              lines: resultLines,
              columnCount: maxCols
            });
          } catch (error) {
            reject(new Error('Erro ao processar XLSX com biblioteca: ' + (error as any).message));
          }
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsArrayBuffer(file);
      } else {
        // Fallback para parser manual se XLSX não estiver disponível
        this.parseXLSXManual(file, limitTo20Lines, resolve, reject);
      }
    });
  }

  /**
   * Fallback manual se XLSX não estiver disponível
   */
  private parseXLSXManual(
    file: File,
    limitTo20Lines: boolean,
    resolve: (value: FilePreviewData) => void,
    reject: (error: any) => void
  ): void {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const view = new Uint8Array(arrayBuffer);
        const text = this.uint8ArrayToString(view);
        
        if (text.charCodeAt(0) === 0x50 && text.charCodeAt(1) === 0x4B) {
          return this.extractFromZip(text, limitTo20Lines, resolve, reject);
        }
        
        reject(new Error('Arquivo XLSX inválido ou corrompido'));
      } catch (error) {
        reject(new Error('Erro ao ler arquivo XLSX: ' + (error as any).message));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  }

  private uint8ArrayToString(uint8Array: Uint8Array): string {
    const chunkSize = 8192;
    let result = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      if (typeof TextDecoder !== 'undefined') {
        try {
          result += new TextDecoder('latin1').decode(chunk);
          continue;
        } catch (e) {}
      }
      for (let j = 0; j < chunk.length; j++) {
        result += String.fromCharCode(chunk[j]);
      }
    }
    
    return result;
  }

  private extractFromZip(
    zipContent: string,
    limitTo20Lines: boolean,
    resolve: (value: FilePreviewData) => void,
    reject: (error: any) => void
  ): void {
    try {
      // Procurar por worksheet XML
      const sheetDataPattern = /<sheetData[^>]*>([\s\S]*?)<\/sheetData>/i;
      const sheetDataMatch = zipContent.match(sheetDataPattern);
      
      if (!sheetDataMatch) {
        // Tenta buscar todo o conteúdo da worksheet
        const worksheetPattern = /<worksheet[^>]*>([\s\S]*?)<\/worksheet>/i;
        const worksheetMatch = zipContent.match(worksheetPattern);
        
        if (!worksheetMatch) {
          reject(new Error('Arquivo XLSX não contém dados de worksheet. Tente usar CSV ou instale suporte completo a XLSX.'));
          return;
        }
        
        const rows = this.extractRowsFromXML(worksheetMatch[1]);
        
        if (rows.length === 0) {
          reject(new Error('Nenhuma linha encontrada no XLSX'));
          return;
        }
        
        const resultLines = limitTo20Lines ? rows.slice(0, 20) : rows;
        const maxCols = Math.max(...resultLines.map(r => r.length), 1);
        
        resolve({
          lines: resultLines,
          columnCount: maxCols
        });
        return;
      }
      
      const rows = this.extractRowsFromXML(sheetDataMatch[1]);
      
      if (rows.length === 0) {
        reject(new Error('Nenhuma linha encontrada no XLSX'));
        return;
      }
      
      const resultLines = limitTo20Lines ? rows.slice(0, 20) : rows;
      const maxCols = Math.max(...resultLines.map(r => r.length), 1);
      
      resolve({
        lines: resultLines,
        columnCount: maxCols
      });
    } catch (error) {
      reject(error);
    }
  }

  /**
   * Extrai linhas de XML de worksheet
   */
  private extractRowsFromXML(xmlContent: string): string[][] {
    const rows: string[][] = [];
    
    try {
      const rowRegex = /<row[^>]*>[\s\S]*?<\/row>/g;
      const rowMatches = xmlContent.match(rowRegex) || [];
      
      for (const rowMatch of rowMatches) {
        const cells: string[] = [];
        const cellRegex = /<c[^>]*>[\s\S]*?<\/c>/g;
        const cellMatches = rowMatch.match(cellRegex) || [];
        
        for (const cellMatch of cellMatches) {
          const valueMatch = cellMatch.match(/<v[^>]*>([\s\S]*?)<\/v>/);
          let value = valueMatch ? valueMatch[1].trim() : '';
          
          if (!value && cellMatch.includes('<is>')) {
            const isMatch = cellMatch.match(/<is>[\s\S]*?<\/is>/);
            if (isMatch) {
              const textMatch = isMatch[0].match(/<t[^>]*>([\s\S]*?)<\/t>/);
              value = textMatch ? textMatch[1].trim() : '';
            }
          }
          
          cells.push(value);
        }
        
        if (cells.length > 0) {
          rows.push(cells);
        }
      }
    } catch (error) {
      console.warn('Erro ao extrair rows do XML:', error);
    }
    
    return rows;
  }

  /**
   * Valida configuração de mapeamento
   */
  validateMapping(config: PacklistImportConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.headerLine < 1) {
      errors.push('Linha de início deve ser >= 1');
    }

    const { volumes, peso, cbm, descricao } = config.fieldMapping;
    const columns = [volumes, peso, cbm, descricao].filter(Boolean) as string[];
    const columnSet = new Set(columns);
    
    if (columns.length !== columnSet.size) {
      errors.push('Uma coluna foi mapeada para múltiplos campos');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Processa arquivo completo com base na configuração de mapeamento
   * USA O MESMO MECANISMO DE LEITURA DO TEMPLATE
   */
  async processFile(
    file: File,
    config: PacklistImportConfig
  ): Promise<PacklistImportResult> {
    // Validar configuração
    const validation = this.validateMapping(config);
    if (!validation.valid) {
      return {
        config,
        items: [],
        totalLines: 0,
        successLines: 0,
        errors: validation.errors.map((msg, i) => ({ line: -1, message: msg }))
      };
    }

    try {
      // Parsear arquivo COMPLETO (não apenas preview de 20 linhas)
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      let fileData: FilePreviewData;
      
      if (ext === '.csv' || ext === '.txt') {
        // Para CSV, precisamos ler tudo, não apenas preview
        fileData = await this.parseCSVComplete(file);
      } else if (ext === '.xlsx' || ext === '.xls') {
        // false = ler TODAS as linhas, não limitar a 20
        fileData = await this.parseXLSX(file, false);
      } else {
        throw new Error('Formato de arquivo não suportado');
      }
      
      const items: ImportedPacklistItem[] = [];
      const errors: { line: number; message: string }[] = [];

      // Começar da linha indicada (headerLine)
      const startIndex = config.headerLine; // config é 1-indexed, array é 0-indexed
      const { volumes, peso, cbm, descricao } = config.fieldMapping;
      
      // Mapear colunas para índices (A=0, B=1, etc)
      const colIndex = (col?: string) => col ? col.charCodeAt(0) - 65 : -1;
      
      const volumesIdx = colIndex(volumes);
      const pesoIdx = colIndex(peso);
      const cbmIdx = colIndex(cbm);
      const descricaoIdx = colIndex(descricao);

      console.log('Processando arquivo:', {
        totalLinhas: fileData.lines.length,
        linhaInicio: config.headerLine,
        mapeamento: config.fieldMapping
      });

      // Processar cada linha de dados
      for (let i = startIndex; i < fileData.lines.length; i++) {
        const line = fileData.lines[i];
        const lineNum = i + 1; // Converter para 1-indexed para exibição
        
        // Pular linhas vazias
        if (!line || line.every(cell => !cell || cell.trim() === '')) {
          continue;
        }
        
        try {
          const item: ImportedPacklistItem = {
            lineNumber: lineNum
          };

          if (volumesIdx >= 0 && line[volumesIdx]) {
            item.volumes = line[volumesIdx];
          }

          if (pesoIdx >= 0 && line[pesoIdx]) {
            const pesoVal = parseFloat(line[pesoIdx].replace(',', '.'));
            if (!isNaN(pesoVal)) {
              item.peso = pesoVal;
            } else {
              errors.push({
                line: lineNum,
                message: `Peso inválido: "${line[pesoIdx]}"`
              });
            }
          }

          if (cbmIdx >= 0 && line[cbmIdx]) {
            const cbmVal = parseFloat(line[cbmIdx].replace(',', '.'));
            if (!isNaN(cbmVal)) {
              item.cbm = cbmVal;
            } else {
              errors.push({
                line: lineNum,
                message: `CBM inválido: "${line[cbmIdx]}"`
              });
            }
          }

          if (descricaoIdx >= 0 && line[descricaoIdx]) {
            item.descricao = line[descricaoIdx];
          }

          items.push(item);
        } catch (error) {
          errors.push({
            line: lineNum,
            message: `Erro ao processar linha: ${(error as any).message}`
          });
        }
      }

      console.log(`✅ Processamento completo: ${items.length} itens importados`);

      return {
        config,
        items,
        totalLines: fileData.lines.length - startIndex,
        successLines: items.length,
        errors
      };
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      return {
        config,
        items: [],
        totalLines: 0,
        successLines: 0,
        errors: [{ line: -1, message: (error as any).message }]
      };
    }
  }

  /**
   * Parseia CSV completo (todas as linhas)
   */
  private parseCSVComplete(file: File): Promise<FilePreviewData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').map(line => 
            line.split(',').map(col => col.trim())
          );
          
          // Retorna TODAS as linhas
          const maxCols = Math.max(...lines.map(l => l.length));
          
          resolve({
            lines: lines,
            columnCount: maxCols
          });
        } catch (error) {
          reject(new Error('Erro ao ler arquivo CSV: ' + (error as any).message));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }

  /**
   * Converte índice de coluna para letra (0 => A, 1 => B, etc)
   */
  columnIndexToLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /**
   * Converte letra para índice de coluna (A => 0, B => 1, etc)
   */
  columnLetterToIndex(letter: string): number {
    return letter.charCodeAt(0) - 65;
  }
}
