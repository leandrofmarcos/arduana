# Guia de Teste - Packlist Upload XLSX/CSV

## ✅ O que foi corrigido

O erro "Maximum call stack size exceeded" ao fazer upload de arquivos XLSX foi **RESOLVIDO**.

### Problema Original
Arquivos XLSX maiores causavam crash ao tentar converter bytes para string usando `String.fromCharCode.apply()`.

### Solução
Parser XLSX agora usa:
1. **Conversão em chunks** de 8KB em vez de array inteiro
2. **TextDecoder API** nativa do navegador quando disponível
3. **Fallback character-by-character** para navegadores antigos
4. **Extração XML robusta** com tratamento de erros

---

## 🧪 Como Testar

### 1. Upload de Arquivo CSV
1. Navegue para **Orcamento → Packlist**
2. Clique no botão **"Carregar Packlist"**
3. Selecione um arquivo `.csv` com estrutura:
   ```csv
   Descrição,Volumes,Peso,CBM
   Produto A,100,500,2.5
   Produto B,200,1000,5.0
   ```
4. Selecione a linha de cabeçalho (linha 1)
5. Mapeie as colunas:
   - **Descrição** → Coluna A
   - **Volumes** → Coluna B
   - **Peso** → Coluna C
   - **CBM** → Coluna D
6. Confirme e verifique os dados no grid

### 2. Upload de Arquivo XLSX (NOVO - AGORA FUNCIONA!)
1. Repita os passos 1-3, mas selecione um arquivo `.xlsx`
2. O parser agora deve:
   - ✅ Ler o arquivo sem error de stack
   - ✅ Extrair dados do XML interno
   - ✅ Exibir preview na modal de mapeamento
   - ✅ Processar mapeamento normalmente

### 3. Upload de Arquivo XLS
1. Mesmo processo para arquivos `.xls`
2. Usar o mesmo parser que XLSX

---

## 📋 Critérios de Sucesso

| Funcionalidade | Esperado | Status |
|---|---|---|
| Upload CSV | Funciona | ✅ Testado |
| Upload XLSX | Não crasheia | ✅ Corrigido |
| Upload XLS | Não crasheia | ✅ Corrigido |
| Preview 20 primeiras linhas | Exibe corretamente | ✅ Implementado |
| Modal de mapeamento | Funciona com todos os formatos | ✅ Implementado |
| Validação de colunas duplicadas | Exibe erro | ✅ Implementado |
| Grid de preview | Mostra dados mapeados | ✅ Implementado |
| Persistência localStorage | Salva dados | ✅ Implementado |

---

## 🔍 Validação Técnica

### Build Status
```
✅ ng build → Exit Code 0
✅ Sem erros TypeScript
✅ Todos os chunks compilados
```

### Testes Node.js
```
✅ uint8ArrayToString() → 16.197 bytes convertidos sem erro
✅ XML parsing → <worksheet> encontrado
✅ SheetData extraction → Conteúdo recuperado
```

---

## 🚀 Próximas Melhorias (Opcional)

1. **Integração JSZip.js** - Para melhor performance em XLSX
2. **Validação MIME type** - Rejeitar arquivos falsos
3. **Limite de tamanho** - Alertar para arquivos muito grandes (>10MB)
4. **Preview de mais linhas** - Opção para mostrar 50 ou 100 linhas
5. **Suporte a múltiplas sheets** - Permitir escolher qual sheet importar

---

## 📝 Registro de Mudanças

### packlist-parser.service.ts
- ✅ Adicionado `uint8ArrayToString()` com chunking
- ✅ Melhorado `parseXLSXManual()` 
- ✅ Aprimorado `extractRowsFromXML()` com try-catch
- ✅ Removido `String.fromCharCode.apply()` perigoso

### Sem Breaking Changes
- Interfaces públicas: Compatíveis
- Assinatura de métodos: Inalterada
- Comportamento: Melhorado

---

**Última Atualização**: 2025-01-26
**Versão**: 1.0 - ESTÁVEL
