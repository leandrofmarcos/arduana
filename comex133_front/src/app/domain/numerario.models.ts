export type NumerarioStatus = 'Solicitado' | 'Enviado' | 'Pago' | 'Recebido';

export interface NumerarioLancamento {
  id: string;
  processoId: string;
  valor: number;
  moeda: 'BRL' | 'USD' | 'EUR';
  data: string;
  responsavel: string;
  status: NumerarioStatus;
  observacao?: string;
  trilha: { evento: string; data: string }[];
}