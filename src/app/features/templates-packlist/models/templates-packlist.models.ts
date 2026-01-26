export interface TemplatePacklistFieldMapping {
  numeroSequencial?: string;
  volumes?: string;
  peso?: string;
  cbm?: string;
  descricaoComercial?: string;
}

export interface TemplatePacklistConfig {
  linhaInicio: number;
  fieldMapping: TemplatePacklistFieldMapping;
}

export interface FilePreviewData {
  lines: string[][];
  columnCount: number;
}

export interface TemplatePacklist {
  id: string;
  nome: string;
  descricao?: string;
  nomeArquivo: string;
  fileContent?: string; // Base64 do arquivo para download
  config: TemplatePacklistConfig;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface TemplatePacklistListItem {
  id: string;
  nome: string;
  descricao?: string;
  nomeArquivo: string;
  fileContent?: string;
  dataCriacao: Date;
}
