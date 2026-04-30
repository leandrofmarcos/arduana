export type StatusCustoDespachante =
  | 'Pendente'
  | 'EmAndamento'
  | 'Finalizado'
  | 'ReabertoPeloOV'
  | 'CanceladoPeloOV';

export interface CustoDespachante {
  id: string;
  codigoInterno: string;          // CD-AAAA-NNN
  despachanteId: string;
  importadorId: string;
  portoOrigemId: string;
  portoDestinoId: string;
  responsavel: string;            // nome livre até Users ser implementado
  peso: number;
  fobUsd: number;
  fobReais: number;
  cifUsd: number;
  cifReais: number;
  seguroUsd: number;
  freteInternacionalUsd: number;
  taxaUsd: number;
  taxaUsdAgente?: number;
  tamContainer: '20' | '40' | 'LCL';
  data: string;                   // ISO YYYY-MM-DD
  observacao?: string;
  solicitacaoOrcamentoId?: string; // FK opcional — pré-preenchido ao vir de uma solicitação
  status: StatusCustoDespachante;
  versao: number;
  versaoAnteriorId?: number;
  imutavel: boolean;
}

export interface CustoDespachanteLi {
  id: string;
  custoDespachanteId: string;
  ncm: string;
  descricao: string;
  valor: number;
  data: string;                   // ISO YYYY-MM-DD
}

export interface CustoDespachanteDespesa {
  id: string;
  custoDespachanteId: string;
  descricao: string;
  valor: number;
  data: string;                   // ISO YYYY-MM-DD
  entraBaseIcms: boolean;
}

export interface NcmVinculadoOrcamento {
  id: string;
  custoDespachanteId: string;
  ncmId: string;
  numeroNcm: string;
  descricao: string;
  aliIi: number;
  aliIpi: number;
  aliPis: number;
  aliCofins: number;
  aliIcms: number;
  baseCalculo: number;
}

export interface ValorImposto {
  id: string;
  ncmVinculadoOrcamentoId: string;
  aliIi: number;    valorIi: number;
  aliIpi: number;   valorIpi: number;
  aliPis: number;   valorPis: number;
  aliCofins: number; valorCofins: number;
  aliIcms: number;  valorIcms: number;
  totalImpostos: number;
}
