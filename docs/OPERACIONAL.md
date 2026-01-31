# Sistema de Gestão de Importação - Documentação Operacional

## Visão Geral do Negócio

O sistema gerencia o ciclo completo de operações de importação, desde o cadastro de informações básicas até o acompanhamento do desembaraço aduaneiro. O processo é dividido em cadastros de apoio e um fluxo operacional principal composto por 4 fases sequenciais.

---

## Cadastros Base

### 1. Portos
**Objetivo:** Cadastrar portos de origem e destino das mercadorias.

**Informações gerenciadas:**
- Nome do porto
- Código de identificação
- País de localização

**Uso no processo:** Os portos cadastrados são utilizados nas fases de Custo e Aduana para identificar origem e destino da carga, impactando no cálculo de fretes e taxas portuárias.

---

### 2. Clientes
**Objetivo:** Cadastrar empresas importadoras que contratam os serviços.

**Informações gerenciadas:**
- Dados cadastrais da empresa
- Informações de contato
- Associação com template de packlist padrão

**Uso no processo:** Todo orçamento é vinculado a um cliente. O template de packlist associado ao cliente define o modelo padrão de lista de embalagem a ser utilizado.

---

### 3. Despachantes
**Objetivo:** Cadastrar os profissionais/empresas responsáveis pelo desembaraço aduaneiro.

**Informações gerenciadas:**
- Nome/Razão social
- Documento (CPF/CNPJ)
- Dados de contato

**Uso no processo:** O despachante é designado na fase de Aduana para conduzir o processo de liberação da mercadoria junto aos órgãos competentes.

---

### 4. Alíquotas
**Objetivo:** Criar perfis de tributação para diferentes tipos de mercadorias.

**Informações gerenciadas:**
- Percentuais de impostos:
  - II (Imposto de Importação)
  - IPI (Imposto sobre Produtos Industrializados)
  - ICMS (Imposto sobre Circulação de Mercadorias)
  - PIS (Programa de Integração Social)
  - COFINS (Contribuição para Financiamento da Seguridade Social)
- Indicação de perfil padrão

**Uso no processo:** O perfil de alíquotas selecionado na fase de Custo determina os percentuais tributários que serão aplicados sobre o valor da mercadoria importada.

---

### 5. Templates de Packlist
**Objetivo:** Padronizar modelos de lista de embalagem por tipo de cliente ou operação.

**Informações gerenciadas:**
- Arquivo modelo (planilha)
- Data de criação
- Estrutura de colunas esperadas

**Uso no processo:** Define o layout padrão para upload ou digitação manual da lista de produtos a serem importados na fase de Packlist.

---

## Fluxo Operacional Principal: Orçamento

O processo de importação é gerenciado através de **Orçamentos**, que passam por 4 fases sequenciais obrigatórias.

### Criação de Novo Processo

**Ação inicial:** O usuário acessa "Novo Processo" e informa:
- Cliente (seleção de cadastro existente)
- Número do processo
- Outros dados básicos do orçamento

**Resultado:** É criado um orçamento em branco que será trabalhado nas 4 fases subsequentes.

---

## Fase 1: Packlist (Lista de Embalagem)

### Objetivo de Negócio
Registrar a relação completa de mercadorias que serão importadas, com suas especificações técnicas e quantidades.

### Formas de Operação

**Opção A - Upload de Arquivo:**
- O usuário carrega uma planilha seguindo o template associado ao cliente
- O sistema processa automaticamente o arquivo e extrai as informações dos produtos
- Vantagem: agilidade em operações com muitos itens

**Opção B - Finalização sem Arquivo:**
- O usuário pode finalizar esta fase sem fazer upload
- Os dados serão inseridos manualmente na fase de Aduana
- Vantagem: flexibilidade para processos com poucos itens ou dados que chegam posteriormente

### Informações Gerenciadas
- Descrição dos produtos
- Quantidades
- Pesos e dimensões
- Valores unitários
- Origem das mercadorias

### Status da Fase
- **Rascunho:** dados parcialmente preenchidos, permite edição
- **Concluída:** dados confirmados, avança para próxima fase

### Relação com Cadastros
- **Template Packlist:** define o formato esperado do arquivo
- **Cliente:** determina qual template será utilizado

---

## Fase 2: Custo (Planilha de Custo)

### Objetivo de Negócio
Calcular todos os custos envolvidos na operação de importação para determinar o custo total de nacionalização da mercadoria.

### Seções de Cálculo

**Premissas Comerciais:**
- Taxa de câmbio (conversão moeda estrangeira)
- Porto de origem
- Porto de destino
- Tipo de frete (marítimo, aéreo, terrestre)

**Alíquotas Tributárias:**
- Seleção do perfil de impostos aplicável
- Visualização dos percentuais de II, IPI, ICMS, PIS, COFINS

**Despesas Operacionais:**
- Frete internacional
- Seguro internacional
- Taxas portuárias
- Armazenagem
- Desembaraço aduaneiro
- Transporte interno
- Outras despesas

### Cálculos Automáticos
O sistema calcula:
- Base de cálculo dos impostos
- Valor de cada tributo
- Custo total da importação
- Custo unitário por item (dividido pela quantidade do packlist)

### Formas de Operação
- **Salvar como Rascunho:** permite revisar e ajustar valores posteriormente
- **Finalizar Custo:** confirma os valores e libera para a próxima fase

### Relação com Cadastros
- **Alíquotas:** define os percentuais tributários
- **Portos:** identifica origem e destino para cálculo de fretes
- **Packlist (fase anterior):** fornece valores e quantidades dos produtos

---

## Fase 3: Venda (Planilha de Venda)

### Objetivo de Negócio
Definir o preço de venda ao cliente final, adicionando margem de lucro e despesas comerciais sobre o custo de importação.

### Informações Gerenciadas

**Dados de Entrada (somente leitura):**
- Todos os custos calculados na fase anterior
- Valor total de nacionalização

**Dados Editáveis:**
- Despesas de agência marítima
- Margem de lucro desejada
- Descontos comerciais
- Outras despesas de venda

### Cálculos Automáticos
O sistema calcula:
- Preço de venda unitário
- Preço de venda total
- Margem de contribuição
- Percentual de lucro sobre o custo

### Formas de Operação
- **Salvar como Rascunho:** permite simular diferentes cenários de precificação
- **Finalizar Venda:** confirma os valores comerciais e avança para fase de execução

### Relação com Fases Anteriores
- **Custo:** fornece a base de cálculo (custo de nacionalização)
- **Packlist:** fornece quantidades para cálculo de preço unitário

---

## Fase 4: Aduana (Desembaraço Aduaneiro)

### Objetivo de Negócio
Acompanhar o processo de liberação da mercadoria junto aos órgãos fiscalizadores e registrar eventos importantes da operação.

### Informações Gerenciadas

**Dados Oficiais:**
- Número da DI (Declaração de Importação)
- Data de registro da DI
- Número do Conhecimento de Embarque (BL/AWB)
- Despachante responsável
- Previsão de desembaraço
- Data efetiva de desembaraço

**Linha do Tempo de Eventos:**
- Registro cronológico de todas as ocorrências
- Comunicações com despachante
- Exigências fiscais
- Vistorias e conferências
- Liberação de documentos

**Dados de Produtos (se não informados no Packlist):**
- Permite inserção manual dos itens importados
- Atualização de quantidades recebidas
- Registro de divergências entre esperado e recebido

### Formas de Operação

**Registrar Lançamento:**
- Adiciona eventos à linha do tempo
- Atualiza dados oficiais conforme o andamento
- Salva como rascunho para continuar posteriormente

**Finalizar Aduana:**
- Confirma que a mercadoria foi liberada
- Marca o orçamento como concluído
- Processo está pronto para fechamento financeiro

### Relação com Cadastros
- **Despachante:** identifica o responsável pela liberação
- **Portos:** confirma pontos de entrada da mercadoria
- **Packlist:** valida quantidades recebidas vs. esperadas

---

## Interatividade entre Fases

### Sequenciamento Obrigatório
As fases devem ser concluídas em ordem:
1. Packlist → 2. Custo → 3. Venda → 4. Aduana

**Regra de negócio:** Não é possível avançar para uma fase sem concluir a anterior.

### Transferência de Dados

**Packlist → Custo:**
- Valor FOB (Free On Board) da mercadoria
- Quantidade total de itens
- Peso e volume da carga

**Custo → Venda:**
- Custo total de nacionalização
- Breakdown de impostos e despesas
- Custo unitário calculado

**Venda → Aduana:**
- Valores aprovados para faturamento
- Confirmação dos dados comerciais

**Packlist → Aduana:**
- Lista de produtos esperados
- Quantidades a conferir no recebimento

### Visão Unificada (Overview)
O sistema mantém uma tela de resumo onde o usuário visualiza:
- Status de cada fase (pendente/em andamento/concluída)
- Principais indicadores de cada etapa
- Acesso rápido para abrir qualquer fase em modal

---

## Outras Funcionalidades Operacionais

### Dashboard
Apresenta visão gerencial dos processos em andamento:
- Orçamentos por status
- Prazos críticos
- Indicadores de performance
- Processos aguardando ação

### Histórico
Permite consulta de processos finalizados:
- Filtros por cliente, período, status
- Análise de processos passados
- Comparação de custos e margens

### Fechamento
Consolida informações financeiras:
- Processos a faturar
- Contas a pagar (despachantes, fretes, taxas)
- Contas a receber (clientes)
- Conciliação de valores

### Numerário
Gerencia controle de numerário para pagamentos:
- Registro de fundos disponíveis
- Apropriação por processo
- Prestação de contas

---

## Fluxo Completo de uma Operação

1. **Preparação:** Cadastrar cliente, portos, despachante, alíquotas e templates necessários

2. **Orçamento:** Criar novo processo vinculado ao cliente

3. **Packlist:** Fazer upload da lista de produtos OU finalizar sem arquivo para digitação posterior

4. **Custo:** Informar premissas cambiais, selecionar alíquotas, lançar despesas e finalizar cálculo

5. **Venda:** Adicionar margem de lucro sobre o custo e definir preço final

6. **Aduana:** Designar despachante, acompanhar desembaraço e registrar eventos até liberação

7. **Fechamento:** Processar faturas e pagamentos relacionados ao processo concluído

---

## Regras de Negócio Importantes

### Obrigatoriedade de Cadastros
- Todo orçamento **DEVE** ter um cliente vinculado
- A fase de Custo **REQUER** um perfil de alíquotas selecionado
- A fase de Aduana **REQUER** um despachante designado

### Flexibilidade Operacional
- O Packlist **PODE** ser finalizado sem arquivo, permitindo digitação manual posterior
- Rascunhos podem ser salvos em qualquer fase para conclusão futura
- Não há limite de edições enquanto a fase estiver em rascunho

### Irreversibilidade
- Uma vez finalizada, uma fase **NÃO PODE** retornar ao status de rascunho
- Alterações após finalização requerem cancelamento do processo e recriação

### Rastreabilidade
- Todos os eventos da fase de Aduana são registrados cronologicamente
- Histórico de alterações em rascunhos é mantido para auditoria
- Documentos anexados são preservados com data e usuário responsável

---

## Benefícios do Fluxo Estruturado

✅ **Padronização:** Todos os processos seguem o mesmo fluxo, facilitando treinamento e reduzindo erros

✅ **Rastreabilidade:** Cada fase documenta decisões e valores, criando trilha de auditoria completa

✅ **Cálculos Automáticos:** Reduz erros humanos em operações tributárias complexas

✅ **Visibilidade:** Status claro de cada processo permite priorização e acompanhamento gerencial

✅ **Integração:** Dados cadastrados uma vez são reutilizados em todo o sistema

✅ **Flexibilidade:** Permite trabalho com uploads automáticos ou digitação manual conforme necessidade

---

**Versão do Documento:** 1.0  
**Data:** Janeiro 2026  
**Tipo:** Documentação Operacional de Negócio
