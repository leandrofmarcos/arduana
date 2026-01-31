# Cenários de Execução

## Caminho Padrão
- Login com perfil adequado
- Criar processo pelo menu “Processo → Novo Processo”
- Editar Orçamento em “Processo → Orçamento (Editor)”
- Aprovar Orçamento para iniciar Aduana
- Solicitar Numerário conforme necessidade
- Fechamento ao final com consolidação
- Venda (OMINIUM) para precificação
- Anexos para documentação
- Versões e Comparação para histórico e auditoria

## Criar Processo
- Acessar “Processo → Novo Processo”
- O sistema cria um processo em `Rascunho` e abre o Editor
- Definir produto, cliente, processo e origem conforme necessidade

## Orçamento (Editor)
- Preencher premissas: FOB, frete, seguro, THC, taxa USD
- Definir alíquotas: II, IPI, ICMS, PIS, COFINS
- Preencher despesas estimadas (categorias)
- Salvar para gerar uma versão (histórico)
- Exportar PDF A4 quando necessário

## Aprovar Orçamento
- Clicar “Aprovar Orçamento” no Editor
- Efeito: bloqueia edição, fecha fase Orçamento, abre fase Aduana e grava versão
- Badge exibe “Aduana · N dias restantes” (prazo 30 dias a partir do início)

## Nova Versão
- Clicar “Nova Versão” no Editor
- Efeito: libera edição; ao salvar, cria nova versão do processo

## Aduana
- Fase ativa após aprovação do orçamento
- Prazo de 30 dias controlado por badge no Editor
- Atualizações de custos reais e mudanças de parâmetros se necessário

## Numerário
- Acessar “Processo → Numerário”
- Criar solicitação: valor, moeda, responsável, observação
- Atualizar status: “Enviado” → “Pago” → “Recebido”
- Trilha de eventos registrada em cada mudança

## Fechamento
- Acessar “Processo → Fechamento”
- Preencher: valores pagos, data de fechamento, diferenças e ajustes
- Confirmar Fechamento: salva dados, grava versão e bloqueia o processo (status “Finalizado”)

## Venda (OMINIUM)
- Acessar “Processo → Venda (OMINIUM)”
- Definir margem (%) e desconto (%)
- Recalcular preços baseados no snapshot: “Com IPI” e “Sem IPI”
- Salvar parâmetros de venda

## Anexos
- Acessar “Processo → Anexos”
- Fazer upload de arquivos (armazenamento base64 para validação)
- Listar e excluir anexos do processo

## Versões
- Acessar “Processos → Versões”
- Visualizar histórico de versões (fase, data)

## Comparar Versões
- Acessar “Processos → Comparar”
- Selecionar duas versões para ver deltas:
- Resumo: tributos, despesas, desembolso total
- Premissas: FOB, frete, seguro, THC, taxa USD

## Regras de Negócio
- Fases: Orçamento → Aduana → Numerário → Fechamento
- Aprovação cria versão, bloqueia edição e abre Aduana
- Nova Versão libera edição; “Salvar” cria versão
- Fechamento grava versão final e bloqueia alterações (apenas histórico)
- Prazo Aduana: 30 dias a partir do início da fase
- Permissões:
  - Numerário/Fechamento: admin, despachante
  - Venda: admin, cliente
  - Anexos: admin, despachante, cliente

## Validação Rápida
- Criar processo → Editor → “Salvar”
- “Aprovar Orçamento” → ver badge “Aduana · N dias restantes”
- “Nova Versão” → “Salvar” → contador de versões sobe
- Numerário → criar e evoluir status
- Fechamento → confirmar e verificar bloqueio
- Venda → definir margem/desconto e salvar
- Anexos → enviar e ver listagem
- Versões/Comparar → acessar histórico e dif