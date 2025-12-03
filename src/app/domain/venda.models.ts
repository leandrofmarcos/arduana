export interface VendaData {
  processoId: string;
  margemPerc: number;
  descontoPerc: number;
  precoComIPI: number;
  precoSemIPI: number;
  data: string;
  observacao?: string;
}