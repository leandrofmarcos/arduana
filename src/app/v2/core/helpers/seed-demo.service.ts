/**
 * SeedDemoService — Etapa 10
 *
 * Serviço PROVISÓRIO de dados demo para apresentação do sistema.
 * Totalmente desacoplado: não é importado por nenhum módulo core.
 * Para remover do sistema, basta deletar este arquivo e os dois
 * pontos de injeção no DashboardV2Component.
 *
 * Os dados respeitam todos os relacionamentos do modelo V2:
 *   PortoOrigem / PortoDestino → ControleNavio / Trajeto
 *   → CustoDespachante (+ LI, Despesas, NCMs, Impostos)
 *   → OrcamentoVenda (+ Despesas, Extras)
 *   → EmbarqueAduana (+ HistoricoStatus, FreeTime, Pagamentos)
 *
 * Data de referência dos cenários: 01/04/2026
 */

import { Injectable } from '@angular/core';
import {
  keysV2, readV2, writeV2, generateV2Id
} from './storage-v2.helper';

import { PortoOrigem }          from '../../features/cadastros/portos-origem/models/porto-origem.models';
import { PortoDestino }         from '../../features/cadastros/portos-destino/models/porto-destino.models';
import { Exportador }           from '../../features/cadastros/exportadores/models/exportador.models';
import { AgenteCarga }          from '../../features/cadastros/agentes-carga/models/agente-carga.models';
import { Fabricante }           from '../../features/cadastros/fabricantes/models/fabricante.models';
import { Importador }           from '../../features/cadastros/importadores/models/importador.models';
import { ClienteV2 }            from '../../features/cadastros/clientes/models/cliente-v2.models';
import { DespachanteV2 }        from '../../features/cadastros/despachantes/models/despachante-v2.models';
import { Ncm }                  from '../../features/cadastros/ncm/models/ncm.models';
import { ListaPrecoLcl }        from '../../features/cadastros/lista-preco-lcl/models/lista-preco-lcl.models';
import { ControleNavio, ControleNavioTrajeto } from '../../features/logistica/controle-navios/models/controle-navio.models';
import {
  CustoDespachante, CustoDespachanteLi, CustoDespachanteDespesa,
  NcmVinculadoOrcamento, ValorImposto, StatusCustoDespachante
} from '../../features/custo-despachante/models/custo-despachante.models';
import {
  OrcamentoVenda, OrcamentoVendaDespesa, OrcamentoVendaDespesaExtra, OrcamentoVendaCusto
} from '../../features/orcamento-venda/models/orcamento-venda.models';
import {
  EmbarqueAduana, HistoricoStatusEmbarque, FreeTimeEmbarque, PagamentoProcesso, StatusEmbarque
} from '../../features/embarque-aduana/models/embarque-aduana.models';
import { ModeloDespesa, ModeloDespesaItem } from '../../features/cadastros/modelos-despesa/models/modelo-despesa.models';
import { DespesaCadastro } from '../../features/cadastros/despesas-cadastro/models/despesa-cadastro.models';
import {
  SolicitacaoOrcamento, SolicitacaoOrcamentoDespachante
} from '../../features/solicitacao-orcamento/models/solicitacao-orcamento.models';

const DEMO_FLAG = 'v2_demo_carregado';

// Chaves demo-próprias — permite limpar sem tocar nos seeds de sistema
const DEMO_KEYS = [
  keysV2.portosOrigem, keysV2.portosDestino,
  keysV2.exportadores, keysV2.agentesCarga, keysV2.fabricantes,
  keysV2.importadores, keysV2.clientes, keysV2.despachantes,
  keysV2.ncms, keysV2.listaPrecoLcl,
  keysV2.controleNavios, keysV2.navioTrajetos,
  keysV2.custos, keysV2.custosLi, keysV2.custosDespesas,
  keysV2.ncmsVinculados, keysV2.valoresImposto,
  keysV2.orcamentosVenda, keysV2.orcDespesas, keysV2.orcExtras,
  keysV2.embarques, keysV2.historicoStatus, keysV2.freeTimes, keysV2.pagamentos,
  keysV2.modelosDespesa, keysV2.modelosDespesaItens,
  keysV2.solicitacoes, keysV2.solicitacaoDespachantes, keysV2.solicitacaoDocumentos,
  keysV2.orcCustos,
];

@Injectable({ providedIn: 'root' })
export class SeedDemoService {

  isDemoCarregado(): boolean {
    return localStorage.getItem(DEMO_FLAG) === 'true';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIMPAR
  // ─────────────────────────────────────────────────────────────────────────

  limparSeedDemo(): void {
    DEMO_KEYS.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(DEMO_FLAG);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CARREGAR
  // ─────────────────────────────────────────────────────────────────────────

  carregarSeedDemo(): void {
    if (this.isDemoCarregado()) return;

    // ── 1. Portos Origem ────────────────────────────────────────────────
    const sha  = this._porto<PortoOrigem>(keysV2.portosOrigem, { nome: 'Porto de Shanghai',    codigo: 'SHA', pais: 'China' });
    const ngb  = this._porto<PortoOrigem>(keysV2.portosOrigem, { nome: 'Porto de Ningbo',      codigo: 'NGB', pais: 'China' });
    const hkg  = this._porto<PortoOrigem>(keysV2.portosOrigem, { nome: 'Porto de Hong Kong',   codigo: 'HKG', pais: 'China' });
    const tao  = this._porto<PortoOrigem>(keysV2.portosOrigem, { nome: 'Porto de Qingdao',     codigo: 'TAO', pais: 'China' });
    const gzh  = this._porto<PortoOrigem>(keysV2.portosOrigem, { nome: 'Porto de Guangzhou',   codigo: 'GZH', pais: 'China' });
    [sha, ngb, hkg, tao, gzh]; // linted

    // ── 2. Portos Destino ───────────────────────────────────────────────
    const stz = this._porto<PortoDestino>(keysV2.portosDestino, { nome: 'Porto de Santos',           codigo: 'BRSSZ', estado: 'SP', pais: 'Brasil' });
    const png = this._porto<PortoDestino>(keysV2.portosDestino, { nome: 'Porto de Paranaguá',         codigo: 'BRPNG', estado: 'PR', pais: 'Brasil' });
    const itj = this._porto<PortoDestino>(keysV2.portosDestino, { nome: 'Porto de Itajaí',            codigo: 'BRITJ', estado: 'SC', pais: 'Brasil' });
    const rjo = this._porto<PortoDestino>(keysV2.portosDestino, { nome: 'Porto do Rio de Janeiro',    codigo: 'BRRJO', estado: 'RJ', pais: 'Brasil' });
    const pce = this._porto<PortoDestino>(keysV2.portosDestino, { nome: 'Porto do Pecém',             codigo: 'BRPCE', estado: 'CE', pais: 'Brasil' });
    [itj, rjo, pce]; // linted

    // ── 3. Exportadores ─────────────────────────────────────────────────
    const expTech    = this._add<Exportador>(keysV2.exportadores, { nome: 'Shanghai Tech Electronics Co. Ltd', documento: '91310000MA1FL0XT0P', pais: 'China', cidade: 'Shanghai',    ativo: true });
    const expTextil  = this._add<Exportador>(keysV2.exportadores, { nome: 'Ningbo Textile Manufacturing Ltd',  documento: '91330200MA27YFUX0R', pais: 'China', cidade: 'Ningbo',     ativo: true });
    const expAuto    = this._add<Exportador>(keysV2.exportadores, { nome: 'Guangdong Auto Parts Co. Ltd',      documento: '91440300MA5DLTXY0H', pais: 'China', cidade: 'Guangzhou',  ativo: true });

    // ── 4. Agentes de Carga ─────────────────────────────────────────────
    const agCosco = this._add<AgenteCarga>(keysV2.agentesCarga, { nome: 'COSCO Shipping Lines',               documento: '91110000100012341X', pais: 'China',   contato: 'booking@cosco.com', ativo: true });
    const agMsc   = this._add<AgenteCarga>(keysV2.agentesCarga, { nome: 'Mediterranean Shipping Co. (MSC)',   documento: 'CHE-105.740.372',    pais: 'Suíça',   contato: 'br@msc.com',        ativo: true });
    const agCma   = this._add<AgenteCarga>(keysV2.agentesCarga, { nome: 'CMA CGM Brasil Logistics',           documento: '04.916.107/0001-44', pais: 'Brasil',  contato: 'ops@cmacgm.com.br', ativo: true });

    // ── 5. Fabricantes ──────────────────────────────────────────────────
    this._add<Fabricante>(keysV2.fabricantes, { nome: 'Shenzhen Consumer Electronics Factory', pais: 'China', cidade: 'Shenzhen',  contato: 'sales@szcef.cn',    ativo: true });
    this._add<Fabricante>(keysV2.fabricantes, { nome: 'Ningbo Garment & Textile Maker',         pais: 'China', cidade: 'Ningbo',    contato: 'export@ngtm.cn',    ativo: true });
    this._add<Fabricante>(keysV2.fabricantes, { nome: 'Guangzhou Motor Components Ltd',         pais: 'China', cidade: 'Guangzhou', contato: 'info@gzmcl.com.cn', ativo: true });

    // ── 6. Importadores ─────────────────────────────────────────────────
    const impTech   = this._add<Importador>(keysV2.importadores, { razaoSocial: 'TechBrasil Importações Ltda',           cnpj: '12.345.678/0001-90', email: 'importacao@techbrasil.com.br',  telefone: '(11) 3456-7890', ativo: true });
    const impTextil = this._add<Importador>(keysV2.importadores, { razaoSocial: 'Têxtil Sul Comércio Exterior Ltda',     cnpj: '23.456.789/0001-01', email: 'exterior@textilsul.com.br',      telefone: '(41) 3234-5678', ativo: true });
    const impAuto   = this._add<Importador>(keysV2.importadores, { razaoSocial: 'AutoPeças Nacional Importações Ltda',   cnpj: '34.567.890/0001-12', email: 'comex@autopecasnacional.com.br', telefone: '(11) 4567-8901', ativo: true });

    // ── 7. Clientes ─────────────────────────────────────────────────────
    const cliTech   = this._add<ClienteV2>(keysV2.clientes, { razaoSocial: 'TechBrasil Importações Ltda',           cnpj: '12.345.678/0001-90', email: 'contato@techbrasil.com.br',     telefone: '(11) 3456-7890', ativo: true });
    const cliTextil = this._add<ClienteV2>(keysV2.clientes, { razaoSocial: 'Têxtil Sul Comércio Exterior Ltda',     cnpj: '23.456.789/0001-01', email: 'contato@textilsul.com.br',       telefone: '(41) 3234-5678', ativo: true });
    const cliAuto   = this._add<ClienteV2>(keysV2.clientes, { razaoSocial: 'AutoPeças Nacional Importações Ltda',   cnpj: '34.567.890/0001-12', email: 'contato@autopecasnacional.com.br', telefone: '(11) 4567-8901', ativo: true });
    const cliMega   = this._add<ClienteV2>(keysV2.clientes, { razaoSocial: 'MegaMart Distribuidora Nacional Ltda', cnpj: '45.678.901/0001-23', email: 'comex@megamart.com.br',           telefone: '(21) 5678-9012', ativo: true });

    // ── 8. Despachantes ─────────────────────────────────────────────────
    const despCosta = this._add<DespachanteV2>(keysV2.despachantes, { nome: 'Costa & Associados Despachos Aduaneiros', crn: '1234', email: 'despacho@costaassoc.com.br', telefone: '(11) 3210-4567', ativo: true });
    const despLog   = this._add<DespachanteV2>(keysV2.despachantes, { nome: 'Logística Brasil Despachos Ltda',          crn: '5678', email: 'comex@logisticabrasil.com.br', telefone: '(11) 2109-8765', ativo: true });

    // ── 9. NCMs ─────────────────────────────────────────────────────────
    const ncmSmartphone = this._add<Ncm>(keysV2.ncms, { codigoNcm: '85171400', descricao: 'Smartphones e aparelhos celulares',                ativo: true, aliqII: 20, aliqIPI: 15, aliqPIS: 2.10, aliqCOFINS: 9.65, aliqICMS: 18 });
    const ncmLaptop     = this._add<Ncm>(keysV2.ncms, { codigoNcm: '84713000', descricao: 'Laptops e computadores portáteis',                  ativo: true, aliqII: 16, aliqIPI: 10, aliqPIS: 2.10, aliqCOFINS: 9.65, aliqICMS: 18 });
    const ncmCamiseta   = this._add<Ncm>(keysV2.ncms, { codigoNcm: '61099000', descricao: 'Camisetas e regatas de malha de algodão',           ativo: true, aliqII: 35, aliqIPI: 0,  aliqPIS: 2.10, aliqCOFINS: 9.65, aliqICMS: 12 });
    const ncmAutopeca   = this._add<Ncm>(keysV2.ncms, { codigoNcm: '87089900', descricao: 'Partes e acessórios para veículos automotores',     ativo: true, aliqII: 18, aliqIPI: 5,  aliqPIS: 2.10, aliqCOFINS: 9.65, aliqICMS: 12 });
    const ncmCamisa     = this._add<Ncm>(keysV2.ncms, { codigoNcm: '61051000', descricao: 'Camisas casuais de algodão para homens',            ativo: true, aliqII: 35, aliqIPI: 0,  aliqPIS: 2.10, aliqCOFINS: 9.65, aliqICMS: 12 });

    // ── 10. Lista Preço LCL ─────────────────────────────────────────────
    this._add<ListaPrecoLcl>(keysV2.listaPrecoLcl, { categoria: 'Geral',      descricao: 'Carga Geral LCL Shanghai–Santos', precoUsdPorCbm: 280, precoUsdPorKg: 1.50, dataVigencia: '2026-01-01', ativo: true });
    this._add<ListaPrecoLcl>(keysV2.listaPrecoLcl, { categoria: 'Perecível',  descricao: 'Carga Refrigerada LCL',           precoUsdPorCbm: 420, precoUsdPorKg: 2.20, dataVigencia: '2026-01-01', ativo: true });
    this._add<ListaPrecoLcl>(keysV2.listaPrecoLcl, { categoria: 'Perigosa',   descricao: 'IMO / Carga Perigosa LCL',        precoUsdPorCbm: 380, precoUsdPorKg: 1.90, dataVigencia: '2026-01-01', ativo: true });

    // ── 11. Navios + Trajetos ───────────────────────────────────────────
    const navioMsc    = this._navio('MSC Aurora',    '2026-001');
    const navioCosco  = this._navio('COSCO Harmony', '2026-002');
    const navioCma    = this._navio('CMA Brésil',    '2026-003');

    this._trajeto(navioMsc.id,   sha.id, stz.id, '2026-03-01', '2026-04-05', 'Shanghai → Santos');
    this._trajeto(navioCosco.id, ngb.id, png.id, '2026-03-10', '2026-04-19', 'Ningbo → Paranaguá');
    this._trajeto(navioCma.id,   sha.id, stz.id, '2026-04-05', '2026-05-10', 'Shanghai → Santos');

    // ── 12-13. Custos + Orçamentos + 14. Embarques ─────────────────────

    // ─── CENÁRIO 1 — Finalizado com sucesso ─────────────────────────────
    const cd1 = this._custo('CD-2026-001', despCosta.id, impTech.id,   sha.id, stz.id, '40', 12500, 85000, 24000, 92000, 26400, 1.50, 280, '2026-02-10',
      [{ ncm: '8517.14.00', descricao: 'Smartphones Galaxy A54 (500 un)', valor: 62000, data: '2026-02-10' }],
      [{ descricao: 'Honorário despachante', valor: 3500, data: '2026-02-10', entraBaseIcms: false },
       { descricao: 'AFRMM', valor: 2800, data: '2026-02-10', entraBaseIcms: true }],
      [{ ncmId: ncmSmartphone.id, numeroNcm: '85171400', descricao: 'Smartphones', aliIi: 20, aliIpi: 15, aliPis: 2.10, aliCofins: 9.65, aliIcms: 18, baseCalculo: 92000 }],
      'Finalizado'
    );
    const ov1 = this._orcamento('OV-2026-001', cliTech.id, cd1.id, '40', 12500, 11800, 6200, 85000, 24000, 92000, 1.50, 8500, 68700, 6300, 0, '2026-02-12',
      [{ descricao: 'Capatazia Santos', valor: 1800 }, { descricao: 'THC destino', valor: 1200 }, { descricao: 'Armazenagem porto', valor: 3300 }],
      []
    );
    const emb1 = this._embarque('EMB-2026-001', ov1.id, cd1.id, sha.id, stz.id, agMsc.id,   cliTech.id,   navioMsc.id,   despCosta.id, expTech.id,
      'IMP-2026-001', 'MSCAU26001B/0001', 'CONT-001-SHA', 12500, '2026-03-01', '2026-04-05',
      'LI-2026-001', '2026-04-07', '2026-03-28', '2026-03-12', '2026-03-20', '2026-03-25', 'FNLZ',
      'Processo finalizado sem intercorrências'
    );
    this._historico(emb1.id, emb1.statusEmbarqueId, [
      { codigo: 'PREV', dataStatus: '2026-03-01T09:00:00', obs: 'Embarque previsto — documentação entregue ao despachante' },
      { codigo: 'AGRD', dataStatus: '2026-03-05T14:30:00', obs: 'Aguardando embarque no porto de origem' },
      { codigo: 'ATRC', dataStatus: '2026-04-05T08:00:00', obs: 'Navio atracado no Porto de Santos' },
      { codigo: 'RGTD', dataStatus: '2026-04-07T11:20:00', obs: 'DI registrada — canal verde' },
      { codigo: 'DSMB', dataStatus: '2026-04-10T16:45:00', obs: 'Mercadoria desembaraçada, aguardando retirada' },
      { codigo: 'ENTG', dataStatus: '2026-03-20T10:00:00', obs: 'Entregue no armazém do cliente em SP' },
      { codigo: 'FNLZ', dataStatus: '2026-03-25T09:00:00', obs: 'Processo encerrado — NF emitida, pagamentos quitados' },
    ]);
    this._freeTime(emb1.id, 14, '2026-04-05', '2026-04-19');
    this._pagamentos(emb1.id, despCosta.id, [
      { tipo: 'CobrancaSinal',  prevista: '2026-03-01', pago: '2026-03-01', valor: 12000 },
      { tipo: 'FechamentoPago', prevista: '2026-03-22', pago: '2026-03-22', valor: 28680 },
      { tipo: 'Honorario',      prevista: '2026-03-25', pago: '2026-03-25', valor: 3500  },
    ]);

    // ─── CENÁRIO 2 — Entregue, honorário pendente e vencido ─────────────
    const cd2 = this._custo('CD-2026-002', despCosta.id, impTextil.id, ngb.id, png.id, '40', 9800, 42000, 11800, 48000, 13700, 1.35, 220, '2026-02-20',
      [{ ncm: '6109.90.00', descricao: 'Camisetas malha algodão (2.000 un)', valor: 38000, data: '2026-02-20' }],
      [{ descricao: 'Honorário despachante', valor: 2800, data: '2026-02-20', entraBaseIcms: false },
       { descricao: 'AFRMM', valor: 2100, data: '2026-02-20', entraBaseIcms: true }],
      [{ ncmId: ncmCamiseta.id, numeroNcm: '61099000', descricao: 'Camisetas algodão', aliIi: 35, aliIpi: 0, aliPis: 2.10, aliCofins: 9.65, aliIcms: 12, baseCalculo: 48000 }]
    );
    const ov2 = this._orcamento('OV-2026-002', cliTextil.id, cd2.id, '40', 9800, 9200, 4200, 42000, 11800, 48000, 1.35, 5800, 30200, 4900, 0, '2026-02-22',
      [{ descricao: 'Capatazia Paranaguá', valor: 1600 }, { descricao: 'Armazenagem frigorífica', valor: 3300 }],
      []
    );
    const emb2 = this._embarque('EMB-2026-002', ov2.id, cd2.id, ngb.id, png.id, agCosco.id, cliTextil.id, navioCosco.id, despCosta.id, expTextil.id,
      'IMP-2026-002', 'COHA26002C/0001', 'CONT-002-NGB', 9800, '2026-03-10', '2026-04-19',
      'LI-2026-002', '2026-04-21', '2026-04-12', '2026-04-15', '2026-04-20', '2026-03-28', 'ENTG',
      'Honorário pendente de pagamento'
    );
    this._historico(emb2.id, emb2.statusEmbarqueId, [
      { codigo: 'PREV', dataStatus: '2026-03-10T09:00:00', obs: 'Processo aberto' },
      { codigo: 'AGRD', dataStatus: '2026-03-12T10:00:00', obs: 'Aguardando saída do navio' },
      { codigo: 'ATRC', dataStatus: '2026-04-19T07:30:00', obs: 'COSCO Harmony atracou em Paranaguá' },
      { codigo: 'RGTD', dataStatus: '2026-04-21T13:00:00', obs: 'DI registrada — canal amarelo, exigiu inspeção documental' },
      { codigo: 'DSMB', dataStatus: '2026-04-23T09:00:00', obs: 'Mercadoria liberada após conferência' },
      { codigo: 'ENTG', dataStatus: '2026-03-28T14:00:00', obs: 'Entregue no CD em Curitiba' },
    ]);
    this._freeTime(emb2.id, 14, '2026-04-19', '2026-05-03');
    this._pagamentos(emb2.id, despCosta.id, [
      { tipo: 'CobrancaSinal',  prevista: '2026-03-10', pago: '2026-03-10', valor: 8000  },
      { tipo: 'FechamentoPago', prevista: '2026-04-01', pago: '2026-04-01', valor: 20920 },
      { tipo: 'Honorario',      prevista: '2026-04-01', pago: undefined,    valor: 2800  }, // VENCIDO
    ]);

    // ─── CENÁRIO 3 — Desembaraçado, pagamento de fechamento pendente ────
    const cd3 = this._custo('CD-2026-003', despLog.id, impAuto.id, gzh.id, stz.id, '20', 7200, 31000, 8700, 36000, 10300, 1.42, 195, '2026-02-28',
      [{ ncm: '8708.99.00', descricao: 'Amortecedores e molas p/ VW/GM (150 cx)', valor: 27000, data: '2026-02-28' }],
      [{ descricao: 'Honorário despachante', valor: 2200, data: '2026-02-28', entraBaseIcms: false },
       { descricao: 'AFRMM', valor: 1650, data: '2026-02-28', entraBaseIcms: true }],
      [{ ncmId: ncmAutopeca.id, numeroNcm: '87089900', descricao: 'Autopecas', aliIi: 18, aliIpi: 5, aliPis: 2.10, aliCofins: 9.65, aliIcms: 12, baseCalculo: 36000 }]
    );
    const ov3 = this._orcamento('OV-2026-003', cliAuto.id, cd3.id, '20', 7200, 6900, 3100, 31000, 8700, 36000, 1.42, 4500, 18200, 3850, 0, '2026-03-01',
      [{ descricao: 'Capatazia Santos', valor: 1100 }, { descricao: 'Armazenagem', valor: 2750 }],
      []
    );
    const emb3 = this._embarque('EMB-2026-003', ov3.id, cd3.id, gzh.id, stz.id, agCma.id,  cliAuto.id,  navioMsc.id,  despLog.id,  expAuto.id,
      'IMP-2026-003', 'CMABR26003D/0001', 'CONT-003-GZH', 7200, '2026-02-25', '2026-03-30',
      'LI-2026-003', '2026-04-01', '2026-03-25', '2026-03-28', undefined, undefined, 'DSMB',
      'Aguardando agendamento de entrega'
    );
    this._historico(emb3.id, emb3.statusEmbarqueId, [
      { codigo: 'PREV', dataStatus: '2026-02-25T09:00:00', obs: 'Processo aberto — LI deferida' },
      { codigo: 'AGRD', dataStatus: '2026-03-01T11:00:00', obs: 'Aguardando embarque' },
      { codigo: 'ATRC', dataStatus: '2026-03-30T06:45:00', obs: 'Navio atracado em Santos' },
      { codigo: 'RGTD', dataStatus: '2026-04-01T15:00:00', obs: 'DI registrada' },
      { codigo: 'DSMB', dataStatus: '2026-03-28T12:30:00', obs: 'Canal verde, mercadoria desembaraçada' },
    ]);
    this._freeTime(emb3.id, 21, '2026-03-30', '2026-04-20');
    this._pagamentos(emb3.id, despLog.id, [
      { tipo: 'CobrancaSinal',  prevista: '2026-02-28', pago: '2026-02-28', valor: 6000  },
      { tipo: 'FechamentoPago', prevista: '2026-04-10', pago: undefined,    valor: 15060 }, // pendente (não vencido)
      { tipo: 'Honorario',      prevista: '2026-04-15', pago: undefined,    valor: 2200  },
    ]);

    // ─── CENÁRIO 4 — Free time CRÍTICO: 1 dia restante 🔴 ───────────────
    const cd4 = this._custo('CD-2026-004', despLog.id, impTech.id, sha.id, stz.id, '40', 18000, 122000, 34300, 138000, 39500, 1.55, 320, '2026-03-05',
      [{ ncm: '8471.30.00', descricao: 'Laptops Dell/Lenovo (800 un)', valor: 108000, data: '2026-03-05' }],
      [{ descricao: 'Honorário despachante',     valor: 4200, data: '2026-03-05', entraBaseIcms: false },
       { descricao: 'AFRMM',                     valor: 3800, data: '2026-03-05', entraBaseIcms: true  },
       { descricao: 'Siscomex + Taxa RFB',        valor: 1200, data: '2026-03-05', entraBaseIcms: false }],
      [{ ncmId: ncmLaptop.id, numeroNcm: '84713000', descricao: 'Laptops port.', aliIi: 16, aliIpi: 10, aliPis: 2.10, aliCofins: 9.65, aliIcms: 18, baseCalculo: 138000 }]
    );
    const ov4 = this._orcamento('OV-2026-004', cliMega.id, cd4.id, '40', 18000, 17200, 8300, 122000, 34300, 138000, 1.55, 14500, 86000, 9200, 2400, '2026-03-07',
      [{ descricao: 'Capatazia Santos', valor: 2100 }, { descricao: 'Pesagem', valor: 900 }, { descricao: 'Armazenagem CLS', valor: 6200 }],
      [{ descricao: 'Seguro adicional MegaMart', valor: 2400 }]
    );
    const emb4 = this._embarque('EMB-2026-004', ov4.id, cd4.id, sha.id, stz.id, agMsc.id,  cliMega.id,  navioMsc.id,  despLog.id,  expTech.id,
      'IMP-2026-004', 'MSCAU26004E/0001', 'CONT-004-SHA', 18000, '2026-03-08', '2026-03-23',
      'LI-2026-004', '2026-03-25', '2026-03-23', '2026-03-20', undefined, undefined, 'RGTD',
      'DI registrada — aguardando canal de parametrização'
    );
    this._historico(emb4.id, emb4.statusEmbarqueId, [
      { codigo: 'PREV', dataStatus: '2026-03-08T09:00:00', obs: 'Processo iniciado — LI em análise' },
      { codigo: 'AGRD', dataStatus: '2026-03-10T10:00:00', obs: 'Aguardando embarque — LI deferida' },
      { codigo: 'ATRC', dataStatus: '2026-03-23T05:30:00', obs: 'MSC Aurora atracou em Santos, berço 12' },
      { codigo: 'RGTD', dataStatus: '2026-03-25T16:00:00', obs: 'DI registrada, aguardando parametrização RFB' },
    ]);
    // Free time CRÍTICO: 10 dias, inicio 23/03, fim 02/04 → 1 dia restante em 01/04
    this._freeTime(emb4.id, 10, '2026-03-23', '2026-04-02');
    this._pagamentos(emb4.id, despLog.id, [
      { tipo: 'CobrancaSinal',  prevista: '2026-03-08', pago: undefined,    valor: 20000 }, // VENCIDO
      { tipo: 'FechamentoPago', prevista: '2026-04-05', pago: undefined,    valor: 40720 },
      { tipo: 'Honorario',      prevista: '2026-04-10', pago: undefined,    valor: 4200  },
    ]);

    // ─── CENÁRIO 5 — Atracado, free time 7 dias restantes 🟠 ────────────
    const cd5 = this._custo('CD-2026-005', despCosta.id, impTech.id, sha.id, stz.id, '40', 16500, 98000, 27600, 112000, 32000, 1.52, 298, '2026-03-15',
      [{ ncm: '8517.14.00', descricao: 'Smartphones ASUS/Xiaomi (1.200 un)', valor: 89000, data: '2026-03-15' }],
      [{ descricao: 'Honorário despachante', valor: 3800, data: '2026-03-15', entraBaseIcms: false },
       { descricao: 'AFRMM',                valor: 3100, data: '2026-03-15', entraBaseIcms: true  }],
      [{ ncmId: ncmSmartphone.id, numeroNcm: '85171400', descricao: 'Smartphones', aliIi: 20, aliIpi: 15, aliPis: 2.10, aliCofins: 9.65, aliIcms: 18, baseCalculo: 112000 }]
    );
    const ov5 = this._orcamento('OV-2026-005', cliTech.id, cd5.id, '40', 16500, 15800, 7400, 98000, 27600, 112000, 1.52, 11200, 83700, 6900, 0, '2026-03-17',
      [{ descricao: 'Capatazia Santos', valor: 1900 }, { descricao: 'Armazenagem porto', valor: 5000 }],
      []
    );
    const emb5 = this._embarque('EMB-2026-005', ov5.id, cd5.id, sha.id, stz.id, agMsc.id,  cliTech.id,  navioMsc.id,  despCosta.id, expTech.id,
      'IMP-2026-005', 'MSCAU26005F/0001', 'CONT-005-SHA', 16500, '2026-03-18', '2026-04-01',
      'LI-2026-005', undefined, undefined, undefined, undefined, undefined, 'ATRC',
      'Navio atracado. DI a ser registrada'
    );
    this._historico(emb5.id, emb5.statusEmbarqueId, [
      { codigo: 'PREV', dataStatus: '2026-03-18T09:00:00', obs: 'Processo aberto — documentação enviada' },
      { codigo: 'AGRD', dataStatus: '2026-03-20T11:00:00', obs: 'Aguardando chegada do navio' },
      { codigo: 'ATRC', dataStatus: '2026-04-01T06:00:00', obs: 'MSC Aurora atracado em Santos — início free time' },
    ]);
    // Free time: 10 dias iniciado 29/03, fim 08/04 → 7 dias em 01/04
    this._freeTime(emb5.id, 10, '2026-03-29', '2026-04-08');
    this._pagamentos(emb5.id, despCosta.id, [
      { tipo: 'CobrancaSinal',  prevista: '2026-03-18', pago: '2026-03-18', valor: 15000 },
      { tipo: 'FechamentoPago', prevista: '2026-04-05', pago: undefined,    valor: 34280 }, // pendente futuro
    ]);

    // ─── CENÁRIO 6 — Aguardando chegada, ETA em 7 dias ──────────────────
    const cd6 = this._custo('CD-2026-006', despCosta.id, impTextil.id, sha.id, stz.id, 'LCL', 3200, 24000, 6700, 28500, 8100, 1.38, 168, '2026-04-01',
      [{ ncm: '6105.10.00', descricao: 'Camisas casuais masculinas (800 un)', valor: 21000, data: '2026-04-01' }],
      [{ descricao: 'Honorário despachante', valor: 1800, data: '2026-04-01', entraBaseIcms: false },
       { descricao: 'AFRMM LCL', valor: 1200, data: '2026-04-01', entraBaseIcms: true }],
      [{ ncmId: ncmCamisa.id, numeroNcm: '61051000', descricao: 'Camisas algodão', aliIi: 35, aliIpi: 0, aliPis: 2.10, aliCofins: 9.65, aliIcms: 12, baseCalculo: 28500 }]
    );
    const ov6 = this._orcamento('OV-2026-006', cliTextil.id, cd6.id, 'LCL', 3200, 3000, 1200, 24000, 6700, 28500, 1.38, 3200, 17900, 3000, 0, '2026-04-01',
      [{ descricao: 'Taxa consolidação LCL', valor: 900 }, { descricao: 'Armazenagem destino', valor: 2100 }],
      []
    );
    const emb6 = this._embarque('EMB-2026-006', ov6.id, cd6.id, sha.id, stz.id, agCma.id,  cliTextil.id, navioCma.id,  despCosta.id, expTextil.id,
      'IMP-2026-006', 'CMABR26006G/0001', 'LCL-006-SHA', 3200, '2026-04-05', '2026-04-08',
      'LI-2026-006', undefined, undefined, undefined, undefined, undefined, 'AGRD',
      'Navio em trânsito — ETA em 7 dias'
    );
    this._historico(emb6.id, emb6.statusEmbarqueId, [
      { codigo: 'PREV', dataStatus: '2026-04-01T09:00:00', obs: 'Processo aberto' },
      { codigo: 'AGRD', dataStatus: '2026-04-02T10:00:00', obs: 'BL recebido — aguardando chegada do navio' },
    ]);
    this._pagamentos(emb6.id, despCosta.id, [
      { tipo: 'CobrancaSinal', prevista: '2026-04-08', pago: undefined, valor: 5000 },
    ]);

    // ─── CENÁRIO 7 — Previsto, ETA em 39 dias ───────────────────────────
    const cd7 = this._custo('CD-2026-007', despLog.id, impAuto.id, sha.id, stz.id, '20', 6800, 28500, 8000, 33000, 9400, 1.40, 185, '2026-04-01',
      [{ ncm: '8708.99.00', descricao: 'Módulos eletrônicos p/ suspensão (80 cx)', valor: 25000, data: '2026-04-01' }],
      [{ descricao: 'Honorário despachante', valor: 2000, data: '2026-04-01', entraBaseIcms: false },
       { descricao: 'AFRMM', valor: 1500, data: '2026-04-01', entraBaseIcms: true }],
      [{ ncmId: ncmAutopeca.id, numeroNcm: '87089900', descricao: 'Módulos eletrônicos automotivos', aliIi: 18, aliIpi: 5, aliPis: 2.10, aliCofins: 9.65, aliIcms: 12, baseCalculo: 33000 }]
    );
    const ov7 = this._orcamento('OV-2026-007', cliAuto.id, cd7.id, '20', 6800, 6500, 2900, 28500, 8000, 33000, 1.40, 3800, 16700, 3500, 0, '2026-04-01',
      [{ descricao: 'Capatazia Santos', valor: 1000 }, { descricao: 'Armazenagem', valor: 2500 }],
      []
    );
    const emb7 = this._embarque('EMB-2026-007', ov7.id, cd7.id, sha.id, stz.id, agCma.id, cliAuto.id, navioCma.id, despLog.id, expAuto.id,
      'IMP-2026-007', 'CMABR26007H/0001', 'CONT-007-SHA', 6800, '2026-04-05', '2026-05-10',
      'LI-2026-007', undefined, undefined, undefined, undefined, undefined, 'PREV',
      'Pedido planejado — navio sai em 04/04'
    );
    this._historico(emb7.id, emb7.statusEmbarqueId, [
      { codigo: 'PREV', dataStatus: '2026-04-01T09:00:00', obs: 'Processo aberto — aguardando confirmação embarque' },
    ]);
    this._pagamentos(emb7.id, despLog.id, [
      { tipo: 'CobrancaSinal', prevista: '2026-04-10', pago: undefined, valor: 4000 },
    ]);

    // ─── CENÁRIO 8 — 2 Orçamentos sem embarque (pipeline) ───────────────
    const cd8 = this._custo('CD-2026-008', despCosta.id, impTech.id, sha.id, stz.id, '40', 22000, 145000, 40800, 162000, 46400, 1.58, 340, '2026-04-01',
      [{ ncm: '8517.14.00', descricao: 'Smartphones premium linha Pro (1.500 un)', valor: 132000, data: '2026-04-01' }],
      [{ descricao: 'Honorário despachante', valor: 5200, data: '2026-04-01', entraBaseIcms: false },
       { descricao: 'AFRMM', valor: 4500, data: '2026-04-01', entraBaseIcms: true }],
      [{ ncmId: ncmSmartphone.id, numeroNcm: '85171400', descricao: 'Smartphones premium', aliIi: 20, aliIpi: 15, aliPis: 2.10, aliCofins: 9.65, aliIcms: 18, baseCalculo: 162000 }]
    );
    this._orcamento('OV-2026-008', cliTech.id, cd8.id, '40', 22000, 21000, 10200, 145000, 40800, 162000, 1.58, 18000, 120800, 9700, 0, '2026-04-01',
      [{ descricao: 'Capatazia Santos', valor: 2400 }, { descricao: 'Armazenagem porto', valor: 7300 }],
      []
    );

    const cd9 = this._custo('CD-2026-009', despLog.id, impTech.id, sha.id, stz.id, '40', 14800, 89000, 25000, 102000, 29200, 1.48, 265, '2026-04-01',
      [{ ncm: '8471.30.00', descricao: 'Tablets 10" linha Business (600 un)', valor: 78000, data: '2026-04-01' }],
      [{ descricao: 'Honorário despachante', valor: 3600, data: '2026-04-01', entraBaseIcms: false },
       { descricao: 'AFRMM',                valor: 2900, data: '2026-04-01', entraBaseIcms: true  }],
      [{ ncmId: ncmLaptop.id, numeroNcm: '84713000', descricao: 'Tablets portáteis', aliIi: 16, aliIpi: 10, aliPis: 2.10, aliCofins: 9.65, aliIcms: 18, baseCalculo: 102000 }]
    );
    this._orcamento('OV-2026-009', cliMega.id, cd9.id, '40', 14800, 14200, 6800, 89000, 25000, 102000, 1.48, 10500, 63600, 6500, 1800, '2026-04-01',
      [{ descricao: 'Capatazia Santos', valor: 1800 }, { descricao: 'Armazenagem', valor: 4700 }],
      [{ descricao: 'Frete rodoviário destino MegaMart', valor: 1800 }]
    );
    [cd8, cd9]; // linted
    // ── 15a. Modelos de Despesas ──────────────────────────────────────────────
    // Lê todas as despesas do catálogo (já populadas pelo initSeed do Shell)
    const allDesp = readV2<DespesaCadastro>(keysV2.despesasCadastro);

    const byDesc = (desc: string): string =>
      (allDesp.find(d => d.descricao === desc) ?? { id: '' }).id;

    const mod1 = this._add<ModeloDespesa>(keysV2.modelosDespesa, {
      nome: 'Desembaraço Padrão FCL',
      descricao: 'Modelo completo padrão para importações FCL',
      ativo: true,
    });
    [
      'Desconsolidação', 'Liberação de B/L', 'THC', 'ISPS',
      'LOG FEE / TRS / IMP. LOG. FEE / TELEX FEE / IOF', 'Lift Off',
      'Honorários Despachante', 'S.D.A.', 'Taxa de Expediente',
      'AFRMM + Taxa Sistema Mercante', 'TUS - Taxa de Utilização do Siscomex',
      'Armazenagem', 'Outras Despesas',
    ].forEach(desc => {
      const did = byDesc(desc);
      if (did) this._add<ModeloDespesaItem>(keysV2.modelosDespesaItens, { modeloDespesaId: mod1.id, despesaCadastroId: did });
    });

    const mod2 = this._add<ModeloDespesa>(keysV2.modelosDespesa, {
      nome: 'Agência + Despachante',
      descricao: 'Modelo parcial — agência marítima e honorários',
      ativo: true,
    });
    [
      'Desconsolidação', 'Liberação de B/L', 'THC', 'ISPS',
      'Honorários Despachante', 'Honorários Trading',
    ].forEach(desc => {
      const did = byDesc(desc);
      if (did) this._add<ModeloDespesaItem>(keysV2.modelosDespesaItens, { modeloDespesaId: mod2.id, despesaCadastroId: did });
    });

    const mod3 = this._add<ModeloDespesa>(keysV2.modelosDespesa, {
      nome: 'Simplificado (Agência Básica)',
      descricao: 'Apenas taxas portuárias essenciais',
      ativo: true,
    });
    ['Desconsolidação', 'Liberação de B/L', 'THC', 'Lift Off'].forEach(desc => {
      const did = byDesc(desc);
      if (did) this._add<ModeloDespesaItem>(keysV2.modelosDespesaItens, { modeloDespesaId: mod3.id, despesaCadastroId: did });
    });
    [mod1, mod2, mod3]; // linted
    // ── 15. Solicitações de Orçamento ───────────────────────────────────
    const sol1: SolicitacaoOrcamento = {
      id: generateV2Id(), codigoInterno: 'SOL-2026-001',
      portoOrigemId: sha.id, portoDestinoId: stz.id,
      importadorId: impTech.id, clienteId: cliTech.id,
      responsavel: 'Leandro Costa',
      tamContainer: '40', peso: 12500, observacao: 'Eletrônicos Q2 2026',
      status: 'Aprovada', data: '2026-02-08'
    };
    const sol2: SolicitacaoOrcamento = {
      id: generateV2Id(), codigoInterno: 'SOL-2026-002',
      portoOrigemId: ngb.id, portoDestinoId: png.id,
      importadorId: impTextil.id, clienteId: cliTextil.id,
      responsavel: 'Ana Lima',
      tamContainer: '40', peso: 9800, observacao: 'Têxteis coleção outono',
      status: 'EmAnalise', data: '2026-02-20'
    };
    writeV2(keysV2.solicitacoes, [sol1, sol2]);

    writeV2(keysV2.solicitacaoDespachantes, [
      { id: generateV2Id(), solicitacaoOrcamentoId: sol1.id, despachanteId: despCosta.id, status: 'FinalizadoDespachante', dataEnvio: '2026-02-08' },
      { id: generateV2Id(), solicitacaoOrcamentoId: sol1.id, despachanteId: despLog.id,   status: 'Respondido',          dataEnvio: '2026-02-08' },
      { id: generateV2Id(), solicitacaoOrcamentoId: sol2.id, despachanteId: despCosta.id, status: 'PendenteDespachante', dataEnvio: '2026-02-20' },
      { id: generateV2Id(), solicitacaoOrcamentoId: sol2.id, despachanteId: despLog.id,   status: 'Recusado',            dataEnvio: '2026-02-20' },
    ] as SolicitacaoOrcamentoDespachante[]);
    writeV2(keysV2.solicitacaoDocumentos, []);

    // Vincular custos às solicitações
    const custosStorage = readV2<CustoDespachante>(keysV2.custos);
    const cd1Ref = custosStorage.find(c => c.codigoInterno === 'CD-2026-001');
    const cd2Ref = custosStorage.find(c => c.codigoInterno === 'CD-2026-002');
    if (cd1Ref) cd1Ref.solicitacaoOrcamentoId = sol1.id;
    if (cd2Ref) cd2Ref.solicitacaoOrcamentoId = sol2.id;
    writeV2(keysV2.custos, custosStorage);

    // Junction OrcamentoVenda ↔ CustoDespachante
    const allOvs = readV2<OrcamentoVenda>(keysV2.orcamentosVenda);
    writeV2(keysV2.orcCustos, allOvs.map((ov): OrcamentoVendaCusto => ({
      id: generateV2Id(),
      orcamentoVendaId: ov.id,
      custoDespachanteId: ov.custoDespachanteId ?? ''
    })).filter(oc => oc.custoDespachanteId));

    // ── 16. Marcar flag ───────────────────────────────────────────
    localStorage.setItem(DEMO_FLAG, 'true');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS INTERNOS
  // ─────────────────────────────────────────────────────────────────────────

  /** Cria um porto (origem ou destino) e retorna o objeto com ID */
  private _porto<T extends { id: string; ativo: boolean }>(key: string, data: Omit<T, 'id' | 'ativo'>): T {
    const item = { id: generateV2Id(), ativo: true, ...data } as T;
    writeV2(key, [...readV2<T>(key), item]);
    return item;
  }

  /** Cria qualquer entidade base sem ID e retorna com ID gerado */
  private _add<T extends { id: string }>(key: string, data: Omit<T, 'id'>): T {
    const item = { id: generateV2Id(), ...data } as T;
    writeV2(key, [...readV2<T>(key), item]);
    return item;
  }

  /** Cria um ControleNavio */
  private _navio(nomeNavio: string, numeroViagem: string): ControleNavio {
    return this._add<ControleNavio>(keysV2.controleNavios, { nomeNavio, numeroViagem, ativo: true });
  }

  /** Cria um ControleNavioTrajeto */
  private _trajeto(controleNavioId: string, portoOrigemId: string, portoDestinoId: string, etd: string, eta: string, trajetoDescricao: string): void {
    this._add<ControleNavioTrajeto>(keysV2.navioTrajetos, { controleNavioId, portoOrigemId, portoDestinoId, etd, eta, trajetoDescricao });
  }

  /** Cria CustoDespachante + subentidades; retorna o custo */
  private _custo(
    codigoInterno: string,
    despachanteId: string, importadorId: string,
    portoOrigemId: string, portoDestinoId: string,
    tamContainer: '20' | '40' | 'LCL',
    peso: number, fobUsd: number, fobReais: number, cifUsd: number, cifReais: number,
    seguroUsd: number, taxaUsd: number,
    data: string,
    lis: Array<Omit<CustoDespachanteLi, 'id' | 'custoDespachanteId'>>,
    despesas: Array<Omit<CustoDespachanteDespesa, 'id' | 'custoDespachanteId'>>,
    ncmsVinculados: Array<Omit<NcmVinculadoOrcamento, 'id' | 'custoDespachanteId'>>,
    status: StatusCustoDespachante = 'Rascunho'
  ): CustoDespachante {
    // Os parâmetros fobUsd/cifUsd carregam valores em BRL (nomenclatura herdada)
    // Derivamos os valores em USD dividindo pelo câmbio demo de referência
    const TAXA_DEMO = 5.70;
    const custo: CustoDespachante = {
      id: generateV2Id(), codigoInterno, despachanteId, importadorId,
      portoOrigemId, portoDestinoId, responsavel: 'Leandro Costa',
      peso,
      fobReais: fobUsd,                             // param 'fobUsd' = valor BRL
      fobUsd:   Math.round(fobUsd / TAXA_DEMO),     // USD derivado
      cifReais: cifUsd,                             // param 'cifUsd' = valor BRL CIF
      cifUsd:   Math.round(cifUsd / TAXA_DEMO),     // USD derivado
      seguroUsd: Math.round(cifUsd * 0.003),        // 0,3% CIF como seguro
      taxaUsd:   TAXA_DEMO,                         // câmbio fixo demo
      tamContainer, data, status,
    };
    writeV2(keysV2.custos, [...readV2<CustoDespachante>(keysV2.custos), custo]);

    lis.forEach(li => this._add<CustoDespachanteLi>(keysV2.custosLi, { ...li, custoDespachanteId: custo.id }));
    despesas.forEach(d => this._add<CustoDespachanteDespesa>(keysV2.custosDespesas, { ...d, custoDespachanteId: custo.id }));

    ncmsVinculados.forEach(ncm => {
      const vinculado: NcmVinculadoOrcamento = { id: generateV2Id(), custoDespachanteId: custo.id, ...ncm };
      writeV2(keysV2.ncmsVinculados, [...readV2<NcmVinculadoOrcamento>(keysV2.ncmsVinculados), vinculado]);
      // Calcular impostos
      const base = vinculado.baseCalculo;
      const valorIi      = base * (vinculado.aliIi / 100);
      const valorIpi     = (base + valorIi) * (vinculado.aliIpi / 100);
      const valorPis     = base * (vinculado.aliPis / 100);
      const valorCofins  = base * (vinculado.aliCofins / 100);
      const valorIcms    = (base + valorIi + valorIpi) * (vinculado.aliIcms / 100);
      const vi: ValorImposto = {
        id: generateV2Id(), ncmVinculadoOrcamentoId: vinculado.id,
        aliIi: vinculado.aliIi, valorIi,
        aliIpi: vinculado.aliIpi, valorIpi,
        aliPis: vinculado.aliPis, valorPis,
        aliCofins: vinculado.aliCofins, valorCofins,
        aliIcms: vinculado.aliIcms, valorIcms,
        totalImpostos: valorIi + valorIpi + valorPis + valorCofins + valorIcms,
      };
      writeV2(keysV2.valoresImposto, [...readV2<ValorImposto>(keysV2.valoresImposto), vi]);
    });

    return custo;
  }

  /** Cria OrcamentoVenda + despesas + extras; retorna o orçamento */
  private _orcamento(
    codigoInterno: string,
    clienteId: string, custoDespachanteId: string,
    tamContainer: string, pesoBruto: number, pesoLiquido: number, freteInternacional: number,
    fobReais: number, fobUsd: number, cifReais: number, cifUsd: number,
    honorarios: number, totalImpostos: number, totalDespesas: number, totalExtras: number,
    data: string,
    despesas: Array<Omit<OrcamentoVendaDespesa, 'id' | 'orcamentoVendaId'>>,
    extras: Array<Omit<OrcamentoVendaDespesaExtra, 'id' | 'orcamentoVendaId'>>
  ): OrcamentoVenda {
    const TAXA_DEMO = 5.70;
    const ov: OrcamentoVenda = {
      id: generateV2Id(), codigoInterno,
      clienteId, custoDespachanteId, data,
      tamContainer, pesoBruto, pesoLiquido, freteInternacional,
      fobReais,
      fobUsd:  Math.round(fobReais / TAXA_DEMO),    // USD derivado do BRL FOB
      cifReais,
      cifUsd:  Math.round(cifReais / TAXA_DEMO),    // USD derivado do BRL CIF
      taxaUsd: TAXA_DEMO,                           // câmbio fixo demo
      honorarios, totalImpostos, totalDespesas, totalExtras,
      totalGeral: totalImpostos + totalDespesas + totalExtras + honorarios + freteInternacional,
    };
    writeV2(keysV2.orcamentosVenda, [...readV2<OrcamentoVenda>(keysV2.orcamentosVenda), ov]);
    despesas.forEach(d => this._add<OrcamentoVendaDespesa>(keysV2.orcDespesas, { ...d, orcamentoVendaId: ov.id }));
    extras.forEach(e  => this._add<OrcamentoVendaDespesaExtra>(keysV2.orcExtras, { ...e, orcamentoVendaId: ov.id }));
    return ov;
  }

  /**
   * Cria um EmbarqueAduana resolvendo statusId pelo código
   * Parâmetros opcionais passados como undefined quando não aplicável
   */
  private _embarque(
    codigoInterno: string,
    orcamentoVendaId: string, custoDespachanteId: string,
    portoOrigemId: string, portoDestinoId: string,
    agenteCargaId: string, clienteId: string,
    controleNavioId: string, despachanteId: string, exportadorId: string,
    imp: string, bl: string, container: string,
    kg: number, etd: string, eta: string,
    li: string,
    dataRegistro: string | undefined,
    avisoChegada: string | undefined,
    desemb: string | undefined,
    entrega: string | undefined,
    avisoPrevisao: string | undefined,
    statusCodigo: string,
    observacao: string
  ): EmbarqueAduana {
    const statusList = readV2<StatusEmbarque>(keysV2.statusEmbarque);
    const statusId = statusList.find(s => s.codigo === statusCodigo)?.id ?? statusList[0]?.id ?? '';

    const emb: EmbarqueAduana = {
      id: generateV2Id(), codigoInterno,
      refOminium: codigoInterno.replace('EMB-', 'OMN-'),
      portoOrigemId, portoDestinoId, agenteCargaId, clienteId,
      usuarioResponsavelId: 'demo-user',
      controleNavioId, despachanteId, exportadorId,
      statusEmbarqueId: statusId,
      custoDespachanteId, orcamentoVendaId,
      imp, bl, container, kg, etd, eta, li,
      ...(dataRegistro  ? { dataRegistro }  : {}),
      ...(avisoChegada  ? { avisoChegada }  : {}),
      ...(desemb        ? { desemb }        : {}),
      ...(entrega       ? { entrega }       : {}),
      ...(avisoPrevisao ? { avisoPrevisao } : {}),
      observacao,
    };
    writeV2(keysV2.embarques, [...readV2<EmbarqueAduana>(keysV2.embarques), emb]);
    return emb;
  }

  /** Cria histórico de status para um embarque */
  private _historico(
    embarqueAduanaId: string,
    statusAtualId: string,
    eventos: Array<{ codigo: string; dataStatus: string; obs?: string }>
  ): void {
    const statusList = readV2<StatusEmbarque>(keysV2.statusEmbarque);
    const statusByCode = new Map(statusList.map(s => [s.codigo, s]));
    [statusAtualId]; // linted

    eventos.forEach(ev => {
      const statusId = statusByCode.get(ev.codigo)?.id;
      if (!statusId) return;
      this._add<HistoricoStatusEmbarque>(keysV2.historicoStatus, {
        embarqueAduanaId,
        statusEmbarqueId: statusId,
        dataStatus: ev.dataStatus,
        observacao: ev.obs,
        usuarioId: 'demo-user',
      });
    });
  }

  /** Cria um FreeTime para um embarque */
  private _freeTime(embarqueAduanaId: string, quantidadeDias: number, dataInicio: string, dataFim: string): void {
    this._add<FreeTimeEmbarque>(keysV2.freeTimes, { embarqueAduanaId, quantidadeDias, dataInicio, dataFim });
  }

  /** Cria pagamentos para um embarque */
  private _pagamentos(
    embarqueAduanaId: string,
    despachanteId: string,
    pagamentos: Array<{ tipo: string; prevista: string; pago?: string; valor: number }>
  ): void {
    pagamentos.forEach(p => {
      this._add<PagamentoProcesso>(keysV2.pagamentos, {
        embarqueAduanaId,
        despachanteId,
        tipoPagamento: p.tipo as PagamentoProcesso['tipoPagamento'],
        dataPrevista: p.prevista,
        ...(p.pago ? { dataPagamento: p.pago } : {}),
        valor: p.valor,
      });
    });
  }
}
