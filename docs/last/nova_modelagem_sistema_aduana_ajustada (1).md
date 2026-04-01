# Nova modelagem ajustada — Sistema Aduana / Orçamento / Embarque

## Objetivo
Esta versão ajustada melhora a modelagem anterior para evitar excesso de campos em `EmbarqueAduana` e separar melhor:

- segurança e acesso;
- cadastros base;
- configuração de planilha;
- custo do despachante;
- orçamento de venda;
- embarque;
- navio/viagem;
- pagamentos do processo;
- histórico de status;
- free time;
- documentos genéricos.

O foco é deixar o sistema mais escalável e mais fácil de implementar.

---

# 1. Blocos do sistema

## 1.1 Segurança e acesso
- Cargos
- NivelAcesso
- Usuarios

## 1.2 Cadastros base
- Clientes
- Importadores
- Despachantes
- PortosOrigem
- PortosDestino
- CadastroFabricantes
- Exportadores
- AgentesCarga
- Ncm
- ListaPrecoLcl

## 1.3 Configuração de planilha
- ModeloPacklist
- ModeloPacklistCampo

## 1.4 Controle logístico
- ControleNavio
- ControleNavioTrajeto

## 1.5 Custo interno
- CustoDespachante
- CustoDespachanteLi
- CustoDespachanteDespesa
- NcmVinculadoOrcamento
- ValorImposto

## 1.6 Comercial
- OrcamentoVenda
- OrcamentoVendaDespesa
- OrcamentoVendaDespesaExtra

## 1.7 Operação
- EmbarqueAduana
- StatusEmbarque
- HistoricoStatusEmbarque
- FreeTimeEmbarque
- PagamentoProcesso

## 1.8 Documentos
- TipoDocumento
- Documento
- DocumentoVinculo

---

# 2. Diagrama principal de classes

```mermaid
classDiagram

    class Cargo {
        +int Id
        +string Nome
        +string Descricao
        +bool Ativo
    }

    class NivelAcesso {
        +int Id
        +string Nome
        +int Ordem
        +string Descricao
        +bool Ativo
    }

    class Usuario {
        +int Id
        +int CargoId
        +int NivelAcessoId
        +string Nome
        +string Email
        +string Login
        +string SenhaHash
        +bool Ativo
        +DateTime DataCadastro
    }

    class Cliente {
        +int Id
        +string Nome
        +string Documento
        +string Email
        +string Telefone
        +bool Ativo
        +DateTime DataCadastro
    }

    class Importador {
        +int Id
        +string RazaoSocial
        +string Cnpj
        +string Email
        +string Telefone
        +bool Ativo
    }

    class Despachante {
        +int Id
        +string Nome
        +string Documento
        +string Email
        +string Telefone
        +bool Ativo
    }

    class PortoOrigem {
        +int Id
        +string Nome
        +string Codigo
        +string Pais
        +bool Ativo
    }

    class PortoDestino {
        +int Id
        +string Nome
        +string Codigo
        +string Estado
        +string Pais
        +bool Ativo
    }

    class CadastroFabricante {
        +int Id
        +string Nome
        +string Pais
        +string Cidade
        +string Contato
        +bool Ativo
    }

    class Exportador {
        +int Id
        +string Nome
        +string Documento
        +string Pais
        +string Cidade
        +bool Ativo
    }

    class AgenteCarga {
        +int Id
        +string Nome
        +string Documento
        +string Pais
        +string Contato
        +bool Ativo
    }

    class Ncm {
        +int Id
        +string CodigoNcm
        +string Descricao
        +decimal AliqII
        +decimal AliqIPI
        +decimal AliqPIS
        +decimal AliqCOFINS
        +decimal AliqICMS
        +bool Ativo
    }

    class ListaPrecoLcl {
        +int Id
        +string Categoria
        +string Descricao
        +string NomeChines
        +decimal PrecoUsdPorCbm
        +decimal PrecoUsdPorKg
        +DateTime DataVigencia
        +bool Ativo
    }

    class ModeloPacklist {
        +int Id
        +int UsuarioId
        +string Nome
        +string Descricao
        +bool EhPadrao
        +int LinhaInicialLeitura
        +bool PossuiCabecalho
        +bool Ativo
        +DateTime DataCriacao
    }

    class ModeloPacklistCampo {
        +int Id
        +int ModeloPacklistId
        +string CampoSistema
        +string ColunaExcel
        +string NomeColunaEsperada
        +bool Obrigatorio
        +string Formato
        +int Ordem
    }

    class ControleNavio {
        +int Id
        +string NumeroViagem
        +string NomeNavio
        +string Observacao
        +bool Ativo
    }

    class ControleNavioTrajeto {
        +int Id
        +int ControleNavioId
        +int PortoOrigemId
        +int PortoDestinoId
        +DateTime ETD
        +DateTime ETA
        +string TrajetoDescricao
    }

    class CustoDespachante {
        +int Id
        +string CodigoInterno
        +int DespachanteId
        +int ImportadorId
        +int PortoOrigemId
        +int PortoDestinoId
        +int ModeloPacklistId
        +int UsuarioResponsavelId
        +decimal Peso
        +decimal FobUsd
        +decimal FobReais
        +decimal CifUsd
        +decimal CifReais
        +decimal SeguroUsd
        +decimal TaxaUsd
        +decimal TaxaUsdAgente
        +string TamContainer
        +DateTime Data
        +string Observacao
    }

    class CustoDespachanteLi {
        +int Id
        +int CustoDespachanteId
        +string Ncm
        +string Descricao
        +decimal Valor
        +DateTime Data
    }

    class CustoDespachanteDespesa {
        +int Id
        +int CustoDespachanteId
        +string Descricao
        +decimal Valor
        +DateTime Data
        +bool EntraBaseIcms
    }

    class NcmVinculadoOrcamento {
        +int Id
        +int CustoDespachanteId
        +int NcmId
        +string NumeroNcm
        +string Descricao
        +decimal AliIpi
        +decimal AliIi
        +decimal AliPis
        +decimal AliCofins
        +decimal AliIcms
        +decimal BaseCalculo
    }

    class ValorImposto {
        +int Id
        +int NcmVinculadoOrcamentoId
        +decimal AliIpi
        +decimal ValorIpi
        +decimal AliIi
        +decimal ValorIi
        +decimal AliPis
        +decimal ValorPis
        +decimal AliCofins
        +decimal ValorCofins
        +decimal AliIcms
        +decimal ValorIcms
        +decimal TotalImpostos
    }

    class OrcamentoVenda {
        +int Id
        +int ClienteId
        +int CustoDespachanteId
        +DateTime Data
        +string TipoProduto
        +string TamContainer
        +decimal PesoBruto
        +decimal PesoLiquido
        +decimal FreteInternacional
        +decimal CifReais
        +decimal CifUsd
        +decimal FobReais
        +decimal FobUsd
        +decimal TaxaUsd
        +decimal Honorarios
        +decimal TotalImpostos
        +decimal TotalDespesas
        +decimal TotalExtras
        +decimal TotalGeral
        +string Observacao
    }

    class OrcamentoVendaDespesa {
        +int Id
        +int OrcamentoVendaId
        +string Descricao
        +decimal Valor
    }

    class OrcamentoVendaDespesaExtra {
        +int Id
        +int OrcamentoVendaId
        +string Descricao
        +decimal Valor
    }

    class StatusEmbarque {
        +int Id
        +string Nome
        +string Codigo
        +int Ordem
        +bool Ativo
    }

    class EmbarqueAduana {
        +int Id
        +string RefOminium
        +int PortoOrigemId
        +int PortoDestinoId
        +int AgenteCargaId
        +int ClienteId
        +int UsuarioResponsavelId
        +int ControleNavioId
        +int DespachanteId
        +int ExportadorId
        +int StatusEmbarqueId
        +int CustoDespachanteId
        +int OrcamentoVendaId
        +string IMP
        +string BL
        +string Container
        +decimal Kg
        +DateTime ETD
        +DateTime ETA
        +DateTime AvisoPrevisao
        +DateTime AvisoChegada
        +string LI
        +string Registro
        +DateTime DataRegistro
        +DateTime Desemb
        +DateTime Entrega
        +string RefAg
        +string Observacao
    }

    class HistoricoStatusEmbarque {
        +int Id
        +int EmbarqueAduanaId
        +int StatusEmbarqueId
        +DateTime DataStatus
        +string Observacao
        +int UsuarioId
    }

    class FreeTimeEmbarque {
        +int Id
        +int EmbarqueAduanaId
        +int QuantidadeDias
        +DateTime DataInicio
        +DateTime DataFim
        +string Observacao
    }

    class PagamentoProcesso {
        +int Id
        +int EmbarqueAduanaId
        +string TipoPagamento
        +DateTime DataPrevista
        +DateTime DataPagamento
        +decimal Valor
        +int DespachanteId
        +string Observacao
    }

    class TipoDocumento {
        +int Id
        +string Nome
        +string Codigo
        +string Categoria
        +bool Ativo
    }

    class Documento {
        +int Id
        +int TipoDocumentoId
        +int UsuarioUploadId
        +string NomeOriginal
        +string NomeSalvo
        +string CaminhoArquivo
        +string Extensao
        +string ContentType
        +long TamanhoBytes
        +DateTime DataUpload
        +string HashArquivo
        +string Observacao
    }

    class DocumentoVinculo {
        +int Id
        +int DocumentoId
        +string Entidade
        +int EntidadeId
        +string Papel
        +DateTime DataVinculo
    }

    Cargo "1" --> "*" Usuario : classifica
    NivelAcesso "1" --> "*" Usuario : controla
    Usuario "1" --> "*" ModeloPacklist : cria
    ModeloPacklist "1" --> "*" ModeloPacklistCampo : possui

    ControleNavio "1" --> "*" ControleNavioTrajeto : possui
    PortoOrigem "1" --> "*" ControleNavioTrajeto : origem
    PortoDestino "1" --> "*" ControleNavioTrajeto : destino

    Despachante "1" --> "*" CustoDespachante : atende
    Importador "1" --> "*" CustoDespachante : utiliza
    PortoOrigem "1" --> "*" CustoDespachante : origem
    PortoDestino "1" --> "*" CustoDespachante : destino
    ModeloPacklist "1" --> "*" CustoDespachante : usa
    Usuario "1" --> "*" CustoDespachante : responsavel
    CustoDespachante "1" --> "*" CustoDespachanteLi : possui
    CustoDespachante "1" --> "*" CustoDespachanteDespesa : possui
    CustoDespachante "1" --> "*" NcmVinculadoOrcamento : possui
    Ncm "1" --> "*" NcmVinculadoOrcamento : referencia
    NcmVinculadoOrcamento "1" --> "1" ValorImposto : gera

    Cliente "1" --> "*" OrcamentoVenda : recebe
    CustoDespachante "1" --> "*" OrcamentoVenda : origina
    OrcamentoVenda "1" --> "*" OrcamentoVendaDespesa : possui
    OrcamentoVenda "1" --> "*" OrcamentoVendaDespesaExtra : possui

    Cliente "1" --> "*" EmbarqueAduana : contratante
    Usuario "1" --> "*" EmbarqueAduana : responsavel
    AgenteCarga "1" --> "*" EmbarqueAduana : agente
    Despachante "1" --> "*" EmbarqueAduana : despacha
    Exportador "1" --> "*" EmbarqueAduana : exporta
    ControleNavio "1" --> "*" EmbarqueAduana : navio
    PortoOrigem "1" --> "*" EmbarqueAduana : origem
    PortoDestino "1" --> "*" EmbarqueAduana : destino
    StatusEmbarque "1" --> "*" EmbarqueAduana : atual
    CustoDespachante "1" --> "*" EmbarqueAduana : base
    OrcamentoVenda "1" --> "*" EmbarqueAduana : venda

    EmbarqueAduana "1" --> "*" HistoricoStatusEmbarque : historico
    StatusEmbarque "1" --> "*" HistoricoStatusEmbarque : registra
    Usuario "1" --> "*" HistoricoStatusEmbarque : altera

    EmbarqueAduana "1" --> "*" FreeTimeEmbarque : controla
    EmbarqueAduana "1" --> "*" PagamentoProcesso : pagamentos
    Despachante "1" --> "*" PagamentoProcesso : recebe

    TipoDocumento "1" --> "*" Documento : classifica
    Usuario "1" --> "*" Documento : envia
    Documento "1" --> "*" DocumentoVinculo : vincula
```

---

# 3. Ajustes feitos nesta versão

## 3.1 `EmbarqueAduana` ficou mais limpo
Antes ele concentrava quase tudo em uma tabela só.

Agora foram extraídos:
- `StatusEmbarque`
- `HistoricoStatusEmbarque`
- `FreeTimeEmbarque`
- `PagamentoProcesso`

Isso reduz duplicação e facilita controle histórico.

---

# 4. Novo bloco: status do embarque

## `StatusEmbarque`
Tabela mestre com os status possíveis.

Exemplos:
- Previsto
- Aguardando
- Atracado
- Registrado
- Desembaraçado
- Entregue
- Finalizado

## `HistoricoStatusEmbarque`
Guarda cada mudança de status do embarque:
- qual status entrou;
- quando entrou;
- quem alterou;
- observação.

## Diagrama

```mermaid
classDiagram
    class StatusEmbarque {
        +int Id
        +string Nome
        +string Codigo
        +int Ordem
        +bool Ativo
    }

    class HistoricoStatusEmbarque {
        +int Id
        +int EmbarqueAduanaId
        +int StatusEmbarqueId
        +DateTime DataStatus
        +string Observacao
        +int UsuarioId
    }

    StatusEmbarque "1" --> "*" HistoricoStatusEmbarque : registra
```

---

# 5. Novo bloco: free time

## `FreeTimeEmbarque`
Em vez de gravar só texto, agora o free time vira uma tabela.

Campos:
- quantidade de dias;
- data início;
- data fim;
- observação.

Isso ajuda a calcular vencimento e alertas.

## Diagrama

```mermaid
classDiagram
    class FreeTimeEmbarque {
        +int Id
        +int EmbarqueAduanaId
        +int QuantidadeDias
        +DateTime DataInicio
        +DateTime DataFim
        +string Observacao
    }
```

---

# 6. Novo bloco: pagamentos do processo

## `PagamentoProcesso`
Serve para controlar:
- cobrança de sinal;
- sinal pago para qual despachante;
- fechamento pago;
- outros pagamentos do processo.

### Campo `TipoPagamento`
Exemplos:
- CobrancaSinal
- SinalPago
- FechamentoPago
- Honorario
- Outro

### Benefício
Você deixa de depender de campos fixos e passa a registrar quantos pagamentos precisar.

## Diagrama

```mermaid
classDiagram
    class PagamentoProcesso {
        +int Id
        +int EmbarqueAduanaId
        +string TipoPagamento
        +DateTime DataPrevista
        +DateTime DataPagamento
        +decimal Valor
        +int DespachanteId
        +string Observacao
    }
```

---

# 7. Como fica o embarque agora

## `EmbarqueAduana` guarda apenas o núcleo do processo
Campos principais:
- referência;
- portos;
- agente;
- cliente;
- responsável;
- ETD / ETA;
- aviso previsão;
- aviso chegada;
- IMP;
- BL;
- container;
- KG;
- navio;
- status atual;
- despachante;
- LI;
- registro;
- data registro;
- desemb;
- entrega;
- exportador;
- ref ag;
- vínculo com custo e venda.

## O que saiu dele
- pagamentos detalhados;
- histórico de status;
- free time estruturado.

---

# 8. Diagrama focado em embarque ajustado

```mermaid
classDiagram
    class EmbarqueAduana {
        +int Id
        +string RefOminium
        +int PortoOrigemId
        +int PortoDestinoId
        +int AgenteCargaId
        +int ClienteId
        +int UsuarioResponsavelId
        +int ControleNavioId
        +int DespachanteId
        +int ExportadorId
        +int StatusEmbarqueId
        +int CustoDespachanteId
        +int OrcamentoVendaId
        +string IMP
        +string BL
        +string Container
        +decimal Kg
        +DateTime ETD
        +DateTime ETA
        +DateTime AvisoPrevisao
        +DateTime AvisoChegada
        +string LI
        +string Registro
        +DateTime DataRegistro
        +DateTime Desemb
        +DateTime Entrega
        +string RefAg
        +string Observacao
    }

    class HistoricoStatusEmbarque {
        +int Id
        +int EmbarqueAduanaId
        +int StatusEmbarqueId
        +DateTime DataStatus
        +string Observacao
        +int UsuarioId
    }

    class FreeTimeEmbarque {
        +int Id
        +int EmbarqueAduanaId
        +int QuantidadeDias
        +DateTime DataInicio
        +DateTime DataFim
        +string Observacao
    }

    class PagamentoProcesso {
        +int Id
        +int EmbarqueAduanaId
        +string TipoPagamento
        +DateTime DataPrevista
        +DateTime DataPagamento
        +decimal Valor
        +int DespachanteId
        +string Observacao
    }

    EmbarqueAduana "1" --> "*" HistoricoStatusEmbarque : possui
    EmbarqueAduana "1" --> "*" FreeTimeEmbarque : possui
    EmbarqueAduana "1" --> "*" PagamentoProcesso : possui
```

---

# 9. Modelo relacional simplificado

```mermaid
erDiagram
    CARGO ||--o{ USUARIO : classifica
    NIVEL_ACESSO ||--o{ USUARIO : controla

    USUARIO ||--o{ MODELO_PACKLIST : cria
    MODELO_PACKLIST ||--o{ MODELO_PACKLIST_CAMPO : possui

    CONTROLE_NAVIO ||--o{ CONTROLE_NAVIO_TRAJETO : possui

    DESPACHANTE ||--o{ CUSTO_DESPACHANTE : atende
    IMPORTADOR ||--o{ CUSTO_DESPACHANTE : utiliza
    PORTO_ORIGEM ||--o{ CUSTO_DESPACHANTE : origem
    PORTO_DESTINO ||--o{ CUSTO_DESPACHANTE : destino
    MODELO_PACKLIST ||--o{ CUSTO_DESPACHANTE : usa
    USUARIO ||--o{ CUSTO_DESPACHANTE : responsavel

    CUSTO_DESPACHANTE ||--o{ CUSTO_DESPACHANTE_LI : possui
    CUSTO_DESPACHANTE ||--o{ CUSTO_DESPACHANTE_DESPESA : possui
    CUSTO_DESPACHANTE ||--o{ NCM_VINCULADO_ORCAMENTO : possui
    NCM ||--o{ NCM_VINCULADO_ORCAMENTO : referencia
    NCM_VINCULADO_ORCAMENTO ||--|| VALOR_IMPOSTO : gera

    CLIENTE ||--o{ ORCAMENTO_VENDA : recebe
    CUSTO_DESPACHANTE ||--o{ ORCAMENTO_VENDA : origina
    ORCAMENTO_VENDA ||--o{ ORCAMENTO_VENDA_DESPESA : possui
    ORCAMENTO_VENDA ||--o{ ORCAMENTO_VENDA_DESPESA_EXTRA : possui

    STATUS_EMBARQUE ||--o{ EMBARQUE_ADUANA : atual
    CLIENTE ||--o{ EMBARQUE_ADUANA : contratante
    USUARIO ||--o{ EMBARQUE_ADUANA : responsavel
    AGENTE_CARGA ||--o{ EMBARQUE_ADUANA : agente
    DESPACHANTE ||--o{ EMBARQUE_ADUANA : despacha
    EXPORTADOR ||--o{ EMBARQUE_ADUANA : exporta
    CONTROLE_NAVIO ||--o{ EMBARQUE_ADUANA : navio
    CUSTO_DESPACHANTE ||--o{ EMBARQUE_ADUANA : base
    ORCAMENTO_VENDA ||--o{ EMBARQUE_ADUANA : venda

    EMBARQUE_ADUANA ||--o{ HISTORICO_STATUS_EMBARQUE : historico
    STATUS_EMBARQUE ||--o{ HISTORICO_STATUS_EMBARQUE : registra
    EMBARQUE_ADUANA ||--o{ FREE_TIME_EMBARQUE : controla
    EMBARQUE_ADUANA ||--o{ PAGAMENTO_PROCESSO : pagamentos

    TIPO_DOCUMENTO ||--o{ DOCUMENTO : classifica
    USUARIO ||--o{ DOCUMENTO : envia
    DOCUMENTO ||--o{ DOCUMENTO_VINCULO : vincula
```

---

# 10. Regras de implementação

## Integridade
Não permitir:
- usuário sem cargo;
- usuário sem nível de acesso;
- custo despachante sem despachante;
- custo despachante sem importador;
- valor imposto sem NCM vinculado;
- embarque sem custo base;
- embarque sem cliente;
- histórico de status sem embarque;
- pagamento sem embarque.

## Exclusão sugerida
Ao excluir `CustoDespachante`, excluir também:
- LI;
- despesas;
- NCMs vinculados;
- valor imposto.

Ao excluir `OrcamentoVenda`, excluir:
- despesas;
- despesas extras.

Ao excluir `EmbarqueAduana`, excluir:
- histórico de status;
- free time;
- pagamentos do processo;
- vínculos documentais.

Ao excluir vínculos de documento:
- o arquivo físico só pode ser apagado quando não existir mais nenhum vínculo.

---

# 11. Fluxo do processo

```mermaid
flowchart TD
    A[Cadastros base] --> B[Usuário configura modelo de packlist]
    B --> C[Criar CustoDespachante]
    C --> D[Inserir LI]
    D --> E[Inserir despesas]
    E --> F[Vincular NCMs]
    F --> G[Calcular impostos]
    G --> H[Gerar OrcamentoVenda]
    H --> I[Enviar ao cliente]
    I --> J[Aprovação]
    J --> K[Gerar EmbarqueAduana]
    K --> L[Definir status inicial]
    L --> M[Registrar pagamentos]
    M --> N[Controlar free time]
    N --> O[Atualizar histórico de status]
    O --> P[Anexar documentos]
```

---

# 12. Resumo executivo

## Estrutura central
```text
Usuários + Cargos + Nível de acesso
    ↓
ModeloPacklist
    ↓
CustoDespachante
    ↓
LI + Despesas + NCM Vinculado + Impostos
    ↓
OrcamentoVenda
    ↓
EmbarqueAduana
    ↓
Status + Histórico + Pagamentos + FreeTime + Documentos
```

## Melhorias desta versão
- embarque menos pesado;
- status separado em tabela própria;
- histórico de status completo;
- pagamentos flexíveis;
- free time estruturado;
- melhor base para alertas, dashboard e financeiro.
