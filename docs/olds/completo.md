Objetivo da Aplicação

A aplicação deve controlar o ciclo completo de importação e nacionalização de mercadorias, desde o orçamento inicial até o fechamento financeiro e entrega final ao cliente.
O foco é dar visibilidade, histórico e acompanhamento das fases, permitindo que os envolvidos saibam quem deve agir em cada momento e quais dados ou planilhas precisam ser atualizados.

👥 Perfis Envolvidos e Funções
Perfil	Responsabilidade Principal
Cliente	Envia packlist (lista de mercadorias), aprova o orçamento e realiza o pagamento (numerário).
Despachante	Analisa o packlist, monta a planilha de custo (fase orçamento e fase oficial) e solicita numerário.
Consultoria / OMINIUM	Recebe os dados do despachante, cria a planilha de venda, intermedeia comunicação com o cliente e acompanha o embarque.
Sistema / Aplicação	Centraliza informações, armazena histórico, controla prazos (30 dias), e mantém todas as planilhas (Orçamento, Aduana, Solicitação e Fechamento).
🧩 Fases do Processo
1️⃣ FASE DE ORÇAMENTO

Objetivo: definir custos e valores de venda iniciais.
Ações:

Cliente envia Packlist.

Despachante cria Planilha de Custo do Despachante.

Consultoria (OMINIUM) cria Planilha de Venda para o Cliente.

Cliente aprova ou reprova.
🧾 Saída: registro de histórico do orçamento.

2️⃣ FASE DE EMBARQUE (ADUANA)

Condição de entrada: cliente aprovou o orçamento.
Objetivo: acompanhar o processo oficial de importação.
Ações:

Processo aparece na planilha ADUANA.

Prazo de 30 dias para acompanhar atualizações (peso, taxas, câmbio).

Despachante atualiza custos conforme variações.

Histórico do orçamento é preservado (não pode ser sobrescrito).

3️⃣ FASE DE SOLICITAÇÃO DE NUMERÁRIO

Objetivo: iniciar fluxo financeiro.
Ações:

Despachante solicita valor para a Consultoria (OMINIUM).

Consultoria solicita numerário ao cliente.
💰 Controle importante: rastrear quem pediu, quando e valor solicitado.

4️⃣ FASE DE FECHAMENTO

Objetivo: consolidar tudo e registrar o resultado financeiro final.
Ações:

Conferir o que foi pago na fase de sinal.

Atualizar planilha de fechamento com diferenças e ajustes.

Marcar processo como finalizado e entregue.

Registrar histórico completo (todas as fases permanecem visíveis).

🔄 Resumo do Fluxo

Cliente → envia Packlist

Despachante → cria planilha de custo

OMINIUM → cria planilha de venda e envia ao cliente

Cliente → aprova

Sistema → gera processo na planilha Aduana

Despachante / OMINIUM → acompanham alterações

Despachante → solicita numerário → OMINIUM → solicita cliente

OMINIUM → registra fechamento

🧮 Regras e Acompanhamentos

Cada fase tem data de início e término.

Histórico de cada fase é imutável.

Mudanças no câmbio, peso, produto ou taxa geram nova versão da planilha.

O sistema precisa permitir comparar versões (orçamento vs oficial).

Acompanhamento dos 30 dias do embarque deve ter alerta automático.

🔷 Fluxograma Simplificado
flowchart TD
    A[Cliente envia Packlist] --> B[Despachante cria planilha de custo]
    B --> C[Consultoria (OMINIUM) cria planilha de venda]
    C --> D[Cliente aprova?]
    D -->|Sim| E[Fase Aduana - Embarque]
    D -->|Não| C
    E --> F[Atualização de custos e taxas]
    F --> G[Solicitação de numerário]
    G --> H[Despachante -> OMINIUM -> Cliente]
    H --> I[Fechamento do processo]
    I --> J[Registro final e histórico completo]


    