# Planilha de Custo — Versão Normalizada

Este documento normaliza os dados e a estrutura da nossa Planilha de Custo conforme o layout da aplicação, servindo como base para exportação e conferência. Valores aqui refletem a simulação atual dos dados fake e podem ser sincronizados com o editor.

## 1. Premissas da Operação

| Campo              | Valor |
|--------------------|------:|
| FOB (USD)          | 46.110,00 |
| Frete (USD)        | 2.450,00 |
| Seguro (USD)       | 0,00 |
| THC (USD)          | 0,00 |
| Taxa USD (R$)      | 5,55 |
| Quantidade         | 1 |
| NCM                | 8423 |

- Base de cálculo em R$: `(FOB + Frete + Seguro + THC) * Taxa` = 269.508,00

## 2. Alíquotas de Impostos

| Imposto  | Alíquota |
|----------|---------:|
| II       | 14,40% |
| IPI      | 7,43% |
| ICMS     | 4,00% |
| PIS      | 2,10% |
| COFINS   | 10,65% |

Notas:
- Associadas por **perfil de alíquota** (dropdown no custo).
- O perfil padrão é preenchido automaticamente.
- O usuário pode ajustar manualmente as alíquotas a qualquer momento.

## 3. Despesas no Desembaraço

| Categoria          | Item                         | Valor (R$) |
|--------------------|------------------------------|-----------:|
| Porto              | THC - V3                     | 1.280,00 |
| Agência Marítima   | Liberação de B/L - V3        |   900,00 |
| Agência Marítima   | Frete Marítimo - V3          | 1.450,00 |

- Total Despesas: 3.630,00

## 4. Custos do Produto Importado

| Composição                      | Valor (R$) |
|---------------------------------|-----------:|
| Base de Cálculo                 | 269.508,00 |
| Imposto de Importação (II)      | 38.809,15 |
| IPI                             | 22.907,96 |
| PIS                             | 5.659,67 |
| COFINS                          | 28.702,60 |
| Total de Tributos               | 96.079,39 |
| Despesas no Desembaraço         | 3.630,00 |
| Desembolso Total                | 369.217,39 |

Observações:
- II = Base × 14,40%
- IPI = (Base + II) × 7,43%
- PIS = Base × 2,10%
- COFINS = Base × 10,65%
- Base = (FOB + Frete + Seguro + THC) × Taxa USD

## 5. Nota Fiscal de Saída

| Campo                      | Valor |
|---------------------------|------:|
| CFOP                      | — |
| CST/CSOSN                 | — |
| Alíquota ICMS             | 4,00% |
| Base ICMS                 | — |
| ICMS                      | — |

Observações:
- Preencher conforme regime tributário e operação. Integração futura calculará valores automaticamente.

## 6. Análise Conclusiva da Planilha

| Indicador                         | Valor |
|-----------------------------------|------:|
| Desembolso Total (R$)             | 369.217,39 |
| Custo Médio por Unidade (R$)      | 369.217,39 |
| Margem Sugerida (%)               | — |
| Custo + Margem (R$)               | — |

Observações:
- Quantidade atual: 1 unidade. Para múltiplas unidades, recalcular custo unitário.

## 7. Formação do Custo Unitário

| Componente                       | Valor (R$) |
|----------------------------------|-----------:|
| Custo do Produto (FOB em R$)     | 256.… |
| Impostos e Despesas              | — |
| Custo Unitário Final             | 369.217,39 |

Nota:
- Este bloco consolida custos diretos (FOB convertido) e indiretos (tributos + despesas) por unidade.

## 8. Resumo Financeiro

| Item                         | Valor (R$) |
|------------------------------|-----------:|
| Tributos                     | 96.079,39 |
| Despesas no Desembaraço      | 3.630,00 |
| Desembolso Total             | 369.217,39 |

## 9. Preços de Venda

| Faixa             | Preço (R$) |
|-------------------|-----------:|
| Preço Sugerido 1  | — |
| Preço Sugerido 2  | — |
| Preço Sugerido 3  | — |

Ajuste conforme política comercial e margens desejadas. Integração futura pode automatizar estes cálculos.

---

## Integração com Packlist

- Se o cliente possuir **template de packlist**, o custo deve carregar automaticamente:
	- Quantidade de produtos
	- Peso líquido total
	- (Opcional) FOB (USD), quando disponível
- Sem template, os campos permanecem livres para preenchimento manual.
- Os cálculos de tributos e desembolso total são atualizados automaticamente conforme alterações nas premissas, alíquotas ou despesas.

