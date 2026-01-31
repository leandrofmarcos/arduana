Builder

0/3 done

Ler completo.md e sintetizar requisitos e fases

Mapear regras de negócio e fluxo de execução

Desenhar visão simples das telas principais

docs\completo.md

3/3 done

Ler completo.md e sintetizar requisitos e fases

Mapear regras de negócio e fluxo de execução

Desenhar visão simples das telas principais

Entendimento Geral

- Objetivo: controlar o ciclo completo da importação e nacionalização, com visibilidade, histórico imutável por fase, e quem deve agir em cada momento.
- Fases: Orçamento → Aduana/Embarque → Solicitação de Numerário → Fechamento.
- Fluxo chave: Cliente envia packlist → Despachante cria planilha de custo → OMINIUM cria planilha de venda → Cliente aprova → Sistema cria processo na planilha Aduana → acompanhamento 30 dias com atualizações → Solicitação de numerário (Despachante → OMINIUM → Cliente) → Fechamento com registro final.
- Regras: cada fase com data início/termino; histórico imutável; qualquer mudança relevante cria nova versão; comparar versões (orçamento vs oficial); alertas automáticos do período de 30 dias.
Telas Principais

- Tela Processos
  
  - Lista de processos com status por fase (Orçamento, Aduana, Numerário, Fechamento).
  - Ações: criar novo processo, abrir processo, filtrar por status/data/responsável, buscar por cliente/código.
  - Colunas: Código, Cliente, Fase Atual, Prazo 30 dias (contador), Última atualização, Responsável.
  - Botões rápidos: “Solicitar numerário”, “Fechamento”, “Ver histórico”.
- Tela Novo Processo
  
  - Upload Packlist (CSV/XLSX), dados gerais: Cliente, Incoterm, Porto, NCMs envolvidos, Moeda, Taxas iniciais.
  - Validações: formatação do packlist, itens obrigatórios, peso e valor.
  - Resultado: gera rascunho de “Planilha de Custo (Orçamento)”.
- Tela Orçamento
  
  - Planilha de custo do Despachante (versão orçamento) com itens do packlist, frete, seguro, taxas/aliquotas, despesas estimadas.
  - Planilha de venda (OMINIUM) derivada com margens e preço ao cliente.
  - Ações: salvar versão, emitir proposta ao cliente, registrar aprovação/reprovação e motivo.
  - Comparação: orçamento atual vs último, dif por colunas (valores, taxas).
  - Saída: histórico da fase (imutável quando aprovado).
- Tela Aduana (Embarque)
  
  - Acompanhamento oficial: câmbio do dia, atualizações de peso e taxas, despesas reais por categoria.
  - Prazo: indicador de 30 dias ativo com alertas; timeline de eventos (data, quem registrou, o quê).
  - Ações: atualizar custos reais, anexar documentos, marcar checkpoints.
  - Guarda: orçamento histórico preservado e não sobrescrito.
- Tela Solicitação de Numerário
  
  - Fluxo financeiro: Despachante solicita para OMINIUM; OMINIUM solicita ao Cliente.
  - Campos: valor solicitado, quem solicitou, data, observações; status da solicitação.
  - Ações: registrar solicitação, enviar ao cliente, marcar como pago/recebido; rastreabilidade completa.
  - Histórico: linha do tempo de cada solicitação por processo.
- Tela Fechamento
  
  - Consolidação: o que foi pago na fase de sinal; diferenças e ajustes; resultado final.
  - Ações: fechar processo, gerar resumo final, carimbar histórico completo.
  - Comparação: orçamento vs oficial vs fechado (indicadores e delta).
- Tela Histórico e Versões
  
  - Linha do tempo por processo com todas as fases e versões imutáveis.
  - Comparador de versões: selecionar duas versões e ver diferenças por seção (premissas, despesas, tributos).
  - Ações: exportar relatórios PDF e CSV.
- Tela Alertas
  
  - Painel de alertas: prazo 30 dias, solicitações pendentes, aprovações pendentes.
  - Filtros: por responsável, por cliente, por criticidade.
  - Ações: ir para processo, marcar alerta como tratado.
- Tela Configurações
  
  - Tabelas auxiliares: Portos, Alíquotas, Câmbio, Categorias de despesas.
  - Usuários e Perfis: Cliente, Despachante, OMINIUM, permissões por fase/ação.
Fluxo de Execução (simplificado)

- Processo nasce no Orçamento, aprovando incrementa fase para Aduana com timer de 30 dias e registros oficiais.
- Solicitação de numerário vive paralela à Aduana, com trilha auditável e estados.
- Fechamento gera a consolidação e bloqueia alterações (apenas histórico).
- Qualquer alteração relevante cria nova versão da planilha; comparações acessíveis por tela de Histórico/Versões.
Estratégia Incremental de Implementação

- Iteração 1: Processos (lista/criação) + Orçamento básico com versão e exportação PDF da planilha.
- Iteração 2: Aduana com timer 30 dias e atualizações de custos/taxas; histórico.
- Iteração 3: Solicitação de Numerário com estados e rastreio; integra com processos.
- Iteração 4: Fechamento, comparador de versões e relatórios finais.
- Iteração 5: Alertas e Configurações (portos/aliquotas/câmbio), refinamento de permissões.

Se quiser, já começo pela Iteração 1 criando a Tela Processos (lista + novo processo) e um esqueleto de Orçamento com versão imutável e exportação, seguindo o visual acima.