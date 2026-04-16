# Tela de Acompanhamento de Embarques

> Documento de especificação, fases e tarefas para implementação.
> Referência visual: `tela-embarque.png` (mesma pasta)

---

## 1. Visão Geral

A tela de **Acompanhamento** é uma visão consolidada e em tempo real de todos os embarques ativos, agregando dados de quatro entidades:

| Entidade | Chave | Dados contribuídos |
|---|---|---|
| `EmbarqueAduana` | `id` | Ref. Ominium, BL, Container, KG, ETD, ETA, Aviso Previsão, Aviso Chegada, IMP, LI, Registro, Data Registro, Desembaraço, Entrega, Responsável |
| `CustoDespachante` | `custoDespachanteId` | FOB USD, CIF USD, Taxa USD, Cobrança Sinal, Sinal Pago |
| `OrcamentoVenda` | `orcamentoVendaId` | Comercial (clienteId do OV), Total Geral, Honorários, P. Qualidade |
| `SolicitacaoOrcamento` | `solicitacaoOrcamentoId` | Código interno, Status macro do processo |
| `ControleNavio` | `controleNavioId` | Nome Navio |
| Cadastros | FK | Porto Origem, Porto Destino, Agente de Carga, Despachante, Exportador, Cliente |
| `FreeTimeEmbarque` | `embarqueAduanaId` | Dias restantes do free time |
| `PagamentoProcesso` | `embarqueAduanaId` | Status financeiro (sinal cobrado, pago, fechamento) |

---

## 2. Estrutura de Seções (Painéis)

A tela é dividida em **3 painéis horizontais empilhados**, cada um exibindo embarques no intervalo de status correspondente:

### 2.1 Painel AGUARDANDO
**Critério:** `StatusEmbarqueNome` ∈ `['Previsto', 'Aguardando']`  
Embarques cujo navio ainda não atracou.

### 2.2 Painel ATRACADOS
**Critério:** `StatusEmbarqueNome` = `'Atracado'`  
O navio chegou ao porto, despacho em andamento.

### 2.3 Painel REGISTRADOS
**Critério:** `StatusEmbarqueNome` ∈ `['Registrado', 'Desembaraçado', 'Entregue', 'Finalizado']`  
Processo em fase de registro aduaneiro até entrega.

---

## 3. Colunas por Painel

As colunas são derivadas da imagem de referência e mapeadas para as entidades do sistema.

### 3.1 Colunas comuns (todos os painéis)

| # | Label tela | Campo / Origem | Observações |
|---|---|---|---|
| 1 | REF OMINIUM | `EmbarqueAduana.refOminium` | Código de referência |
| 2 | PORTO ORIGEM | `PortoOrigem.nome` via `portoOrigemId` | |
| 3 | PORTO DESTINO | `PortoDestino.nome` via `portoDestinoId` | |
| 4 | AGENTE | `AgenteCarga.nome` via `agenteCargaId` | |
| 5 | CLIENTE | `Cliente.razaoSocial` via `clienteId` | |
| 6 | COMERCIAL | `OrcamentoVenda.clienteId` → nome | Campo "comercial" = responsável pelo OV |
| 7 | ETD | `EmbarqueAduana.etd` | Formato dd/MM/yyyy |
| 8 | ETA | `EmbarqueAduana.eta` | Formato dd/MM/yyyy |
| 9 | AVISO PREVISÃO | `EmbarqueAduana.avisoPrevisao` | dd/MM/yyyy, opcional |
| 10 | COBRANÇA SINAL | `PagamentoProcesso` tipo `CobrancaSinal` → `dataPrevista` | Destaque cor se vencido |
| 11 | SINAL PAGO | `PagamentoProcesso` tipo `SinalPago` → `dataPagamento` | Verde se pago |
| 12 | P. QUAL. DESPACHANTE | `PagamentoProcesso` tipo `Honorario` → `dataPrevista` | Prazo qualificação |
| 13 | FECHAMENTO O PAGO | `PagamentoProcesso` tipo `FechamentoPago` → `dataPagamento` | Verde se pago |
| 14 | AVISO CHEGADA | `EmbarqueAduana.avisoChegada` | dd/MM/yyyy, opcional |
| 15 | IMP | `EmbarqueAduana.imp` | |
| 16 | BL | `EmbarqueAduana.bl` | |
| 17 | CTNR | `EmbarqueAduana.container` | |
| 18 | KG | `EmbarqueAduana.kg` | Formato numérico 3 decimais |
| 19 | NAVIO | `ControleNavio.nomeNavio` via `controleNavioId` | |
| 20 | STATUS | `StatusEmbarque.nome` via `statusEmbarqueId` | Badge colorido |
| 21 | DESPACHANTE | `Despachante.nome` via `despachanteId` | |

### 3.2 Colunas adicionais no painel ATRACADOS

| # | Label | Campo / Origem |
|---|---|---|
| A1 | PACKLIST | `SolicitacaoOrcamento.codigoInterno` via `solicitacaoOrcamentoId` | Link/badge |

### 3.3 Colunas adicionais nos painéis ATRACADOS + REGISTRADOS

| # | Label | Campo / Origem |
|---|---|---|
| B1 | LI | `EmbarqueAduana.li` |
| B2 | REGISTRO | `EmbarqueAduana.registro` |
| B3 | DATA REGISTRO | `EmbarqueAduana.dataRegistro` | dd/MM/yyyy |
| B4 | DESEMB | `EmbarqueAduana.desemb` | dd/MM/yyyy |
| B5 | ENTREGA | `EmbarqueAduana.entrega` | dd/MM/yyyy |
| B6 | FREE TIME | `FreeTimeEmbarque` → dias restantes | Badge verde/vermelho |
| B7 | EXPORTADOR | `Exportador.nome` via `exportadorId` | |
| B8 | Ref Ag | `EmbarqueAduana.refAg` | |

---

## 4. Regras de Coloração das Células

Baseado no padrão visual da planilha de referência:

| Condição | Cor |
|---|---|
| ETA no passado e status < Atracado | Linha fundo `#fef9c3` (amarelo claro) — atraso |
| ETA no passado e status < Registrado (> 7 dias) | Fundo `#fee2e2` (vermelho claro) — crítico |
| ETA futura (> 7 dias) | Normal |
| Pagamento com `dataPrevista` vencida e não pago | Célula fundo `#fca5a5` (vermelho) |
| Pagamento pago | Célula texto `#16a34a` (verde) |
| Free Time ≤ 3 dias restantes | Badge `#dc2626` (vermelho) |
| Free Time > 3 dias restantes | Badge `#16a34a` (verde) |
| Status = Atracado | Badge `#f59e0b` (amber) |
| Status = Registrado | Badge `#8b5cf6` (purple) |
| Status = Desembaraçado | Badge `#3b82f6` (blue) |
| Status = Entregue / Finalizado | Badge `#22c55e` (green) |

---

## 5. Filtros e Busca

A tela terá uma barra de filtros no topo antes dos painéis:

| Filtro | Tipo | Campo |
|---|---|---|
| Busca geral | Text input | Ref Ominium, BL, Container, Cliente |
| Cliente | Select | `clienteId` |
| Despachante | Select | `despachanteId` |
| Porto Destino | Select | `portoDestinoId` |
| Mês/Ano ETA | Month input | `eta` (YYYY-MM) |
| Mostrar Finalizados | Toggle/checkbox | Inclui status Finalizado no painel Registrados |

---

## 6. Navegação

- Acessada a partir da tela **Embarques Aduana** via botão **🗂️ Acompanhamento** (ao lado do botão desabilitado).
- Botão **← Voltar** retorna à listagem de embarques.
- Clicar em uma linha abre o **detalhe do embarque** (modo `detail` existente no componente).
- Seções podem ser **colapsadas/expandidas** individualmente via clique no header.

---

## 7. Arquivo / Componente

| Item | Valor |
|---|---|
| Pasta | `src/app/v2/features/embarque-aduana/pages/` |
| Arquivo | `embarque-acompanhamento.component.ts` |
| Seletor | `app-embarque-acompanhamento` |
| Navegação | Output event `@Output() fechar = new EventEmitter()` → pai troca `mode` |

O componente receberá como `@Input()` os dados já carregados pelo componente pai (`EmbarqueAduanaComponent`) e fará os joins em memória.

---

## 8. Fases e Tarefas

### 🟠 FASE 1 — Documento e Especificação
> **Status: ✅ CONCLUÍDA**

- [x] Analisar imagem `tela-embarque.png`
- [x] Mapear colunas para entidades do sistema
- [x] Definir regras de coloração
- [x] Definir filtros
- [x] Definir estrutura do componente
- [x] Criar este documento

---

### 🔵 FASE 2 — Componente de Acompanhamento
> **Status: ⬜ PENDENTE**

- [ ] **T2.1** Criar `embarque-acompanhamento.component.ts` como componente standalone
- [ ] **T2.2** Implementar interface de linha agregada `AcompanhamentoRow` com todos os campos derivados
- [ ] **T2.3** Implementar método `buildRows()` que faz o join dos dados de EmbarqueAduana + CustoDespachante + OrcamentoVenda + SolicitacaoOrcamento + Cadastros
- [ ] **T2.4** Implementar getter `aguardando`, `atracados`, `registrados` filtrando os rows por grupo de status
- [ ] **T2.5** Implementar barra de filtros (busca geral, cliente, despachante, porto destino, mês ETA)
- [ ] **T2.6** Implementar template HTML: 3 painéis colapsáveis com tabelas
- [ ] **T2.7** Implementar coloração condicional das linhas/células via `[ngStyle]` ou classes dinâmicas
- [ ] **T2.8** Implementar lógica de free time (dias restantes por embarque)
- [ ] **T2.9** Implementar lógica de pagamentos (cobrança sinal, sinal pago, fechamento pago)
- [ ] **T2.10** Implementar click em linha → emite evento para pai abrir `detail`
- [ ] **T2.11** Estilização CSS responsiva (scroll horizontal nas tabelas densas)

---

### 🟢 FASE 3 — Integração na Tela de Embarques
> **Status: ⬜ PENDENTE**

- [ ] **T3.1** Adicionar novo `mode = 'acompanhamento'` ao tipo `Mode` em `embarque-aduana.component.ts`
- [ ] **T3.2** Adicionar botão **🗂️ Acompanhamento** ao lado do botão "Novo Embarque" no header
- [ ] **T3.3** Importar `EmbarqueAcompanhamentoComponent` no imports do `EmbarqueAduanaComponent`
- [ ] **T3.4** Adicionar `<ng-container *ngIf="mode === 'acompanhamento'">` com o componente filho passando os serviços necessários
- [ ] **T3.5** Tratar evento `fechar` do filho para voltar ao `mode = 'list'`
- [ ] **T3.6** Tratar evento `abrirDetalhe` do filho para abrir o `detail` de um embarque

---

### 🟣 FASE 4 — Refinamentos e Testes
> **Status: ⬜ PENDENTE**

- [ ] **T4.1** Validar coloração das células vs dados reais em localStorage
- [ ] **T4.2** Validar contagem de dias free time
- [ ] **T4.3** Validar joins quando campos opcionais estão ausentes (`custoDespachanteId`, `orcamentoVendaId`, `solicitacaoOrcamentoId` = undefined)
- [ ] **T4.4** Verificar performance com > 100 embarques (filtragem em memória deve ser suficiente para o protótipo)
- [ ] **T4.5** Ajustes visuais finais (larguras de coluna, truncamento de texto longo, responsividade mobile)

---

## 9. Interface de Dados (TypeScript)

```typescript
// Interface interna do componente de acompanhamento
export interface AcompanhamentoRow {
  // Identidade
  embarqueId:         string;
  codigoInterno:      string;
  refOminium:         string;

  // Localização
  portoOrigem:        string;
  portoDestino:       string;
  agente:             string;
  cliente:            string;
  comercial:          string;   // usuarioResponsavelId ou cliente do OV

  // Datas chave
  etd:                string;
  eta:                string;
  avisoPrevisao:      string;
  avisoChegada:       string;

  // Documentos
  imp:                string;
  packlist:           string;   // codigoInterno da SolicitacaoOrcamento
  bl:                 string;
  container:          string;
  li:                 string;
  registro:           string;
  dataRegistro:       string;
  desemb:             string;
  entrega:            string;
  refAg:              string;
  kg:                 number;

  // Operacional
  navio:              string;
  statusId:           string;
  statusNome:         string;
  despachante:        string;
  exportador:         string;

  // Financeiro (de PagamentoProcesso)
  cobrancaSinal:      string;   // dataPrevista de CobrancaSinal
  sinalPago:          string;   // dataPagamento de SinalPago
  pQualDespachanteData: string; // dataPrevista de Honorario
  fechamentoPago:     string;   // dataPagamento de FechamentoPago
  cobrancaSinalVencida:  boolean;
  sinalPagoEfetivado:    boolean;
  fechamentoPagoEfetivado: boolean;

  // Free Time
  freeTimeDiasRestantes: number | null;
  freeTimeAlerta:        boolean;   // ≤ 3 dias

  // Flags de coloração da linha
  etaAtrasada:        boolean;
  etaCritica:         boolean;   // > 7 dias de atraso
}
```

---

## 10. Mapeamento de Status → Painel

| StatusEmbarqueNome | Painel |
|---|---|
| Previsto | AGUARDANDO |
| Aguardando | AGUARDANDO |
| Atracado | ATRACADOS |
| Registrado | REGISTRADOS |
| Desembaraçado | REGISTRADOS |
| Entregue | REGISTRADOS |
| Finalizado | REGISTRADOS (visível apenas com toggle "Mostrar Finalizados") |
