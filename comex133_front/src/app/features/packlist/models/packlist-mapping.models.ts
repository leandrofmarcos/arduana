/**
 * Modelo de mapeamento de campos do arquivo para campos do packlist
 */
export interface FieldMapping {
  volumes?: string;      // Ex: "A" (coluna que contém volumes)
  peso?: string;         // Ex: "B" (coluna que contém peso bruto)
  cbm?: string;          // Ex: "C" (coluna que contém CBM)
  descricao?: string;    // Ex: "D" (coluna que contém descrição)
}

/**
 * Configuração de importação definida pelo usuário
 */
export interface PacklistImportConfig {
  headerLine: number;    // Linha onde começam os dados (ex: 4 significa linha 4)
  fieldMapping: FieldMapping;
}

/**
 * Dados parseados do arquivo
 */
export interface FilePreviewData {
  lines: string[][];     // Array de linhas, cada linha é um array de colunas
  columnCount: number;   // Número de colunas encontradas
}

/**
 * Item importado do packlist
 */
export interface ImportedPacklistItem {
  volumes?: string;      // Pode ser número ou texto (ex: "10" ou "10 caixas")
  peso?: number;         // Peso em kg
  cbm?: number;          // Volume cúbico em m³
  descricao?: string;    // Descrição comercial
  lineNumber: number;    // Linha de origem no arquivo
}

/**
 * Resultado da importação
 */
export interface PacklistImportResult {
  config: PacklistImportConfig;
  items: ImportedPacklistItem[];
  totalLines: number;
  successLines: number;
  errors: { line: number; message: string }[];
}
