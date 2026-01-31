# Exemplos de Uso - Packlist Feature

## 🎯 Como Usar a Feature de Packlist

### Fluxo Básico de Uso

```
1. Navegue até: Orcamento → Packlist
2. Clique no botão "Carregar Packlist"
3. Selecione um arquivo (CSV, XLSX ou XLS)
4. Siga os 3 passos da modal de mapeamento
5. Confirme e visualize os dados
```

---

## 📄 Exemplo 1: Upload CSV

### Arquivo CSV (packlist.csv)
```csv
Produto,Unidades,Peso_kg,Volume_m3
Produto A,100,500,2.5
Produto B,200,1000,5.0
Produto C,150,750,3.75
Produto D,300,1500,7.5
```

### Passos na Modal

**PASSO 1: Seleção de Cabeçalho**
- Selecionar: **Linha 1** (possui headers)
- Preview mostra: "Produto | Unidades | Peso_kg | Volume_m3"
- Clique: "Próximo"

**PASSO 2: Mapeamento**
- Campo "Descrição" → Coluna **A** (Produto)
- Campo "Volumes" → Coluna **B** (Unidades)
- Campo "Peso" → Coluna **C** (Peso_kg)
- Campo "CBM" → Coluna **D** (Volume_m3)
- Clique: "Próximo"

**PASSO 3: Confirmação**
- Verifica se 4 colunas foram mapeadas
- Mostra preview das 20 primeiras linhas
- Clique: "Confirmar Import"

### Resultado
Dados salvos em localStorage sob a chave:
```
packlist_{orcamentoId}: [
  {
    lineNumber: 2,
    descricao: "Produto A",
    volumes: 100,
    peso: 500,
    cbm: 2.5
  },
  {
    lineNumber: 3,
    descricao: "Produto B",
    volumes: 200,
    peso: 1000,
    cbm: 5.0
  },
  ...
]
```

---

## 📊 Exemplo 2: Upload XLSX

### Arquivo XLSX (packlist.xlsx)
**Sheet1:**
| Descrição | Volumes | Peso | CBM |
|-----------|---------|------|-----|
| Widget X | 500 | 2500 | 12.5 |
| Widget Y | 250 | 1250 | 6.25 |
| Gadget Z | 1000 | 5000 | 25.0 |

### Passos
1. Upload do arquivo XLSX
2. Modal abre automaticamente
3. Detecta cabeçalho na linha 1
4. Permite mapear colunas
5. Processa sem stack overflow ✅

---

## 🎨 Exemplo 3: Cenário com Erro

### Arquivo CSV com Problemas
```csv
Linha 1 vazia ou lixo
Nome Produto,Quantidade,Peso Kg,Volume M3
Widget A,100,500,2.5
Widget B,200,1000,5.0
```

### Como Resolver
1. Selecione **Linha 2** como cabeçalho (skip primeira linha)
2. Sistema ajusta automaticamente
3. Mapeia corretamente a partir de linha 3

---

## 🔄 Exemplo 4: Validação de Colunas

### Tentativa de Mapeamento Inválido
```
Descrição → Coluna A
Volumes → Coluna A        ❌ ERRO: Coluna A já foi mapeada!
Peso → Coluna B
CBM → Coluna C
```

### Feedback do Sistema
Modal exibe:
```
⚠️ Erro de Validação
Uma coluna foi mapeada para múltiplos campos.
Verifique o mapeamento.

[← Voltar]  [Próximo →]
```

---

## 💾 Exemplo 5: Histórico e Reutilização

### Histórico Automático
Cada import bem-sucedido é salvo:
```
packlist_history_{orcamentoId}: [
  {
    filename: "packlist_jan.csv",
    timestamp: 1737905420000,
    totalLines: 45,
    successLines: 45,
    importedAt: "26/01/2025"
  },
  {
    filename: "packlist_upd.xlsx",
    timestamp: 1737910000000,
    totalLines: 50,
    successLines: 50,
    importedAt: "26/01/2025"
  }
]
```

---

## 🎯 Exemplo 6: Casos de Uso Reais

### Case 1: Importação de Manifesto de Carga
```
Entrada: Arquivo XLSX com lista de containers
├─ Coluna A: Número do Container
├─ Coluna B: Quantidade de itens
├─ Coluna C: Peso total (kg)
└─ Coluna D: Volume (m³)

Processamento:
1. Seleciona linha 1 (cabeçalho)
2. Mapeia: Descrição←A, Volumes←B, Peso←C, CBM←D
3. Confirma e importa 50 containers

Resultado: Dados disponíveis para orcamento
```

### Case 2: Importação de Packlist de Fornecedor
```
Entrada: Arquivo CSV recebido por email
├─ Headers em português
├─ Dados desorganizados
└─ Algumas linhas em branco

Processamento:
1. Abre arquivo com encoding automático
2. Seleciona linha com headers corretos
3. Mapeia apenas colunas necessárias
4. Descarta linhas em branco automaticamente

Resultado: Dados limpos e prontos para análise
```

---

## 📝 Validação de Dados

### Formatos Aceitos
```typescript
✅ Descrição: Texto (qualquer valor)
✅ Volumes: Número (convertido de string)
✅ Peso: Número (convertido de string)
✅ CBM: Número (convertido de string)

❌ Colunas duplicadas
❌ Linhas vazias após cabeçalho
❌ Caracteres especiais inválidos
```

### Transformação de Dados
```typescript
// CSV fornecido:
"Produto X","100","500,50","2,5"  // Usa vírgula decimal

// Armazenado internamente:
{
  descricao: "Produto X",
  volumes: 100,        // Convertido para número
  peso: 500.50,        // Vírgula convertida para ponto
  cbm: 2.5             // Normalizado
}
```

---

## 🔧 Troubleshooting

### Problema: "Arquivo XLSX inválido"
**Causa**: Arquivo não é um ZIP válido  
**Solução**: Reexporte o arquivo no Excel

### Problema: "Nenhuma linha encontrada"
**Causa**: Arquivo vazio ou sem dados  
**Solução**: Verificar arquivo está com dados

### Problema: "Coluna mapeada múltiplas vezes"
**Causa**: Mesmo mapeamento para 2 campos  
**Solução**: Escolher colunas diferentes para cada campo

### Problema: "Linha de cabeçalho inválida"
**Causa**: Número de linha > total de linhas  
**Solução**: Selecionar linha que existe no arquivo

---

## 🚀 Próximas Features Sugeridas

### Para Usuários
1. **Edição de Dados** - Corrigir valores após import
2. **Exportação** - Download dos dados em novo formato
3. **Validação Custom** - Regras de negócio específicas

### Para Desenvolvedores
1. **API Backend** - Salvar em banco de dados
2. **Sincronização** - Múltiplos dispositivos
3. **Auditoria** - Log de quem importou o quê

---

**Última Atualização**: 2025-01-26  
**Versão**: 1.0  
**Status**: ✅ Production Ready  
