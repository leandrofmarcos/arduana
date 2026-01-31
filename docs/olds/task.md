Builder

Thought process

docs\versao-final.txt

Resumo do Fluxo

- Pipeline principal: Login → Dashboard → Orçamento → Aduana → Numerário → Fechamento → Histórico .
- Gate de fase por flags:
  - Orçamento aprovado libera Aduana ( aprovadoCliente = true ).
  - Aduana oficializada libera Numerário ( versaoOficial = true ).
  - Numerário pago libera Fechamento ( statusNumerario = "pago" ).
  - Fechamento conclui o processo ( status_final = "Concluído" , bloqueia edições).
- Versões por fase: cada etapa grava snapshot/versionamento e o Histórico é leitura agregada de todas.
- Auxiliares: Clientes/Despachantes como entidades referenciais; Relatórios/Exportações cruzam dados de todas as fases.
- Navegação controlada por statusProcesso , com rotas dedicadas por fase e breadcrumbs padronizados.
Camadas e Regras

- Identidade do processo: ProcessoId nasce no Orçamento e relaciona todas as fases.
- Orçamento: Novo Processo → Packlist → Planilha de Custo → Planilha de Venda → Aprovação .
- Aduana: cadastro de embarque e atualização oficial com comparação previsto x realizado; grava versão oficial.
- Numerário: solicitações com status e trilha; totaliza pendente e pago e integra ao dashboard financeiro.
- Fechamento: consolida financeiro e bloqueia edição; histórico exportável.
- Auxiliares: CRUD de clientes/despachantes e relatórios com filtros por fase, período, cliente e status.
Rotas Sugeridas

- \login , \dashboard
- \processo\novo , \processo\:id\packlist , \processo\:id\custo , \processo\:id\venda
- \processo\:id\aduana , \processo\:id\aduana\atualizar
- \processo\:id\numerario , \processo\:id\numerario\historico
- \processo\:id\fechamento , \processo\:id\historico
- \clientes , \relatorios
Estado e Design

- Store único de processo: mantém ProcessoId , statusProcesso , flags de fase e metadados.
- Cada fase atualiza o store e grava snapshot/version para histórico.
- Design system: inputs, tables, cards, modals, alerts e ações padronizadas; breadcrumbs e pipeline progress.
Plano de Desenvolvimento

- Fase 1: Autenticação e Dashboard
  
  - Implementar Login com sessão/JWT, perfis e guarda de rotas.
  - Dashboard com KPIs, lista de processos, pipeline por fase e navegação contextual.
  - Integrar store global ( processoStore ) e indicadores agregados.
- Fase 2: Orçamento Completo
  
  - Novo Processo com criação de ProcessoId e estado Orçamento .
  - Packlist com tabela editável, importação CSV e validações.
  - Planilha de Custo : estimativas e cálculo total_custo .
  - Planilha de Venda : margem, honorários, valor_final ; ação “Enviar para Aprovação”.
  - Gate: ao aprovar, setar aprovadoCliente = true e liberar Aduana .
  - Versionamento: snapshot por subetapa, contagem de versões e histórico legível.
- Fase 3: Aduana
  
  - Cadastro Aduana : datas e prazos, alerta > 30 dias.
  - Atualização de Custos : câmbio/peso/taxas oficiais, comparação com orçamento e “Salvar Versão Oficial” (lock).
  - Gate: versaoOficial = true libera Numerário .
  - Versionamento: grava versão oficial e bloqueia anterior.
- Fase 4: Numerário
  
  - Solicitação : criar numerarioId , status inicial solicitado , trilha de eventos.
  - Acompanhamento : tabela com histórico, badges, ações Enviado/Pago/Recebido , total pendente/pago.
  - Gate: todos pagos liberam Fechamento .
  - Integração financeira: consolidar provisão e gap com desembaraço.
- Fase 5: Fechamento
  
  - Consolidação final: comparativos previsto × realizado, lucro/prejuízo.
  - Ação “Concluir Processo”: statusProcesso = "Fechado" e bloqueio geral.
  - Histórico : linha do tempo, versões por fase e exportação CSV.
- Fase 6: Auxiliares e Relatórios
  
  - Clientes/Despachantes : CRUD com regras de integridade referencial.
  - Relatórios : filtros por fase/período/cliente/status; exportação CSV/Excel; gráficos no dashboard secundário.
Entrega Incremental e Qualidade

- Sprintização por grupos (1→6), liberando valor utilizável ao final de cada sprint.
- Em cada sprint:
  - Implementar UI com design system, estado e rotas.
  - Gravar versões/snapshots e validar navegação por flags.
  - Testes: unitários para cálculos e guards; e2e mínimos para fluxo por fase.
  - Lint/typecheck e revisão de acessibilidade/UX dos componentes.
Riscos e Mitigações

- Inconsistência de flags entre fases: centralizar transições numa “status machine” única e testar caminhos de avanço/retorno.
- Versionamento: padronizar chaveamento e metadados das versões por fase para evitar divergências.
- Desempenho de listas e histórico: paginação e filtros; evitar renderizações pesadas.
Próximos Passos

- Confirmar comandos de qualidade do projeto (lint/typecheck/build) para automatizar após commits.
- Consolidar store de processo com transições de estado e escrever testes das condições de gate.
- Fechar padronização das tabelas e ações com design system em todas as fases (já iniciamos no Numerário).
- Iniciar a nova branch feature/fluxo-completo com o foco do Sprint 1: Login + Dashboard + navegação por fase com pipeline visual.

