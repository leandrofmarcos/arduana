# 🎯 PRÓXIMA FASE: USAB-010 (FINAL)

**Data**: 2026-04-22  
**Status**: 🔄 **EM EXECUÇÃO AGORA**  
**Prioridade**: 🔴 **CRÍTICA**  
**Duração**: ~3-4 horas (1 turno)  

---

## O QUE FOI FEITO (Fases 0-7)

| Fase | Escopo | Status |
|---|---|---|
| 0-7 (Core + Validação) | Todas as implementações técnicas + validação de 48 atividades | ✅ **100% CONCLUÍDO** |
| **Total implementado** | Parser universal, política global, deduplicação, popups, padrão inline (prototipo) | ✅ **100% APROVADO** |
| **Build** | 492.32 kB, 15.3s, 0 erros | ✅ **VALIDADO** |

---

## O QUE FALTA (APENAS USAB-010)

### ⚠️ ÚNICA PENDÊNCIA ESTRUTURAL

**Nome**: USAB-010 - Feedback Inline de Validação por Campo  
**Escopo**: 14 formulários  
**Status**: 🔄 **EM EXECUÇÃO**  
**Prototipo**: ✅ Pronto em `Solicitações component`

### Formulários Alvo

| Categoria | Formulários | Qtd | Tempo/form |
|---|---|---|---|
| **Cadastros** | Clientes, Portos, NCM, Navios, Despachantes | 5 | ~15 min |
| **Operação** | Solicitações (já tem), Custos, Orçamentos, Embarques | 4 | ~15 min |
| **Admin** | Cargos, Roles, Usuários | 3 | ~15 min |
| **Documentos** | Tipos, Anexos | 2 | ~15 min |
| **TOTAL** | **14 formulários** | **14** | **~3-4 horas** |

---

## COMO FAZER (Copy-Paste Pattern)

### Passo 1: Abra Solicitações (Prototipo)
```
comex133_front/src/app/v2/features/solicitacao-orcamento/pages/solicitacao-orcamento.component.ts
```

### Passo 2: Copie 3 Coisas

**1. Estado**
```typescript
apiFieldErrors: Record<string, string[]> = {};
```

**2. Métodos Helper**
```typescript
hasApiFieldError(...keys: string[]): boolean { 
  return keys.some(key => this.apiFieldErrors?.[key.toLowerCase()]?.length > 0);
}

firstApiFieldError(...keys: string[]): string { 
  return this.apiFieldErrors?.[keys[0].toLowerCase()]?.[0] || '';
}

getApiValidationSummary(): string[] {
  const allErrors = Object.values(this.apiFieldErrors).flat();
  return allErrors.slice(0, 6);
}

collectFieldErrors(err: any): void {
  if (err?.error?.details) {
    this.apiFieldErrors = this.apiErrorMapper.groupFieldErrors(err.error.details);
  }
}
```

**3. No Template (por cada campo)**
```html
<mat-error *ngIf="hasApiFieldError('email', 'emailAddress')">
  {{ firstApiFieldError('email', 'emailAddress') }}
</mat-error>
```

### Passo 3: Adapte Nomes de Campo

Mude `'email', 'emailAddress'` para os nomes reais do seu formulário.

### Passo 4: Em try/catch de operação
```typescript
try {
  // operação (criar/editar/remover)
} catch (error) {
  this.collectFieldErrors(error);
}
```

---

## PROGRESSO

```
Cadastros (5 forms):      [ ] 0/5 completos
Operação (4 forms):       [ ] 0/4 completos  
Admin (3 forms):          [ ] 0/3 completos
Documentos (2 forms):     [ ] 0/2 completos
─────────────────────────────────────
TOTAL:                    [ ] 0/14 completos

Timeline: ~3-4 horas
```

---

## CHECKLIST DE CONCLUSÃO

- [ ] Aplicado em Cadastros (5 forms)
- [ ] Aplicado em Operação (4 forms)
- [ ] Aplicado em Admin (3 forms)
- [ ] Aplicado em Documentos (2 forms)
- [ ] Build executado (ng build)
- [ ] Build PASSOU (0 erros)
- [ ] Padrão testado em 3-4 formulários amostra
- [ ] Aprovação executiva

---

## PRÓXIMO PASSO APÓS USAB-010

1. **Executar build final**
   ```bash
   cd comex133_front
   npm run build
   ```

2. **Validar sem regressions**
   - Tamanho bundle: ~492 kB (igual ou menor)
   - Tempo: ~15s
   - Erros: 0

3. **Aprovação executiva**
   - Roadmap 100% ENCERRADO
   - Pronto para produção

---

## REFERÊNCIAS RÁPIDAS

| Preciso de | Referência |
|---|---|
| Ver o padrão completo | [Solicitações component](../../comex133_front/src/app/v2/features/solicitacao-orcamento/pages/solicitacao-orcamento.component.ts) |
| Entender a arquitetura | [Seção 4.2 do Roadmap](./ROADMAP_USABILIDADE_FEEDBACK_API_FRONTEND.md#42-padrao-de-comunicacao-com-api) |
| Ver todos os detalhes | [Seção 12.A do Roadmap](./ROADMAP_USABILIDADE_FEEDBACK_API_FRONTEND.md#12a-proxima-fase-usab-010-final) |
| Resumo executivo | [RESUMO_EXECUTIVO_FASE_6_CONSOLIDADO.md](./RESUMO_EXECUTIVO_FASE_6_CONSOLIDADO.md) |

---

## ⏱️ TEMPO TOTAL ESTIMADO

```
Per formulário:     15 min
Total (14 forms):   ~3-4 horas
Build final:        ~15 seg
Aprovação:          ~30 min
─────────────────────────────
TEMPO TOTAL:        ~4-5 horas (máximo 1 turno completo)
```

---

**Status Final**: 🟢 **PRONTO PARA COMEÇAR**  
**Próximo**: Iniciar replicação em Cadastros (formulário mais simples)

