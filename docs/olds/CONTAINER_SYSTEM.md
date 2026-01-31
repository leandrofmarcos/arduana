# Sistema de Containers - Referência Rápida

> **Nota:** Para documentação técnica completa, consulte [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

## Visão Geral

O sistema de containers padroniza o uso de espaço horizontal em toda a aplicação com 5 opções reutilizáveis.

## Containers Disponíveis

| Container | Max-Width | Padding H | Uso Ideal |
|-----------|-----------|-----------|-----------|
| `container-full` | 100% | 16px | Dashboards analíticos |
| `container-wide` | 1600px | 24px | Relatórios e análises |
| `container-standard` | 1400px | 16px | **Padrão: Orçamentos, Processos, Aduana** |
| `container-compact` | 1200px | 12px | Modais, detalhes |
| `container-base` | 100% | 16px | Layouts customizados |

## Uso Rápido

```html
<div class="container-standard">
  <div class="dashboard-header">
    <h1>Título</h1>
  </div>
  
  <div class="content-section">
    <!-- Conteúdo aqui -->
  </div>
</div>
```

## Componentes Usando Container System

✅ **Aduana Dashboard** - `container-standard`
✅ **Dashboard Processos** - `container-standard`
✅ **Orçamento Detail** - `container-standard`

## Responsividade Automática

- **Desktop (>1024px):** Dimensões definidas
- **Tablet (768-1024px):** Padding ajustado
- **Mobile (<768px):** Padding reduzido, grids em coluna única

---

Para detalhes técnicos completos, cores, espaçamento, e guias de construção, consulte **DESIGN_SYSTEM.md**
