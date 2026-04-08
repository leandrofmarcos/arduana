export interface Ncm {
  id: string;
  codigoNcm: string;    // exatamente 8 dígitos numéricos
  descricao: string;
  aliqII: number;       // 0–100
  aliqIPI: number;
  aliqPIS: number;
  aliqCOFINS: number;
  aliqICMS: number;
  ativo: boolean;
}
