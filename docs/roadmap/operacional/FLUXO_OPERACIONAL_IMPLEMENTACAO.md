# Fluxo Operacional — Requisitos, Regras e Plano de Implementação

Objetivo: documentar e formalizar o fluxo operacional entre Solicitação de Orçamento, Custos do Despachante e Orçamento de Venda; garantir regras de transição, integridade de dados, notificações, versionamento e UX; definir fases/atividades para implementação.

1) Tabela de status (visão aplicada)

- SolicitacaoOrcamento.Status (enum/string)
  - PendenteCustosDespachante (inicial) — gerado custo para todos despachantes vinculados
  - AguardandoDespachante(s) — há custos não finalizados
  - AguardandoOrcamentoVendas — todos custos finalizados; aguarda orcamento de venda
  - EmAndamentoOrcamentoVenda — orçamento em edição/andamento (um ou mais orçamentos existe)
  - AguardandoAprovacaoCliente — orcamento de venda finalizado e aguardando aprovacao do cliente
  - AprovadoCliente — aprovado pelo cliente → gera embarque (imóvel)
  - Cancelado — processo cancelado
  - AguardandoDespachanteReabertura — reabertura solicitada pelo orçamento (nova versão de custo)
  - EmbarqueGerado — etapa final; bloqueios de edição

- CustoDespachante.Status
  - Rascunho — salvo pelo despachante; solicitaçao continua AguardandoDespachante(s)
  - EmAndamento — alguém está trabalhando (controle de lock visual/filtragem)
  - Finalizado — despacho finalizado; contribui para transição da solicitacao
  - Reaberto — reaberto por solicitação do orcamento; nova versão criada

- OrcamentoVenda.Status
  - Rascunho — salvo (não finalizado)
  - EmAndamento — em edição ativa (mostra no ui)
  - Finalizado — pronto para aprovacao do cliente; permite transição da solicitacao
  - Reaberto — reaberto após finalizado (enquanto não aprovado pelo cliente)
  - AprovadoCliente — aprovado; gera embarque
  - Cancelado — cancelado pelo usuário do orçamento

2) Regras de transição e invariantes (business rules)

- Ao criar Solicitação: Status = PendenteCustosDespachante. Para cada despachante associado, criar registro CustoDespachante (inicialmente Rascunho).
- Enquanto existir pelo menos 1 CustoDespachante.Status != Finalizado, Solicitação permanece em AguardandoDespachante(s) / PendenteCustosDespachante.
- Quando todos CustoDespachante.Status == Finalizado → Solicitação passa para AguardandoOrcamentoVendas.
- OrcamentoVenda pode ser criado se existir pelo menos 1 CustoDespachante.Finalizado. OrcamentoVenda.EmAndamento/Finalizado não altera imediatamente a Solicitação até Finalizado.
- Ao Finalizar um OrcamentoVenda: Solicitação → AguardandoAprovacaoCliente. Só após aprovação manual do cliente (ação explícita) pode a Solicitação passar para AprovadoCliente e gerar EmbarqueGerado.
- Uma vez EmbarqueGerado, nenhum CustoDespachante ou OrcamentoVenda podem ser editados (DB + UI devem bloquear e API validar).
- Reabertura de CustoDespachante: OrcamentoVenda pode solicitar reabertura. Isso gera uma nova versão de CustoDespachante (copiar registro, linkar VersaoAnteriorId) e marca Solicitação como AguardandoDespachanteReabertura. Versões anteriores tornam-se imutáveis.
- OrcamentoVenda pode reabrir um orçamento já finalizado enquanto Solicitação não estiver AprovadoCliente. Após AprovadoCliente → sem reabertura.
- OrcamentoVenda pode, ao avaliar, cancelar (marcar Cancelado) custos específicos — para prosseguir com subset de custos. Orcamento não pode avançar a Finalizado se não existir pelo menos 1 CustoDespachante.Finalizado associado.

3) Correções e extensões no modelo de dados (DB)

- Adicionar/confirmar colunas:
  - SolicitacaoOrcamento.Status (string/enum) + índice
  - CustoDespachante.Status (string/enum) + índice
  - OrcamentoVenda.Status (string/enum) + índice
  - CustoDespachante.VersaoAnteriorId (já presente) — manter e garantir cascade SetNull
  - Registrar campo IsLocked/LockedBy/LockedAt opcional em CustoDespachante/OrcamentoVenda para indicar EmAndamento (visibilidade)
  - Histórico de eventos (AuditLog) opcional: table AppEvents { Id, Entidade, EntidadeId, Evento, Dados, UsuarioId, CriadoEm }

4) Validações e proteções na API

- Service-level validators que rejeitam transições inválidas com mensagens claras (400/422)
  - Ex.: tentar finalizar Solicitação quando existe CustoDespachante != Finalizado → 409 Conflict com payload explicando quais custos pendentes
- Endpoints para ações explícitas:
  - POST /api/solicitacoes/{id}/request-reopen (origem: OrcamentoVenda) → cria nova versão do custo e seta Solicitação status AguardandoDespachanteReabertura
  - POST /api/custos/{id}/set-status { status } — apenas status válidos e permissões
  - POST /api/orcamentos/{id}/finalize, /reopen, /approve-by-client, /cancel
- Regras de autorização: apenas usuários com roles adequadas (Despachante, Analista, Gerente) podem executar ações específicas; validar via JWT
- Ao gerar nova versão de CustoDespachante: clonar linhas (Lis, Despesas, Ncms) e setar VersaoAnteriorId; salvar versão com CriadoEm Novo, versão anterior imutável

5) UI / Frontend — mudanças e proteções

- Indicadores visuais de status na listagem de solicitações e no detalhe (badges coloridos)
- Botões e campos bloqueados conforme status (Ex.: quando EmbarqueGerado, botão Editar desabilitado)
- Exibir histórico de versões de custos (timeline) com opção "Abrir versão X" (visualizar somente ou criar novo rascunho)
- Fluxo de reabertura: formulário no OrcamentoVenda para "Solicitar reabertura do despachante" com razão e anexos; exibir confirmação
- Mostrar locks: se CustoDespachante.EmAndamento por um usuário, exibir "Em edição por X desde T" e impedir edição concorrente
- Mensagens de erro UX: mapear erros 409/422 para explanations inline; ex: "Não é possível finalizar solicitação. Custos pendentes: [Despachante A (rascunho), Despachante B (em andamento)]"

6) Notificações e eventos

- Emitir eventos e notificações (in-app + push) para responsáveis quando:
  - Todos os custos finalizados → notificar equipe de OrçamentoVenda (role: Analista/Gerente)
  - Um despachante finaliza seu custo → notificar autor da Solicitação e analistas
  - OrcamentoVenda finalizado → notificar cliente (via sistema) e despachantes envolvidos
  - Cliente aprova/ou cancela → notificar responsáveis e gerar embarque se aprovado
  - Reabertura solicitada → notificar despachante alvo
- Garantir persistência das notificações até interação do usuário (não autoclear)

7) Internacionalização e moeda

- Monetary: armazenar valores em tabela com campos: AmountDecimal (base), CurrencyCode (ISO 4217), DisplayCulture opcional
- Padrão interno: BRL (real) como moeda base, mas permitir conversão exibida para USD/CNY usando parâmetro TaxaDolar/TaxaCny atualizado em ParametroSistema
- API e DB: salvar valores numéricos (decimal) e a currency explicitamente — evitar conversões implícitas
- Frontend: permitir troca de moeda na exibição e persistir preferência do usuário
- Localização (i18n): suportar PT-BR, EN, ZH (arquivos de tradução; date/number formatting conforme culture)

8) Mensagens de erro e códigos (padronizar)

- 400 Bad Request — payload inválido (validators)
- 401 Unauthorized — JWT inválido/expirado
- 403 Forbidden — falta permissão
- 404 Not Found — recurso inexistente
- 409 Conflict — transição inválida / estado pré-requisito não cumprido (usar quando tentar avançar fluxo sem condições)
- 422 Unprocessable Entity — regra de negócio não satisfeita (mais detalhado)
- Resposta de erro padrão incluirá: { code, message, details?: [{ field?, message? }], tips?: string[] }

9) Fases e atividades (plano de implementação)

Fase 0 — Preparação
- Atividade 0.1: Revisar modelos atuais (AppDbContext + Entities) e identificar campos faltantes.
- Atividade 0.2: Definir enum de status e mapeamento DB.

Fase 1 — Schema & Migrations (DB)
- 1.1: Criar migrations para adicionar colunas Status nas tabelas relevantes e índice
- 1.2: Adicionar campos de Lock (LockedBy, LockedAt) e AuditLog table
- 1.3: Criar migration para garantir CustoDespachante.VersaoAnteriorId comportamento
- Critério: Migrations aplicam sem perda de dados local

Fase 2 — Services & Business Logic (API)
- 2.1: Implementar validações de transição nas Services (SolicitacoesService, CustoDespachanteService, OrcamentoVendaService)
- 2.2: Criar endpoints administrativos de status e ações (finalize, reopen, approve-by-client)
- 2.3: Implementar clonagem/versionamento ao solicitar reabertura
- 2.4: Implementar event emitters / NotificationService hooks
- Critério: Unit tests cobrindo transições críticas

Fase 3 — Frontend UX
- 3.1: Badges de status, botões condicionais, desabilitar edição após EmbarqueGerado
- 3.2: Tela de histórico de versões e visão de comparação
- 3.3: Formulário de solicitação de reabertura com justificativa
- 3.4: Indicadores de lock e experiência colaborativa
- Critério: Testes manuais dos fluxos principais

Fase 4 — Notificações e Integração
- 4.1: Integrar NotificationService (interno + PWA push)
- 4.2: Disparos para roles/users conforme regras
- 4.3: Persistência das notificações até confirmação
- Critério: Envio e recepção de notificações em ambiente de teste

Fase 5 — Internacionalização e Moeda
- 5.1: Garantir campos CurrencyCode em entidades financeiras
- 5.2: Implementar ParametroSistema para taxas e culturas
- 5.3: UI: seletores de moeda e linguagem
- Critério: Visualização correta de valores em BRL/USD/CNY e i18n funcionando

Fase 6 — Testes, QA e Deploy
- 6.1: Testes end-to-end cobrindo: criação solicitaçao → custos → orcamento → aprovaçao → embarque
- 6.2: Validar locks concorrentes e reabertura/versionamento
- 6.3: Documentar endpoints e incluir exemplos no README/Swagger
- Critério: Fluxo fechado com 0 blocking issues

10) Critérios de aceitação (exemplos)
- Não é possível finalizar Solicitação se existir CustoDespachante não finalizado (API retorna 409 + lista de custos pendentes).
- Ao finalizar último custo, Solicitação transita automaticamente para AguardandoOrcamentoVendas e notifica os analistas.
- Quando OrcamentoVenda.Finalizado, solicitação fica AguardandoAprovacaoCliente; aprovação manual por cliente gera EmbarqueGerado e bloqueia edições.
- Reabertura gera nova versão imutável da anterior; histórico visível no UI.

11) Observações operacionais
- Usar validators (FluentValidation) para regras de entrada e service-layer checks para regras de transição.
- Parâmetros de negócio (como regras de aprovação automática, prazos) em ParametroSistema.
- Antes de deploy, rodar migrações em staging e validar com seeds Phase3/4/5.

---

Arquivo gerado: FLUXO_OPERACIONAL_IMPLEMENTACAO.md — adicionar revisões conforme necessário.
