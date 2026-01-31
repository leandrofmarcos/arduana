Builder

Thought process

import-costs\src\app\layout\shell.component.ts

shell.component.ts
import-costs\src\app\layout\shell.component.ts

+ 6 - 1

Open Diff

Menu Atualizado

- Adicionei acesso direto à criação no menu lateral com o botão “Novo Processo”.
- Incluí também o item “Processos” (rota alias) para a lista.
Onde está

- Menu: src/app/layout/shell.component.ts:31–36 adiciona Processos e Novo Processo .
- Ação de criação: método novaProcesso() em shell.component.ts:90–95 chama PlanilhasService.nova(...) .
- Estilo do botão: shell.component.ts:64–67 ( .menu .create ) seguindo o design system.
Como usar

- Abra http://localhost:4200/ .
- No menu lateral:
  - Clique em Processos para a lista.
  - Clique em Novo Processo para criar e abrir imediatamente o editor em /importacao .
Se quiser, troco o rótulo para “Nova Planilha” ou ajusto o ícone para combinar com o padrão visual.

leandro marcos

Agora revise a aplicaçao na documentação completo.md e assegure que o processo esteja correto, com as regras de negocio e camos

Builder

Thought process

6/9 done

Criar módulo Tela Processos (lista + novo)

Implementar ProcessosService e repositório fake

Esqueleto de Orçamento imutável com exportar

Rodar build e validar UI básica

Iniciar servidor para validação da aplicação

Integrar rotas e tokens de repositório

Revisar completo.md e mapear regras para o código

Identificar lacunas e propor plano incremental

Validar fluxo atual e apontar ajustes imediatos

Visão Geral

- Fases e atores da documentação estão alinhados: Orçamento → Aduana → Solicitação de Numerário → Fechamento, com Cliente, Despachante, OMINIUM e Sistema.
- Implementação atual cobre Iteração 1: Processos (lista/criação) e Orçamento com versão imutável e exportação PDF A4.
Estado Atual (mapeado no código)

- Processos
  - Lista e criação usando catálogo local fake: src/app/features/planilhas/planilhas.component.ts:12–93
  - Rotas listas/alias: src/app/app.routes.ts:19–33
  - Acesso no menu: src/app/layout/shell.component.ts:31–36 e botão “Novo Processo” shell.component.ts:35–36, 90–95
  - Repositório catálogo (lista/novo/duplicar/excluir): src/app/data/localstorage/planilha.catalog.repository.local.ts:32–100
  - Service de navegação: src/app/features/planilhas/planilhas.service.ts:10–35
- Orçamento (Planilha)
  - Editor com cálculo e exportação A4: src/app/features/planilha/planilha.component.ts:254–279 , exportação: planilha.component.ts:433
  - Versão imutável: aprovar bloqueia edição; nova versão destrava: planilha.component.ts:273–277 e handlers planilha.component.ts:433–439
  - Persistência de snapshot no catálogo ao aprovar/fechar: src/app/features/planilha/planilha.service.ts:24–39, 33–39 , e novos métodos aprovarOrcamento / novaVersao : planilha.service.ts:33–46
  - Repositório fake editor (LocalStorage): src/app/data/localstorage/planilha.repository.local.ts:23–76
- Design system/arquitetura
  - Standalone components, InjectionToken s para repositórios: src/app/core/repository.tokens.ts:7–10
  - Padrão de serviços + repositórios fake mantendo contrato da futura BFF.
Regras de Negócio vs Implementação

- Histórico imutável por fase
  - Implementado parcialmente: aprovar orçamento bloqueia edição da versão corrente e grava no catálogo ( planilha.service.ts:33–39 ).
  - Gap: não há trilha de versões por processo (apenas snapshot atual). Falta “lista de versões” ligada ao processo e o comparador de versões.
- Datas de início/término por fase
  - Gap: PlanilhaListItem não inclui per-fase datas; hoje há apenas dataSimulacao única.
- Alteração relevante gera nova versão
  - Parcial: ação “Nova Versão” destrava edição e permite alterar; Gap: não há versionamento explícito com índice de versões e dif entre versões.
- Comparar versões (orçamento vs oficial)
  - Gap: não há tela de comparação ainda.
- Prazo 30 dias do embarque com alerta automático
  - Gap: ainda não implementado (Aduana não tem timer/alertas).
- Fluxo de Numerário
  - Gap: tela e repositório da solicitação não implementados; estados e trilha auditável pendentes.
- Fechamento com consolidação e bloqueio
  - Parcial: método finalizarImportacao() grava snapshot e bloqueia ( planilha.service.ts:33–39 ).
  - Gap: faltam campos de consolidação (diferenças, pagamentos de sinal, ajustes) e tela de Fechamento.
Campos Necessários por Fase

- Orçamento
  - Packlist associado, produto/cliente/processo/origem, premissas (FOB, frete, seguro, THC, taxa), alíquotas (II, IPI, ICMS, PIS, COFINS), despesas estimadas por categoria, preço de venda (OMINIUM), status de aprovação.
  - Implementado no editor: premissas, alíquotas, despesas, exportação; falta vincular packlist e criar “planilha de venda” derivada.
- Aduana
  - Datas de início/término, câmbio diário, atualizações de peso/taxa, despesas reais por categoria, timer 30 dias, anexos.
  - Gap: campos e tela.
- Solicitação de Numerário
  - Valor, quem solicitou, data, status (solicitado, enviado ao cliente, pago/recebido), observações, trilha de eventos.
  - Gap: tela, repositório e estados.
- Fechamento
  - Valores pagos, diferenças vs orçamento/oficial, ajustes, data de fechamento, status final, relatório consolidado.
  - Gap: tela e modelo de dados.
Ajustes Imediatos Recomendados

- Modelo de catálogo com versionamento básico
  - Adicionar versions: { idVersao, fase, createdAt }[] ao item de processo e gravar snapshot por versão.
  - Alterar finalizarImportacao() e aprovarOrcamento() para adicionar entrada em versions além de atualizar status .
- Timestamps de fase
  - Adicionar faseAtual: 'Orcamento'|'Aduana'|'Numerario'|'Fechamento' e faseDates: { [fase]: { start: string; end?: string } } .
  - Ao aprovar, fechar a fase Orçamento (set end ) e abrir Aduana (set start ) com início do timer.
- Comparação de versões
  - Estruturar rota /historico com seleção de duas versões e dif por seções (premissas, despesas, tributos).
Plano Incremental

- Iteração 2
  - Aduana: tela com timer 30 dias, atualização de custos reais, anexos simples.
  - Versões: lista de versões por processo e gravação por fase.
  - Campos: faseAtual , faseDates .
- Iteração 3
  - Numerário: tela e serviço com estados e trilha; ações integradas ao processo.
  - Alertas: painel com prazos e pendências.
- Iteração 4
  - Fechamento: tela de consolidação, bloqueio final, relatório PDF.
  - Comparador: dif entre versões (orçamento vs oficial).
- Iteração 5
  - Planilha de venda (OMINIUM), permissões por perfil e anexos.
Validação sugerida

- Criar “Novo Processo” e testar:
  - Aprovar Orçamento → bloqueia edição e mantém exportação (planilha.component.ts:273–277).
  - “Nova Versão” → reabre edição e permite novo snapshot.
  - Exportar → PDF A4 com layout revisado (planilha.component.ts:433).
- Verificar lista e navegação:
  - Abrir/duplicar/excluir na lista Planilhas/Processos (planilhas.component.ts:78–83).
  - Botão de criação no menu (shell.component.ts:35–36, 90–95). 



Um processo deve nascer da planilha importada e aí seguir com orçamento e etc....
Criar uma tela de Upload da planilha padronizada






Builder

Visão do Processo

- Processo único percorre fases sequenciais: Orçamento → Aprovar → Numerário → Fechamento → Venda.
- Cada fase consolida uma “versão” do processo e define quem pode alimentar o fluxo.
- Aprovar bloqueia edição do orçamento, inicia Aduana e abre a janela de Numerário com SLAs.
- Fechamento registra versão final (somente histórico), Venda atua depois com parâmetros comerciais.
Perfis e Responsabilidades

- Cliente
  - Consulta o Orçamento aprovado e alimenta a fase Venda (preços, condições comerciais).
  - Pode anexar documentos quando permitido e acompanhar status.
- Agente Marítimo
  - Alimenta custos “Agência Marítima” (frete, BL, THC, etc.) dentro de Despesas no Desembaraço .
  - Fornece dados de premissas/logística quando aplicável (porto, incoterm, prazos).
- Despachante
  - Conduz Aduana e Numerário : solicita provisões, acompanha execução e atualiza status.
  - Alimenta Despesas de categorias “Despachante” e “Tributos”.
  - Executa Fechamento consolidando versão final do processo.
Fases e Transições

- Orçamento
  - Premissas e Alíquotas com template padrão; cabeçalho obrigatório.
  - “Salvar” cria/atualiza versão; “Aprovar Orçamento” só aparece após salvar (ter ID).
  - Ao aprovar: bloqueia edição e avança para Aduana.
  - Referência: import-costs/src/app/features/planilha/planilha.component.ts:280 , 449 ; import-costs/src/app/features/planilha/planilha.service.ts:41 .
- Aduana
  - Janela operacional de 30 dias, com contagem no cabeçalho do processo.
  - Despachante alimenta despesas e documentos; Agente Marítimo insere custos portuários.
  - Referência da badge de fase: import-costs/src/app/features/planilha/planilha.component.ts:458 .
- Numerário
  - Despachante cria lançamentos de numerário e evolui status: Solicitado → Enviado → Pago → Recebido.
  - Referências de CRUD/Status: import-costs/src/app/features/numerario/numerario.component.ts:70 , 72 .
  - Alinha com o cenário do doc: c:\dev\prototipos-html\docs\cenarios.md:87 .
- Fechamento
  - Consolida versão final, bloqueia alterações e grava histórico; define faseAtual como Fechamento.
  - Referência: import-costs/src/app/features/planilha/planilha.service.ts:33 .
- Venda
  - Cliente e Admin definem condições comerciais (preços com/sem IPI, etc.) com base na versão final.
  - Referências: import-costs/src/app/features/venda/venda.component.ts (estrutura de UI e integrações).
Numerário e Vínculo com Despesas

- Objetivo
  - Garantir que as despesas previstas/executadas na Aduana tenham cobertura financeira via Numerário.
  - Permitir rastrear “provisão” (numerário) versus “execução” (despesa) e seu status.
- Modelo conceitual
  - Lançamento de Numerário: valor, moeda, responsável, status, observação.
    - Referência: import-costs/src/app/domain/numerario.models.ts .
  - Despesa: categoria, item, fornecedor, valor, observação.
    - Referência: import-costs/src/app/domain/planilha.models.ts:20 .
  - Vínculo proposto: adicionar um ponteiro opcional na Despesa para um lançamento de Numerário (ex.: numerarioId ) e calcular “cobertura”.
- Fluxo prático
  - Despachante cria numerário para “Tributos”, “Porto” ou “Despachante”.
  - Ao receber numerário (status “Recebido”), vincula despesas correspondentes:
    - UI: ação “Vincular numerário” em cada linha de despesa dentro de Despesas no Desembaraço .
    - Indicadores:
      - Por linha: badge com o status e valor coberto.
      - Por categoria: total coberto vs total de despesas.
      - No painel lateral: “Solicitado/Enviado/Pago/Recebido” vs “Despesas vinculadas”.
- Regras de validação sugeridas
  - Não permitir marcar uma despesa como “paga” sem numerário “Recebido” vinculado.
  - Alertar para numerário insuficiente (cobertura < total de despesas vinculadas).
  - Permitir múltiplas despesas por numerário e múltiplos numerários por categoria; 1:1 ou 1:N conforme o caso.
Permissões

- Numerário/Fechamento: admin , despachante .
- Venda: admin , cliente .
- Anexos: admin , despachante , cliente .
- As rotas e guards já refletem isso no app:
  - Referência: import-costs/src/app/app.routes.ts .
Métricas e Indicadores

- SLAs
  - Aduana: 30 dias contados do início da fase.
- Finanças
  - Painel consolidado mostra Tributos, Despesas e Desembolso Total:
    - Referências: import-costs/src/app/features/planilha/planilha.component.ts:262-268 , 263-266 .
  - Cobertura de Numerário: solicitado vs recebido vs vinculado vs saldo, por categoria e total.
Por que esse vínculo é importante

- Evita “estouro” financeiro em despesas não cobertas.
- Dá visibilidade operacional para o cliente e governança para o despachante/admin.
- Acelera o Fechamento porque já existe conciliação entre provisão (numerário) e execução (despesas).
Se quiser avançar

- Posso implementar:
  - Campo numerarioId opcional em Despesa .
  - UI de “Vincular numerário” na lista de despesas.
  - Painel de conciliação com totais e status.
  - Regras de validação (pagamento condicionado ao status “Recebido”).
- Isso mantém o core atual intacto e evolui a governança financeira dentro do fluxo existente.