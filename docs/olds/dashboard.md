Visão Geral do Dashboard

O dashboard é dividido em 3 áreas principais:

📊 Cabeçalho de Resumo (KPI Overview)

📦 Linha do Tempo / Pipeline de Processos

📋 Tabelas Detalhadas e Alertas Operacionais

🧱 1️⃣ Cabeçalho — KPIs de Status Geral
Indicador	Descrição	Exemplo de Valor
Total de Processos Ativos	Soma de todos os embarques em andamento	24
Orçamentos em Análise	Aguardando aprovação do cliente	5
Embarques em Andamento	Já aprovados, dentro do prazo de 30 dias	12
Solicitações de Numerário Pendentes	Despachante → OMINIUM ou Cliente	3
Processos Concluídos	Fechados e entregues	4
Alertas de Atraso	Processos com prazo > 30 dias	2

🔹 Visualização sugerida: Cards grandes no topo com ícones e cores:

🟢 Verde = dentro do prazo

🟡 Amarelo = próximo do limite

🔴 Vermelho = atrasado

🕓 2️⃣ Linha do Tempo / Pipeline de Fases

Representa o ciclo completo do processo.

[ORÇAMENTO] → [ADUANA / EMBARQUE] → [NUMERÁRIO] → [FECHAMENTO]

Cada fase exibe:

Quantidade de processos naquela fase

Percentual de conclusão

Tempo médio de permanência

Última atualização

🔹 Visual sugerida:

Um gráfico tipo “Kanban Pipeline”, com blocos clicáveis.

Cada fase mostra cards resumidos dos processos (nome, cliente, status, dias restantes).

Cores dinâmicas conforme SLA.

📋 3️⃣ Tabelas Detalhadas
🧾 Tabela: Orçamentos
Cliente	Packlist	Despachante	Valor Total	Status	Data de Envio
ABC Ltda	12 itens	João	U$ 23.000	Aguardando aprovação	12/02

Ações rápidas:

🔍 Ver Detalhes

📊 Comparar com Fase Oficial

📅 Enviar Lembrete

⚓ Tabela: Embarques / Aduana
Processo	Cliente	Dias Restantes	Última Atualização	Status	Ações
IMP2025-021	XYZ S/A	10	02/12/2025	Em andamento	📄 Detalhar

🔔 Alertas:

Exibir badge “⚠️ Atualização Pendente” quando passar 25 dias.

Exibir “⏰ Atrasado” quando exceder 30 dias.

💰 Tabela: Solicitação de Numerário
Cliente	Valor Solicitado	Solicitante	Data	Status
ABC Ltda	U$ 12.500	Despachante	02/12	Aguardando cliente
🧾 Tabela: Fechamento
Cliente	Total Pago	Diferença	Status	Data de Conclusão
XYZ S/A	U$ 23.000	U$ +200	Finalizado	25/11
📈 4️⃣ Gráficos Gerenciais

Evolução mensal de processos (por fase) → gráfico de área

Tempo médio por fase → gráfico de barras horizontais

Top 5 clientes por volume de embarques → gráfico de pizza

Comparativo Orçamento x Oficial (diferença de custo) → gráfico de colunas

🔔 5️⃣ Alertas e Notificações Inteligentes

⏳ Atrasos automáticos (prazo de 30 dias)

💵 Solicitação de numerário pendente há mais de X dias

🧾 Fase de fechamento aguardando conferência de sinal

🧩 Diferença entre planilha de orçamento e oficial > 10%

📊 6️⃣ Filtros e Navegação

Filtros por:

Cliente

Período (mês, trimestre)

Despachante

Fase

Status

🔹 Botões principais:

➕ Novo Processo

🔍 Buscar

📑 Exportar CSV

📊 Ver Histórico Completo

🗂️ 7️⃣ Layout Visual (Esboço em Texto)
┌───────────────────────────────────────────┐
│ OMINIUM - DASHBOARD DE PROCESSOS          │
├───────────────────────────────────────────┤
│ KPIs  [Ativos][Atrasados][Numerário][Fechados] │
├───────────────────────────────────────────┤
│ Pipeline:  ORÇAMENTO → ADUANA → NUMERÁRIO → FECHAMENTO │
├───────────────────────────────────────────┤
│ [Tabela de Processos com filtros e ações] │
├───────────────────────────────────────────┤
│ [Gráficos Gerenciais]                    │
├───────────────────────────────────────────┤
│ [Alertas Recentes e Histórico]            │
└───────────────────────────────────────────┘
