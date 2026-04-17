# Plano de Cadastro de Navios — API + Frontend

> Projeto: import-costs / comex133_api  
> Tema: Cadastro de Navios / Viagens e integração com Embarque Aduana  
> Objetivo: viabilizar cadastro real de navios para que a tela de Embarques e o Controle de Navios funcionem com dados persistidos na API  
> Status atual: frontend já possui estrutura visual e serviço cliente para `controle-navios`, mas o backend ainda não expõe endpoints reais para a feature

---

## 1. Problema Atual

Na tela de Embarque Aduana, o campo de seleção de navio depende da fonte de dados de `ControleNavio`.

Hoje, o frontend já tenta consumir os seguintes endpoints:

- `GET /api/controle-navios`
- `POST /api/controle-navios`
- `PUT /api/controle-navios/{id}`
- `DELETE /api/controle-navios/{id}`
- `GET /api/controle-navios/trajetos`
- `POST /api/controle-navios/{id}/trajetos`
- `DELETE /api/controle-navios/{id}/trajetos/{trajetoId}`
- `PATCH /api/controle-navios/{id}/trajetos`

Porém, no backend atual não existe implementação dessa feature. Como consequência:

- a tela de Embarques não encontra navios cadastrados;
- o select de navio em Embarque Aduana permanece vazio;
- a tela de Controle de Navios não consegue operar com persistência real;
- a integração entre logística e embarque fica incompleta.

---

## 2. Estrutura Funcional Já Prevista no Frontend

### 2.1 Entidade principal

```ts
export interface ControleNavio {
  id: string;
  numeroViagem: string;
  nomeNavio: string;
  observacao?: string;
  ativo: boolean;
}
```

### 2.2 Entidade de trajetos

```ts
export interface ControleNavioTrajeto {
  id: string;
  controleNavioId: string;
  portoOrigemId: string;
  portoDestinoId: string;
  etd: string;
  eta: string;
  trajetoDescricao?: string;
}
```

### 2.3 Uso no Embarque

A entidade `EmbarqueAduana` já possui o vínculo:

```ts
controleNavioId: string;
```

Isso significa que o módulo de navios precisa ser tratado como cadastro mestre operacional, e não apenas como uma tela isolada.

---

## 3. Regras de Negócio Consolidadas

As regras abaixo já aparecem na documentação funcional e/ou no comportamento esperado do frontend:

### RN-01 — Navio representa uma viagem operacional

Cada registro de `ControleNavio` representa uma viagem identificável por:

- número da viagem;
- nome do navio;
- observação opcional;
- status lógico de ativo.

### RN-02 — Um navio possui 1:N trajetos

Um navio pode possuir múltiplos trajetos.
Cada trajeto representa um trecho da viagem, com:

- porto de origem;
- porto de destino;
- ETD;
- ETA;
- descrição opcional.

### RN-03 — ETA deve ser maior ou igual ao ETD

Todo trajeto deve respeitar consistência temporal:

- `eta >= etd`

### RN-04 — Embarque referencia navio por FK

`EmbarqueAduana.controleNavioId` deve apontar para um navio válido.

### RN-05 — Exclusão de navio remove seus trajetos

Ao excluir um `ControleNavio`, os `ControleNavioTrajeto` vinculados devem ser removidos em cascata.

### RN-06 — Navegação de Embarque depende da existência de navios

Sem cadastro de navio persistido, o frontend não consegue listar ou associar embarques a viagens.

### RN-07 — Apenas navios ativos devem ser oferecidos como seleção no Embarque

Para evitar vínculo com viagens obsoletas, a tela de Embarque deve trabalhar preferencialmente com navios ativos.

---

## 4. Escopo do Backend (API)

## 4.1 Objetivo do backend

A API deve fornecer persistência real para:

- cadastro de navios/viagens;
- cadastro de trajetos do navio;
- consulta de navios para uso na logística e embarque;
- manutenção completa do relacionamento com `EmbarqueAduana`.

## 4.2 Entidades sugeridas

### ControleNavio

Campos mínimos:

- `Id: int`
- `NumeroViagem: string`
- `NomeNavio: string`
- `Observacao: string?`
- `Ativo: bool`
- `CriadoEm: DateTime`
- `AtualizadoEm: DateTime`

### ControleNavioTrajeto

Campos mínimos:

- `Id: int`
- `ControleNavioId: int`
- `PortoOrigemId: int` ou `string`, conforme modelagem já adotada na API
- `PortoDestinoId: int` ou `string`, conforme modelagem já adotada na API
- `Etd: DateOnly` ou `DateTime`
- `Eta: DateOnly` ou `DateTime`
- `TrajetoDescricao: string?`
- `CriadoEm: DateTime`
- `AtualizadoEm: DateTime`

## 4.3 Relacionamentos esperados

- `ControleNavio 1:N ControleNavioTrajeto`
- `ControleNavio 1:N EmbarqueAduana`
- `ControleNavioTrajeto N:1 PortoOrigem`
- `ControleNavioTrajeto N:1 PortoDestino`

## 4.4 Endpoints recomendados

### Navios

- `GET /api/controle-navios`
- `GET /api/controle-navios/{id}`
- `POST /api/controle-navios`
- `PUT /api/controle-navios/{id}`
- `PATCH /api/controle-navios/{id}/ativo`
- `DELETE /api/controle-navios/{id}`

### Trajetos

- `GET /api/controle-navios/trajetos`
- `GET /api/controle-navios/{id}/trajetos`
- `POST /api/controle-navios/{id}/trajetos`
- `DELETE /api/controle-navios/{id}/trajetos/{trajetoId}`
- `PATCH /api/controle-navios/{id}/trajetos`

## 4.5 Contratos de request/response sugeridos

### DTO de resposta de navio

```csharp
public record ControleNavioDto(
    int Id,
    string NumeroViagem,
    string NomeNavio,
    string? Observacao,
    bool Ativo,
    DateTime CriadoEm,
    DateTime AtualizadoEm);
```

### DTO de criação de navio

```csharp
public record CreateControleNavioRequest(
    string NumeroViagem,
    string NomeNavio,
    string? Observacao,
    bool Ativo);
```

### DTO de atualização de navio

```csharp
public record UpdateControleNavioRequest(
    string NumeroViagem,
    string NomeNavio,
    string? Observacao,
    bool Ativo);
```

### DTO de resposta de trajeto

```csharp
public record ControleNavioTrajetoDto(
    int Id,
    int ControleNavioId,
    string PortoOrigemId,
    string PortoDestinoId,
    string Etd,
    string Eta,
    string? TrajetoDescricao);
```

### DTO de criação/atualização de trajetos

```csharp
public record UpsertControleNavioTrajetoRequest(
    string PortoOrigemId,
    string PortoDestinoId,
    string Etd,
    string Eta,
    string? TrajetoDescricao);
```

### DTO para ativação

```csharp
public record AtivoRequest(bool Ativo);
```

## 4.6 Regras de validação no backend

A API deve validar no mínimo:

### Navio

- `NumeroViagem` obrigatório
- `NumeroViagem` com limite de tamanho definido
- `NomeNavio` obrigatório
- unicidade recomendada para `NumeroViagem`
- normalização de espaços em branco

### Trajeto

- `PortoOrigemId` obrigatório
- `PortoDestinoId` obrigatório
- `Etd` obrigatório
- `Eta` obrigatório
- `Eta >= Etd`
- opcionalmente bloquear origem igual a destino

## 4.7 Comportamento esperado do serviço backend

### Listagem de navios

A API deve retornar paginação padrão do projeto:

```json
{
  "success": true,
  "data": {
    "items": [],
    "totalCount": 0,
    "page": 1,
    "pageSize": 100,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Listagem de trajetos

Pode seguir um dos dois caminhos:

1. `GET /api/controle-navios/trajetos` com paginação global.
2. `GET /api/controle-navios/{id}/trajetos` por navio.

Como o frontend atual já espera `GET /controle-navios/trajetos`, o ideal é atender esse contrato ou ajustar frontend e API em conjunto.

## 4.8 Decisão importante para a API

A recomendação é manter compatibilidade com o frontend já preparado:

- `GET /controle-navios`
- `GET /controle-navios/trajetos`
- `PATCH /controle-navios/{id}/trajetos` para replace da lista completa

Isso reduz retrabalho e acelera a ativação da tela.

---

## 5. Escopo do Frontend

## 5.1 Objetivo do frontend

Garantir que o cadastro de navios seja utilizável como fonte de dados para:

- Controle de Navios;
- Embarque Aduana;
- Acompanhamento de Embarques;
- futuras visões de logística.

## 5.2 Tela de Controle de Navios

A tela já existe e deve operar com API real.

Campos do formulário:

- Número da Viagem
- Nome do Navio
- Observação
- Ativo
- seção inline de trajetos

Campos do trajeto:

- Porto Origem
- Porto Destino
- ETD
- ETA
- Descrição

## 5.3 Comportamento esperado no frontend

### Cadastro de navio

- criar navio;
- incluir múltiplos trajetos inline;
- salvar navio primeiro;
- sincronizar trajetos em seguida.

### Edição de navio

- carregar navio e seus trajetos;
- permitir substituição da lista de trajetos;
- refletir alterações imediatamente na listagem.

### Exclusão

- confirmar ação com usuário;
- excluir navio;
- atualizar lista sem reload completo da aplicação.

## 5.4 Integração com Embarque Aduana

A tela de Embarque Aduana deve:

- carregar lista de navios via `ControleNavioService.getAll()`;
- popular o select de navios;
- exibir o nome do navio nas telas de detalhe e acompanhamento;
- manter vínculo por `controleNavioId`.

## 5.5 Melhorias necessárias no frontend

Mesmo após a API existir, recomenda-se ajustar:

- tratamento explícito de estado vazio no select de navio em Embarque;
- mensagem orientando cadastro quando não houver navios disponíveis;
- filtro preferencial por navios ativos;
- refresh controlado após criação/edição de navio.

---

## 6. Contrato de Integração API ↔ Frontend

## 6.1 Contrato mínimo obrigatório

O frontend já assume os campos abaixo.
A API deve devolver exatamente estes dados ou exigir ajuste sincronizado:

### Navio

```json
{
  "id": 1,
  "numeroViagem": "2026-001",
  "nomeNavio": "MSC Aurora",
  "observacao": "Viagem Ásia-Brasil",
  "ativo": true
}
```

### Trajeto

```json
{
  "id": 10,
  "controleNavioId": 1,
  "portoOrigemId": "12",
  "portoDestinoId": "7",
  "etd": "2026-04-01",
  "eta": "2026-04-25",
  "trajetoDescricao": "Trecho principal"
}
```

## 6.2 Ordem recomendada de integração

1. Backend publica `GET /controle-navios`.
2. Backend publica `GET /controle-navios/trajetos`.
3. Backend publica `POST /controle-navios`.
4. Backend publica `PATCH /controle-navios/{id}/trajetos`.
5. Frontend valida cadastro completo.
6. Frontend valida consumo do select em Embarque Aduana.
7. Backend publica demais endpoints de manutenção (`PUT`, `DELETE`, `PATCH ativo`, etc.).

## 6.3 Critério objetivo de integração bem-sucedida

A integração será considerada completa quando:

- for possível cadastrar navio e trajetos pela tela de Controle de Navios;
- o navio recém-criado aparecer no select de Embarque Aduana;
- for possível salvar um embarque com `controleNavioId` válido;
- o nome do navio aparecer nas telas de embarque e acompanhamento;
- o build do frontend ocorrer sem fallback local para navios.

---

## 7. Tarefas Recomendadas para Backend

### Etapa BE-01 — Modelagem

- criar entidade `ControleNavio`;
- criar entidade `ControleNavioTrajeto`;
- mapear relacionamento com `EmbarqueAduana`.

### Etapa BE-02 — Persistência

- criar migrations;
- validar índices e FK;
- definir cascade delete para trajetos.

### Etapa BE-03 — DTOs e Validators

- criar DTOs;
- criar validators de criação/edição;
- padronizar envelope `ApiResponse`.

### Etapa BE-04 — Controller e Service

- expor endpoints listados neste documento;
- manter paginação padrão do projeto;
- garantir mensagens de erro consistentes.

### Etapa BE-05 — Testes

- teste de criação de navio;
- teste de replace de trajetos;
- teste de exclusão em cascata;
- teste de vínculo com embarque.

---

## 8. Tarefas Recomendadas para Frontend

### Etapa FE-01 — Compatibilização do service

- validar se o contrato final da API bate com `ControleNavioService` atual;
- ajustar mapeamentos, se necessário;
- remover qualquer workaround temporário se existir.

### Etapa FE-02 — UX de Cadastro

- garantir formulário consistente para navio + trajetos;
- mensagens de erro amigáveis;
- validação de `ETA >= ETD` no cliente também.

### Etapa FE-03 — Integração com Embarque

- exibir placeholder adequado quando não houver navios;
- recarregar navios quando necessário;
- impedir referência inválida.

### Etapa FE-04 — Acompanhamento

- confirmar lookup do nome do navio nas páginas de embarque e acompanhamento;
- validar fluxo completo com dados reais da API.

---

## 9. Critérios de Aceite

## Backend

- existe CRUD de `ControleNavio`;
- existe manutenção de `ControleNavioTrajeto`;
- API responde no padrão do projeto;
- validações essenciais estão implementadas;
- embarque consegue referenciar navio válido.

## Frontend

- tela de Controle de Navios salva e edita dados reais;
- tela de Embarque exibe navios no select;
- embarque salvo mantém vínculo com navio;
- tela de acompanhamento resolve nome do navio corretamente.

## Integração fim a fim

- criar navio;
- criar trajeto;
- abrir tela de embarque;
- selecionar navio;
- salvar embarque;
- visualizar embarque com navio associado;
- visualizar navio no acompanhamento/logística.

---

## 10. Riscos e Cuidados

- divergência entre tipo de ID de porto no frontend e no backend;
- ausência de endpoint global de trajetos pode exigir ajuste no service atual;
- exclusão de navio com embarques vinculados precisa de regra clara:
  - bloquear exclusão quando houver embarques;
  - ou permitir apenas se não houver vínculo ativo.

Recomendação: o backend deve bloquear exclusão de navio se já houver `EmbarqueAduana` vinculado, para evitar inconsistência operacional.

---

## 11. Recomendação Final

Para destravar o Embarque Aduana, o caminho mais seguro é:

1. Implementar primeiro a API de `ControleNavio` e `ControleNavioTrajeto`.
2. Validar listagem na tela de Controle de Navios.
3. Validar que a tela de Embarque passa a carregar navios.
4. Só então avançar para melhorias adicionais de logística e automação de atracação.

Sem esse cadastro mestre persistido na API, a integração de Embarque com Navio continuará incompleta.
