import { Injectable } from '@angular/core';
import { FilePreviewData, TemplatePacklist, TemplatePacklistConfig } from '../models/templates-packlist.models';

// Declaração do XLSX se estiver disponível globalmente
declare const XLSX: any;

@Injectable({ providedIn: 'root' })
export class TemplatesPacklistParserService {
  
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

  private parseXLSX(file: File): Promise<FilePreviewData> {
    return new Promise((resolve, reject) => {
      // Tenta usar XLSX do Node.js se disponível
      if (typeof XLSX !== 'undefined') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Pega primeira sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Converte para array de arrays
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
            
            const preview = lines.slice(0, 20);
            const maxCols = Math.max(...preview.map((l: string[]) => l.length), 1);
            
            resolve({
              lines: preview,
              columnCount: maxCols
            });
          } catch (error) {
            reject(new Error('Erro ao processar XLSX com biblioteca: ' + (error as any).message));
          }
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsArrayBuffer(file);
      } else {
        // Fallback para parser manual
        this.parseXLSXManual(file, resolve, reject);
      }
    });
  }

  private parseXLSXManual(file: File, resolve: any, reject: any): void {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const view = new Uint8Array(arrayBuffer);
        const text = this.uint8ArrayToString(view);
        
        if (text.charCodeAt(0) === 0x50 && text.charCodeAt(1) === 0x4B) {
          return this.extractFromZip(text, resolve, reject);
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
          throw new Error('Arquivo XLSX não contém dados de worksheet. Tente usar CSV ou instale suporte completo a XLSX.');
        }
        
        const rows = this.extractRowsFromXML(worksheetMatch[1]);
        
        if (rows.length === 0) {
          throw new Error('Nenhuma linha encontrada no XLSX');
        }
        
        const preview = rows.slice(0, 20);
        const maxCols = Math.max(...preview.map(r => r.length), 1);
        
        resolve({
          lines: preview,
          columnCount: maxCols
        });
        return;
      }
      
      const rows = this.extractRowsFromXML(sheetDataMatch[1]);
      
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

  validateMapping(config: TemplatePacklistConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const { fieldMapping } = config;
    
    const columns = Object.values(fieldMapping).filter(Boolean) as string[];
    const columnSet = new Set(columns);
    
    if (columns.length !== columnSet.size) {
      errors.push('Uma coluna foi mapeada para múltiplos campos. Verifique o mapeamento.');
    }

    if (config.linhaInicio < 1) {
      errors.push('Linha de início deve ser >= 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
