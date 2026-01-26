import { Injectable } from '@angular/core';
import { FilePreviewData, PacklistImportConfig, ImportedPacklistItem, PacklistImportResult } from '../models/packlist-mapping.models';

/**
 * Serviço para processar e importar arquivos de packlist
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
      return this.parseXLSX(file);
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
          
          // Limitar a primeiras 20 linhas para preview
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
   * Parseia arquivo XLSX/XLS extraindo a primeira sheet
   * Usa abordagem de decodificação XML básica
   */
  private parseXLSX(file: File): Promise<FilePreviewData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // Tenta usar JSZip para descompactar XLSX
          const zlibSupport = this.tryLoadZlibIfAvailable();
          
          if (zlibSupport) {
            return this.parseXLSXWithZip(arrayBuffer, resolve, reject);
          }
          
          // Fallback: converter para string de forma segura sem usar apply
          const view = new Uint8Array(arrayBuffer);
          const text = this.uint8ArrayToString(view);
          
          // Detectar se é um ZIP válido (XLSX é ZIP)
          if (text.charCodeAt(0) === 0x50 && text.charCodeAt(1) === 0x4B) { // PK
            return this.parseXLSXManual(text, resolve, reject);
          }
          
          reject(new Error('Arquivo XLSX inválido ou corrompido'));
        } catch (error) {
          reject(new Error('Erro ao ler arquivo XLSX: ' + (error as any).message));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Converte Uint8Array para string de forma segura sem stack overflow
   */
  private uint8ArrayToString(uint8Array: Uint8Array): string {
    const chunkSize = 8192;
    let result = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      // Usar TextDecoder se disponível para melhor performance
      if (typeof TextDecoder !== 'undefined') {
        try {
          result += new TextDecoder('latin1').decode(chunk);
          continue;
        } catch (e) {
          // Fallback se TextDecoder falhar
        }
      }
      // Fallback manual seguro
      for (let j = 0; j < chunk.length; j++) {
        result += String.fromCharCode(chunk[j]);
      }
    }
    
    return result;
  }

  /**
   * Parser manual para XLSX usando decompressão básica
   */
  private parseXLSXManual(
    zipContent: string,
    resolve: (value: FilePreviewData) => void,
    reject: (error: any) => void
  ): void {
    try {
      // Procurar por worksheets no conteúdo
      // XLSX armazena dados em xl/worksheets/sheet1.xml
      // Tentaremos extrair o conteúdo do primeiro arquivo XML encontrado
      
      let xmlContent = '';
      
      // Procurar por padrão de início de XML
      const xmlStart = zipContent.indexOf('<?xml');
      if (xmlStart === -1) {
        throw new Error('Arquivo XLSX não contém XML válido');
      }
      
      // Procurar pelos dados de worksheet (contém <row> tags)
      let sheetStart = zipContent.indexOf('<worksheet');
      if (sheetStart === -1) {
        // Tentar procurar por <sheetData
        sheetStart = zipContent.indexOf('<sheetData');
      }
      
      if (sheetStart === -1) {
        throw new Error('Arquivo XLSX não contém dados de worksheet');
      }
      
      // Extrair até o final da worksheet/sheetData
      let sheetEnd = zipContent.indexOf('</worksheet>', sheetStart);
      if (sheetEnd === -1) {
        sheetEnd = zipContent.indexOf('</sheetData', sheetStart);
      }
      
      if (sheetEnd === -1) {
        throw new Error('Estrutura de XLSX inválida');
      }
      
      xmlContent = zipContent.substring(sheetStart, sheetEnd + 20);
      
      const rows = this.extractRowsFromXML(xmlContent);
      
      if (rows.length === 0) {
        throw new Error('Nenhuma linha encontrada no XLSX');
      }
      
      const preview = rows.slice(0, 20);
      const maxCols = Math.max(...preview.map(r => r.length), 1);
      
      resolve({
        lines: preview,
        columnCount: maxCols
      });
    } catch (error) {
      reject(error);
    }
  }

  /**
   * Tenta usar JSZip se disponível globalmente
   */
  private tryLoadZlibIfAvailable(): boolean {
    // Checando se JSZip está disponível como global
    return typeof (window as any)?.JSZip !== 'undefined';
  }

  /**
   * Parse com JSZip (se disponível)
   */
  private parseXLSXWithZip(
    arrayBuffer: ArrayBuffer,
    resolve: (value: FilePreviewData) => void,
    reject: (error: any) => void
  ): void {
    try {
      const JSZip = (window as any).JSZip;
      const zip = new JSZip();
      
      zip.loadAsync(arrayBuffer).then((zipFile: any) => {
        // Procurar pela primeira sheet em xl/worksheets/sheet1.xml
        const sheetFile = zipFile.file(/^xl\/worksheets\/sheet\d+\.xml$/)[0];
        
        if (!sheetFile) {
          reject(new Error('Arquivo XLSX não contém sheets'));
          return;
        }
        
        sheetFile.async('string').then((xmlContent: string) => {
          const rows = this.extractRowsFromXML(xmlContent);
          
          if (rows.length === 0) {
            reject(new Error('Nenhuma linha encontrada no XLSX'));
            return;
          }
          
          const preview = rows.slice(0, 20);
          const maxCols = Math.max(...preview.map(r => r.length));
          
          resolve({
            lines: preview,
            columnCount: maxCols
          });
        });
      }).catch((error: any) => {
        reject(new Error('Erro ao processar XLSX: ' + error.message));
      });
    } catch (error) {
      reject(error);
    }
  }

  /**
   * Extrai rows do XML da sheet
   */
  private extractRowsFromXML(xmlContent: string): string[][] {
    const rows: string[][] = [];
    
    try {
      // Regex para encontrar elementos <row>
      const rowRegex = /<row[^>]*>[\s\S]*?<\/row>/g;
      const rowMatches = xmlContent.match(rowRegex) || [];
      
      for (const rowMatch of rowMatches) {
        const cells: string[] = [];
        
        // Regex para encontrar elementos <c> (células)
        const cellRegex = /<c[^>]*>[\s\S]*?<\/c>/g;
        const cellMatches = rowMatch.match(cellRegex) || [];
        
        for (const cellMatch of cellMatches) {
          // Procurar por <v> (valor) dentro da célula
          const valueMatch = cellMatch.match(/<v[^>]*>([\s\S]*?)<\/v>/);
          let value = valueMatch ? valueMatch[1].trim() : '';
          
          // Procurar por referência de string em <is> se houver
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
   * Valida o mapeamento de campos
   */
  validateMapping(config: PacklistImportConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const { fieldMapping } = config;
    
    // Verificar se cada coluna foi mapeada apenas uma vez
    const columns = Object.values(fieldMapping).filter(Boolean) as string[];
    const columnSet = new Set(columns);
    
    if (columns.length !== columnSet.size) {
      errors.push('Uma coluna foi mapeada para múltiplos campos. Verifique o mapeamento.');
    }

    // Validar se header line é válido
    if (config.headerLine < 1) {
      errors.push('Linha de cabeçalho deve ser >= 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Processa arquivo completo com base na configuração de mapeamento
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
      const preview = await this.parseFile(file);
      const items: ImportedPacklistItem[] = [];
      const errors: { line: number; message: string }[] = [];

      // Começar da linha indicada (headerLine) + 1 (primeira linha de dados)
      const startIndex = config.headerLine; // 0-indexed na array, mas config é 1-indexed
      const { volumes, peso, cbm, descricao } = config.fieldMapping;
      
      // Mapear colunas para índices (A=0, B=1, etc)
      const colIndex = (col?: string) => col ? col.charCodeAt(0) - 65 : -1;
      
      const volumesIdx = colIndex(volumes);
      const pesoIdx = colIndex(peso);
      const cbmIdx = colIndex(cbm);
      const descricaoIdx = colIndex(descricao);

      // Processar cada linha de dados
      for (let i = startIndex; i < preview.lines.length; i++) {
        const line = preview.lines[i];
        const lineNum = i + 1; // Converter de volta para 1-indexed
        
        try {
          const item: ImportedPacklistItem = {
            lineNumber: lineNum
          };

          if (volumesIdx >= 0 && line[volumesIdx]) {
            item.volumes = line[volumesIdx];
          }

          if (pesoIdx >= 0 && line[pesoIdx]) {
            const pesoVal = parseFloat(line[pesoIdx]);
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
            const cbmVal = parseFloat(line[cbmIdx]);
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

      return {
        config,
        items,
        totalLines: preview.lines.length - startIndex,
        successLines: items.length,
        errors
      };
    } catch (error) {
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
