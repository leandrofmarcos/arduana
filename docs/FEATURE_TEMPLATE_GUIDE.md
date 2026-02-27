# 📋 Guia de Template para Features - Padrão Estabelecido

> **IMPORTANTE**: Este documento define o padrão consolidado e aprovado para todas as features do sistema. Qualquer modificação deve seguir estritamente este guia para manter consistência e evitar quebras.

## 🎯 Objetivo

Este guia serve como referência para validar e criar features mantendo o padrão já estabelecido. **NÃO** altere nada que não seja explicitamente solicitado.

---

## 📐 Estrutura de Arquitetura

### Estrutura de Pastas
```
src/app/features/{nome-feature}/
├── pages/
│   └── {nome}.component.ts        # Componente principal da feature
├── services/
│   └── {nome}.service.ts          # Service Angular (wrapper)
├── models/
│   └── {nome}.models.ts           # Interfaces/tipos
└── (opcional) components/         # Componentes auxiliares
```

### Arquitetura de Dados
```
src/app/
├── domain/
│   ├── {nome}.repository.ts       # Abstract class (contrato)
│   └── {nome}.models.ts           # Interfaces de domínio
├── data/
│   └── http/
│       └── {nome}.repository.http.ts  # Implementação HTTP
└── core/
    └── repository.tokens.ts       # Tokens de injeção
```

---

## 🎨 Identidade Visual e CSS

### CSS Global (styles.scss)
**SEMPRE** use as variáveis CSS globais definidas em `styles.scss`:

```scss
// Cores
--color-bg
--color-surface
--color-text
--color-border
--color-primary
--color-danger
--color-success
--gradient-primary

// Container classes
.container-standard
.content-section
.data-table
.btn
.btn-primary
.btn-secondary
.modal-backdrop
.modal
.toolbar
.search
```

### Estilos de Componente
- **Mantenha minimalista**: Use apenas estilos específicos necessários
- **NÃO duplique** estilos globais
- **NÃO crie** estilos customizados que já existem no global
- **Exemplo aprovado**:
```typescript
styles: [`
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 25px}
  .field{display:flex;flex-direction:column}
  .row-actions{display:flex;justify-content:flex-end;gap:0;align-items:center}
  .row-padrao{background:rgba(255,215,0,.1)}
`]
```

---

## 🏗️ Template de Componente

### Imports Padrão
```typescript
import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NomeEntidade } from '../models/{nome}.models';
import { NomeService } from '../services/{nome}.service';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';
```

### Pipe de Filtro
```typescript
@Pipe({name:'{nome}Filter', standalone: true})
export class NomeFilterPipe implements PipeTransform {
  transform(list: NomeEntidade[] | null, q: string){
    if(!list) return [];
    if(!q) return list;
    const s = q.toLowerCase();
    return list.filter(item => 
      (item.campo1||'').toLowerCase().includes(s) || 
      (item.campo2||'').toLowerCase().includes(s)
    );
  }
}
```

### Estrutura do Component
```typescript
@Component({
  selector: 'app-{nome}',
  standalone: true,
  imports: [CommonModule, FormsModule, NomeFilterPipe, PageHeaderComponent],
  template: `...`,
  styles: [`...`]
})
export class NomeComponent {
  private service = inject(NomeService);
  {nome}s$ = this.service.list$();
  
  // Campos do formulário
  id = '';
  campo1 = '';
  campo2 = '';
  
  // Controles
  q = '';
  showModalCadastro = false;
  modoEdicao = false;
  
  // Métodos padrão
  abrirModalCadastro(){}
  fecharModalCadastro(){}
  editar(item: NomeEntidade){}
  salvar(){}
  limpar(){}
  remove(id: string){}
}
```

---

## 📋 Template HTML

### 1. Container e Header
```html
<div class="container-standard">
  <app-page-header 
    icon="🎯" 
    title="Título da Feature" 
    subtitle="Descrição breve da funcionalidade">
    <button class="btn btn-primary" (click)="abrirModalCadastro()">+ Novo Item</button>
  </app-page-header>
```

### 2. Modal de Cadastro/Edição
```html
<div class="modal-backdrop" *ngIf="showModalCadastro">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">{{ modoEdicao ? 'Editar' : 'Novo' }} Item</div>
      <button class="btn btn-secondary" (click)="fecharModalCadastro()">Fechar</button>
    </div>
    <div class="modal-body">
      <div class="grid">
        <div class="field">
          <label>Campo 1 *</label>
          <input type="text" [(ngModel)]="campo1" placeholder="Exemplo">
        </div>
        <!-- Mais campos... -->
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" (click)="fecharModalCadastro()">Cancelar</button>
      <button class="btn btn-primary" (click)="salvar()">{{ modoEdicao ? 'Salvar' : 'Criar' }}</button>
    </div>
  </div>
</div>
```

**REGRAS DO MODAL**:
- Width: `min(900px, 95vw)` (ajustável conforme necessidade)
- Max-height: `90vh` com scroll vertical
- NÃO use `alert()` ou `confirm()` - use modals
- Grid de campos: 3 colunas (`grid-template-columns:repeat(3,1fr)`)

### 3. Seção de Conteúdo com Busca e Grid
```html
<div class="content-section">
  <div class="toolbar">
    <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar..." />
  </div>
  
  <table class="data-table">
    <thead>
      <tr>
        <th>Coluna 1</th>
        <th>Coluna 2</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let item of (items$ | async) | {nome}Filter:q">
        <td>{{ item.campo1 }}</td>
        <td>{{ item.campo2 }}</td>
        <td>
          <div class="row-actions">
            <button class="btn-icon" title="Editar" (click)="editar(item)">✏️</button>
            <button class="btn-icon danger" title="Excluir" (click)="remove(item.id)">🗑️</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**REGRAS DA GRID**:
- Use `data-table` (classe global)
- Última coluna sempre para ações (alinhada à direita)
- Use `row-actions` para agrupar botões
- Width da coluna de ações: `160px` (ajustável)

---

## 🎨 Ícones Padrão

Use emojis para manter consistência:

| Ação | Ícone | Classe CSS |
|------|-------|------------|
| Editar | ✏️ | `btn-icon` |
| Excluir | 🗑️ | `btn-icon danger` |
| Visualizar | 👁️ | `btn-icon` |
| Adicionar | + (no botão) | `btn btn-primary` |
| Confirmar | ✓ | - |
| Padrão/Favorito | ⭐ | `btn-icon active` |
| Buscar | 🔎 (no placeholder) | - |

---

## 🔌 Integração com API

### Service (Wrapper Angular)
```typescript
import { Injectable, inject } from '@angular/core';
import { NOME_REPOSITORY } from '../../../core/repository.tokens';
import { NomeRepository } from '../../../domain/{nome}.repository';
import { Observable } from 'rxjs';
import { NomeEntidade } from '../models/{nome}.models';

@Injectable({ providedIn: 'root' })
export class NomeService {
  private repo = inject<NomeRepository>(NOME_REPOSITORY);
  
  list$(): Observable<NomeEntidade[]> { 
    return this.repo.list$(); 
  }
  
  create(data: Omit<NomeEntidade,'id'>){ 
    return this.repo.create(data); 
  }
  
  update(id: string, data: Partial<Omit<NomeEntidade,'id'>>){ 
    this.repo.update(id, data); 
  }
  
  remove(id: string){ 
    this.repo.remove(id); 
  }
}
```

### Repository HTTP
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NomeRepository } from '../../domain/{nome}.repository';
import { NomeEntidade } from '../../domain/{nome}.models';
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpNomeRepository extends NomeRepository {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/{nome}s`;

  list$(): Observable<NomeEntidade[]> {
    return this.http.get<NomeEntidade[]>(this.apiUrl);
  }

  create(data: Omit<NomeEntidade,'id'>): string {
    this.http.post(this.apiUrl, data).subscribe();
    return '';
  }

  update(id: string, data: Partial<Omit<NomeEntidade,'id'>>): void {
    this.http.put(`${this.apiUrl}/${id}`, data).subscribe();
  }

  remove(id: string): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe();
  }
}
```

### Configuração no app.config.ts
```typescript
import { NOME_REPOSITORY } from './core/repository.tokens';
import { HttpNomeRepository } from './data/http/{nome}.repository.http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    { provide: NOME_REPOSITORY, useClass: HttpNomeRepository }
  ]
};
```

---

## ✅ Métodos CRUD no Componente

### Abrir Modal para Novo
```typescript
abrirModalCadastro(){ 
  this.limpar(); 
  this.modoEdicao = false; 
  this.showModalCadastro = true; 
}
```

### Editar
```typescript
editar(item: NomeEntidade){ 
  this.id = item.id;
  this.campo1 = item.campo1; 
  this.campo2 = item.campo2;
  this.modoEdicao = true; 
  this.showModalCadastro = true; 
}
```

### Salvar (Create/Update)
```typescript
salvar(){ 
  if(!this.campo1) return; // Validação básica
  
  if(this.modoEdicao){
    this.service.update(this.id, { 
      campo1: this.campo1,
      campo2: this.campo2
    });
  } else {
    this.service.create({ 
      campo1: this.campo1,
      campo2: this.campo2
    }); 
  }
  
  this.limpar(); 
  this.showModalCadastro = false; 
}
```

### Remover
```typescript
remove(id: string){ 
  this.service.remove(id); 
}
```

### Limpar Formulário
```typescript
limpar(){ 
  this.id = '';
  this.campo1 = ''; 
  this.campo2 = '';
}
```

---

## 🚫 O QUE NÃO FAZER

### ❌ NÃO use alert() ou confirm()
```typescript
// ERRADO
if(confirm('Deseja excluir?')){ ... }
alert('Salvo com sucesso!');

// CERTO
// Use modais ou toast notifications (se implementado)
```

### ❌ NÃO crie CSS customizado desnecessário
```typescript
// ERRADO - Duplicando estilos globais
styles: [`
  .container { padding: 2rem; max-width: 1400px; }
  .page-header { display: flex; justify-content: space-between; }
`]

// CERTO - Use classes globais
template: `<div class="container-standard">...</div>`
```

### ❌ NÃO altere layout sem solicitação
```typescript
// Se o padrão é modal, mantenha modal
// Se o padrão é grid 3 colunas, mantenha 3 colunas
// NÃO mude para 2 ou 4 colunas sem ser pedido
```

### ❌ NÃO crie validações complexas não solicitadas
```typescript
// ERRADO - Validação não pedida
if(this.campo1.length < 5 || !this.campo1.match(/^[A-Z]/)){...}

// CERTO - Validação simples conforme necessário
if(!this.campo1) return;
```

---

## 📝 Checklist de Validação

Antes de finalizar uma feature, verifique:

- [ ] Usa `container-standard` e `content-section`
- [ ] Usa `PageHeaderComponent` com ícone, título e subtitle
- [ ] Modal com largura adequada (`min(900px, 95vw)`)
- [ ] Grid de formulário com 3 colunas
- [ ] Busca com placeholder `🔎 Buscar...`
- [ ] Tabela usa classe `data-table`
- [ ] Coluna de ações alinhada à direita
- [ ] Ícones padrão (✏️, 🗑️)
- [ ] Service injeta Repository via token
- [ ] HttpRepository implementa contrato
- [ ] NÃO usa `alert()` ou `confirm()`
- [ ] NÃO duplica CSS global
- [ ] Métodos CRUD seguem padrão estabelecido

---

## 🎯 Exemplos de Referência

Consulte estas features como referência do padrão aprovado:

1. **Portos** - `src/app/features/portos/pages/portos.component.ts`
2. **Clientes** - `src/app/features/clientes/pages/clientes.component.ts`
3. **Alíquotas** - `src/app/features/aliquotas/pages/aliquotas.component.ts`

---

## 📌 Regras de Modificação

### Quando Modificar uma Feature:

1. **Leia a solicitação com atenção**
2. **Faça APENAS o que foi pedido**
3. **NÃO altere** o que não foi mencionado
4. **Mantenha** a estrutura existente
5. **Use** os padrões deste guia
6. **Valide** com o checklist acima

### Em Caso de Dúvida:

- **Consulte** este documento
- **Revise** as features de referência
- **Mantenha** o padrão existente
- **Pergunte** antes de assumir

---

## 🔄 Versionamento

**Versão**: 1.0  
**Data**: 10/02/2026  
**Status**: ✅ Aprovado e Consolidado

---

> **LEMBRE-SE**: Este é o padrão estabelecido e aprovado. Qualquer desvio deve ser explicitamente solicitado e justificado.
