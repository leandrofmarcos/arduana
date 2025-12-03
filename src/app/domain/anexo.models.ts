export interface Anexo {
  id: string;
  processoId: string;
  nome: string;
  mime: string;
  tamanho: number;
  dataBase64?: string;
  dataUpload: string;
}