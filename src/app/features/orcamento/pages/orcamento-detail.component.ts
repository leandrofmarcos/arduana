import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PacklistService } from '../../packlist/services/packlist.service';
import { ClientesService } from '../../clientes/services/clientes.service';
import { DespachantesService } from '../../despachantes/services/despachantes.service';
import { PortosService } from '../../portos/services/portos.service';
import { FuncionariosService } from '../../funcionarios/services/funcionarios.service';
import { OrcamentoService } from '../services/orcamento.service';
import { PacklistDetalheComponent } from '../../packlist/pages/packlist-detail-new.component';
import { CustoDetailComponent } from '../../custo/pages/custo-detail.component';
import { VendaDetailComponent } from '../../venda/pages/venda-detail.component';
import { AduanaDetailComponent } from '../../aduana/pages/aduana-detail.component';
import { readJSON, keys } from '../data/storage.helper';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';

interface OrçamentoDetalhe {
  id: string;
  numero: string;
  cliente: string;
  clienteId?: string;
  despachante?: string;
  despachanteId?: string;
  portoDestino?: string;
  portoDestinoId?: string;
  funcionario?: string;
  funcionarioId?: string;
  tipoOrcamento?: string;
  tipoImportacao?: string;
  dataSaida?: string;
  dataChegada?: string;
  descricao?: string;
  codigo: string;
  data: string;
  status: string;
  criadoEm: string;
  atualizadoEm: string;
  templatePacklistId?: string;
  fases: {
    criacao: { status: 'concluido' | 'em-andamento' | 'pendente'; data: string };
    packlist: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string; itens?: number; arquivoNome?: string; arquivoCaminho?: string; nota?: string };
    custo: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string; valor?: number };
    venda: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string; valor?: number };
    aduana: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string; valor?: number };
  };
  historico: Array<{
    id: string;
    acao: string;
    usuario: string;
    data: string;
    descricao: string;
  }>;
}

interface CustoResumo {
  baseCalculo: number;
  taxaUsd: number;
  ii: number; iiValor: number;
  ipi: number; ipiValor: number;
  pis: number; pisValor: number;
  cofins: number; cofinsValor: number;
  totalTributos: number;
  totalDespesas: number;
  totalDesembaraco: number;
}

interface PacklistResumo {
  totalItens: number;
  totalVolumes: number;
  pesoBruto: number;
  pesoLiquido: number;
  cbm: number;
  arquivoNome?: string;
}

interface VendaResumo {
  custoProduto: number;
  margem: number;
  precoFinal: number;
  moeda: string;
}

@Component({
  standalone: true,
  selector: 'app-orcamento-detail-v2',
  imports: [CommonModule, RouterModule, FormsModule, PacklistDetalheComponent, CustoDetailComponent, VendaDetailComponent, AduanaDetailComponent, PageHeaderComponent],
  template: `
    <div class="container-standard" *ngIf="orcamento">

      <!-- Header -->
      <app-page-header
        icon="<i class='bi bi-file-earmark-text'></i>"
        [title]="'Orcamento ' + (orcamento.numero || '')"
        [subtitle]="'Cliente: ' + (orcamento.cliente || '-')">
      </app-page-header>

      <!-- Timeline Semaforo -->
      <div class="timeline-card">
        <div class="timeline-track">
          <div *ngFor="let phase of fases; let i = index" class="timeline-item">
            <div *ngIf="i > 0" class="timeline-connector" [ngClass]="'connector-' + fases[i-1].status"></div>
            <div class="timeline-step" [ngClass]="'status-' + phase.status">
              <div class="step-indicator">{{ getPhaseIcon(phase.status) }}</div>
            </div>
            <div class="step-label">{{ phase.label }}</div>
          </div>
        </div>
      </div>

      <!-- Capa do Orcamento -->
      <div class="section-card">
        <div class="section-title">
          <i class="bi bi-clipboard-data section-icon"></i>
          <span>Dados do Orcamento</span>
          <button class="btn-editar-capa" (click)="iniciarEdicao()" *ngIf="!modoEdicao"
            title="Editar dados do orcamento">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <div class="edit-actions" *ngIf="modoEdicao">
            <button class="btn-salvar-edicao" (click)="salvarEdicao()"><i class="bi bi-check-lg"></i> Salvar</button>
            <button class="btn-cancelar-edicao" (click)="cancelarEdicao()"><i class="bi bi-x-lg"></i> Cancelar</button>
          </div>
        </div>

        <!-- MODO VISUALIZACAO -->
        <div class="fields-grid" *ngIf="!modoEdicao">
          <div class="field-group">
            <span class="field-label">Tipo de Orcamento</span>
            <span class="field-value">
              <span *ngIf="orcamento.tipoOrcamento === 'Maritimo'" class="badge badge-blue"><i class="bi bi-ship"></i> Maritimo</span>
              <span *ngIf="orcamento.tipoOrcamento !== 'Maritimo'" class="badge badge-orange"><i class="bi bi-airplane"></i> Aereo</span>
            </span>
          </div>
          <div class="field-group">
            <span class="field-label">Tipo de Importacao</span>
            <span class="field-value">
              <span *ngIf="orcamento.tipoImportacao === 'Direta'" class="badge badge-green">Direta</span>
              <span *ngIf="orcamento.tipoImportacao === 'ContaAOrdem'" class="badge badge-purple">Conta a Ordem</span>
              <span *ngIf="!orcamento.tipoImportacao" class="field-empty">Nao informado</span>
            </span>
          </div>
          <div class="field-group">
            <span class="field-label">Codigo</span>
            <span class="field-value mono">{{ orcamento.codigo || '-' }}</span>
          </div>
          <div class="field-group">
            <span class="field-label">Criado em</span>
            <span class="field-value">{{ orcamento.criadoEm | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="field-group field-full">
            <span class="field-label"><i class="bi bi-person-circle"></i> Cliente</span>
            <span class="field-value strong">{{ orcamento.cliente || '-' }}</span>
          </div>
          <div class="field-group field-half">
            <span class="field-label"><i class="bi bi-person-workspace"></i> Despachante</span>
            <span class="field-value" *ngIf="orcamento.despachante; else ef1">{{ orcamento.despachante }}</span>
            <ng-template #ef1><span class="field-empty">Nao informado</span></ng-template>
          </div>
          <div class="field-group field-half">
            <span class="field-label"><i class="bi bi-anchor"></i> Porto Destino</span>
            <span class="field-value" *ngIf="orcamento.portoDestino; else ef2">{{ orcamento.portoDestino }}</span>
            <ng-template #ef2><span class="field-empty">Nao informado</span></ng-template>
          </div>
          <div class="field-group field-full">
            <span class="field-label"><i class="bi bi-person-badge"></i> Funcionario Responsavel</span>
            <span class="field-value" *ngIf="orcamento.funcionario; else ef3">{{ orcamento.funcionario }}</span>
            <ng-template #ef3><span class="field-empty">Nao informado</span></ng-template>
          </div>
          <div class="field-group field-half">
            <span class="field-label"><i class="bi bi-calendar-event"></i> Data de Saida</span>
            <span class="field-value" *ngIf="orcamento.dataSaida; else ef4">{{ orcamento.dataSaida | date:'dd/MM/yyyy' }}</span>
            <ng-template #ef4><span class="field-empty">Nao informado</span></ng-template>
          </div>
          <div class="field-group field-half">
            <span class="field-label"><i class="bi bi-calendar-event"></i> Data de Chegada</span>
            <span class="field-value" *ngIf="orcamento.dataChegada; else ef5">{{ orcamento.dataChegada | date:'dd/MM/yyyy' }}</span>
            <ng-template #ef5><span class="field-empty">Nao informado</span></ng-template>
          </div>
          <div class="field-group field-full" *ngIf="orcamento.descricao">
            <span class="field-label"><i class="bi bi-pencil-square"></i> Descricao</span>
            <span class="field-value descricao-text">{{ orcamento.descricao }}</span>
          </div>
        </div>

        <!-- MODO EDICAO -->
        <div class="edit-form" *ngIf="modoEdicao">
          <div class="edit-grid">

            <!-- Tipo de Orcamento -->
            <div class="edit-field-group">
              <label class="edit-label"><i class="bi bi-compass"></i> Tipo de Orcamento</label>
              <div class="radio-group">
                <label class="radio-option" [class.selected]="edicao.tipoOrcamento === 'Maritimo'">
                  <input type="radio" name="tipoOrc" value="Maritimo" [(ngModel)]="edicao.tipoOrcamento">
                  <i class="bi bi-ship"></i> Maritimo
                </label>
                <label class="radio-option" [class.selected]="edicao.tipoOrcamento === 'Aereo'">
                  <input type="radio" name="tipoOrc" value="Aereo" [(ngModel)]="edicao.tipoOrcamento">
                  <i class="bi bi-airplane"></i> Aereo
                </label>
              </div>
            </div>

            <!-- Tipo de Importacao -->
            <div class="edit-field-group">
              <label class="edit-label"><i class="bi bi-grid-3x3-gap"></i> Tipo de Importacao</label>
              <select class="edit-select" [(ngModel)]="edicao.tipoImportacao">
                <option value="">Selecione...</option>
                <option value="Direta">Direta</option>
                <option value="ContaAOrdem">Conta a Ordem</option>
              </select>
            </div>

            <!-- Despachante -->
            <div class="edit-field-group">
              <label class="edit-label"><i class="bi bi-person-workspace"></i> Despachante</label>
              <select class="edit-select" [(ngModel)]="edicao.despachanteId" (ngModelChange)="onDespachanteSelecionado($event)">
                <option value="">Selecione...</option>
                <option *ngFor="let d of despachantes" [value]="d.id">{{ d.nome }}</option>
              </select>
            </div>

            <!-- Porto Destino -->
            <div class="edit-field-group">
              <label class="edit-label"><i class="bi bi-anchor"></i> Porto Destino</label>
              <select class="edit-select" [(ngModel)]="edicao.portoDestinoId" (ngModelChange)="onPortoSelecionado($event)">
                <option value="">Selecione...</option>
                <option *ngFor="let p of portos" [value]="p.id">{{ p.nome }}</option>
              </select>
            </div>

            <!-- Funcionario -->
            <div class="edit-field-group edit-field-full">
              <label class="edit-label"><i class="bi bi-person-badge"></i> Funcionario Responsavel</label>
              <select class="edit-select" [(ngModel)]="edicao.funcionarioId" (ngModelChange)="onFuncionarioSelecionado($event)">
                <option value="">Selecione...</option>
                <option *ngFor="let f of funcionarios" [value]="f.id">{{ f.nomeCompleto }}</option>
              </select>
            </div>

            <!-- Data de Saida -->
            <div class="edit-field-group">
              <label class="edit-label"><i class="bi bi-calendar-event"></i> Data de Saida</label>
              <input type="date" class="edit-input" [(ngModel)]="edicao.dataSaida">
            </div>

            <!-- Data de Chegada -->
            <div class="edit-field-group">
              <label class="edit-label"><i class="bi bi-calendar-event"></i> Data de Chegada</label>
              <input type="date" class="edit-input" [(ngModel)]="edicao.dataChegada">
            </div>

            <!-- Descricao -->
            <div class="edit-field-group edit-field-full">
              <label class="edit-label"><i class="bi bi-pencil-square"></i> Descricao</label>
              <textarea class="edit-textarea" [(ngModel)]="edicao.descricao" rows="3"
                placeholder="Descricao do orcamento..."></textarea>
            </div>

          </div>
        </div>

      </div>

      <!-- Grid de Resumos -->
      <div class="resumos-grid">

        <!-- Resumo Packlist -->
        <div class="resumo-card" [ngClass]="'card-status-' + orcamento.fases.packlist.status">
          <div class="resumo-header">
            <div class="resumo-title"><i class="bi bi-box-seam"></i> Packlist</div>
            <div class="resumo-status-badge" [ngClass]="'status-' + orcamento.fases.packlist.status">
              {{ formatStatusLabel(orcamento.fases.packlist.status) }}
            </div>
          </div>

          <div *ngIf="packlistResumo && packlistResumo.totalItens > 0; else packlistVazio">
            <div class="resumo-metrics">
              <div class="metric">
                <span class="metric-value">{{ packlistResumo.totalItens }}</span>
                <span class="metric-label">Itens</span>
              </div>
              <div class="metric" *ngIf="packlistResumo.totalVolumes > 0">
                <span class="metric-value">{{ packlistResumo.totalVolumes }}</span>
                <span class="metric-label">Volumes</span>
              </div>
              <div class="metric" *ngIf="packlistResumo.cbm > 0">
                <span class="metric-value">{{ packlistResumo.cbm | number:'1.2-2' }}</span>
                <span class="metric-label">CBM</span>
              </div>
              <div class="metric" *ngIf="packlistResumo.pesoBruto > 0">
                <span class="metric-value">{{ packlistResumo.pesoBruto | number:'1.2-2' }}</span>
                <span class="metric-label">Peso Bruto (kg)</span>
              </div>
            </div>
            <div class="resumo-arquivo" *ngIf="packlistResumo.arquivoNome">
              <i class="bi bi-file-earmark"></i> {{ packlistResumo.arquivoNome }}
            </div>
          </div>
          <ng-template #packlistVazio>
            <div class="resumo-empty">Packlist ainda nao enviado</div>
          </ng-template>

          <button class="btn-ver-detalhes" (click)="navigarParaPacklist()">
            Ver planilha completa &rarr;
          </button>
        </div>

        <!-- Resumo Custo -->
        <div class="resumo-card" [ngClass]="'card-status-' + orcamento.fases.custo.status">
          <div class="resumo-header">
            <div class="resumo-title"><i class="bi bi-cash-coin"></i> Custo</div>
            <div class="resumo-status-badge" [ngClass]="'status-' + orcamento.fases.custo.status">
              {{ formatStatusLabel(orcamento.fases.custo.status) }}
            </div>
          </div>

          <div *ngIf="custoResumo; else custoVazio">
            <div class="financeiro-table">
              <div class="financeiro-section-label">Base de Calculo</div>
              <div class="financeiro-row">
                <span>Base de Calculo (CIF)</span>
                <span class="value-brl">R$ {{ formatCurrency(custoResumo.baseCalculo) }}</span>
              </div>
              <div class="financeiro-section-label mt-8">Impostos de Importacao</div>
              <div class="financeiro-row">
                <span>II ({{ custoResumo.ii | number:'1.0-2' }}%)</span>
                <span class="value-brl">R$ {{ formatCurrency(custoResumo.iiValor) }}</span>
              </div>
              <div class="financeiro-row">
                <span>IPI ({{ custoResumo.ipi | number:'1.0-2' }}%)</span>
                <span class="value-brl">R$ {{ formatCurrency(custoResumo.ipiValor) }}</span>
              </div>
              <div class="financeiro-row">
                <span>PIS ({{ custoResumo.pis | number:'1.0-2' }}%)</span>
                <span class="value-brl">R$ {{ formatCurrency(custoResumo.pisValor) }}</span>
              </div>
              <div class="financeiro-row">
                <span>COFINS ({{ custoResumo.cofins | number:'1.0-2' }}%)</span>
                <span class="value-brl">R$ {{ formatCurrency(custoResumo.cofinsValor) }}</span>
              </div>
              <div class="financeiro-row subtotal">
                <span>Total Tributos</span>
                <span class="value-brl">R$ {{ formatCurrency(custoResumo.totalTributos) }}</span>
              </div>
              <div class="financeiro-section-label mt-8">Despesas de Desembaraco</div>
              <div class="financeiro-row">
                <span>Total Despesas</span>
                <span class="value-brl">R$ {{ formatCurrency(custoResumo.totalDespesas) }}</span>
              </div>
              <div class="financeiro-row total">
                <span>Total Desembaraco</span>
                <span class="value-brl highlight">R$ {{ formatCurrency(custoResumo.totalDesembaraco) }}</span>
              </div>
            </div>
          </div>
          <ng-template #custoVazio>
            <div class="resumo-empty" *ngIf="orcamento.fases.packlist.status !== 'concluido'">
              Disponivel apos concluir o Packlist
            </div>
            <div class="resumo-empty" *ngIf="orcamento.fases.packlist.status === 'concluido'">
              Custo ainda nao preenchido
            </div>
          </ng-template>

          <button class="btn-ver-detalhes"
            [ngClass]="{'disabled': orcamento.fases.packlist.status !== 'concluido'}"
            (click)="navigarParaCusto()">
            Ver planilha de custo &rarr;
          </button>
        </div>

        <!-- Resumo Venda -->
        <div class="resumo-card" [ngClass]="'card-status-' + orcamento.fases.venda.status">
          <div class="resumo-header">
            <div class="resumo-title"><i class="bi bi-tag"></i> Venda</div>
            <div class="resumo-status-badge" [ngClass]="'status-' + orcamento.fases.venda.status">
              {{ formatStatusLabel(orcamento.fases.venda.status) }}
            </div>
          </div>

          <div *ngIf="vendaResumo; else vendaVazio">
            <div class="financeiro-table">
              <div class="financeiro-row">
                <span>Custo do Produto</span>
                <span class="value-brl">R$ {{ formatCurrency(vendaResumo.custoProduto) }}</span>
              </div>
              <div class="financeiro-row">
                <span>Margem</span>
                <span class="value-brl">{{ vendaResumo.margem | number:'1.2-2' }}%</span>
              </div>
              <div class="financeiro-row total">
                <span>Preco de Venda</span>
                <span class="value-brl highlight">{{ vendaResumo.moeda }} {{ formatCurrency(vendaResumo.precoFinal) }}</span>
              </div>
            </div>
          </div>
          <ng-template #vendaVazio>
            <div class="resumo-empty" *ngIf="orcamento.fases.custo.status !== 'concluido'">
              Disponivel apos concluir o Custo
            </div>
            <div class="resumo-empty" *ngIf="orcamento.fases.custo.status === 'concluido'">
              Venda ainda nao preenchida
            </div>
          </ng-template>

          <button class="btn-ver-detalhes"
            [ngClass]="{'disabled': orcamento.fases.custo.status !== 'concluido'}"
            (click)="navigarParaVenda()">
            Ver planilha de venda &rarr;
          </button>
        </div>

        <!-- Card Aduana -->
        <div class="resumo-card" [ngClass]="podeIrAduana() ? 'card-status-' + orcamento.fases.aduana.status : 'card-locked'">
          <div class="resumo-header">
            <div class="resumo-title"><i class="bi bi-shield-shaded"></i> Aduana</div>
            <div class="resumo-status-badge" [ngClass]="'status-' + orcamento.fases.aduana.status">
              {{ formatStatusLabel(orcamento.fases.aduana.status) }}
            </div>
          </div>

          <div *ngIf="!podeIrAduana()" class="locked-message">
            <div class="lock-icon"><i class="bi bi-lock-fill"></i></div>
            <div class="lock-text">Disponivel apos concluir Packlist, Custo e Venda</div>
            <div class="lock-checklist">
              <div class="lock-check" [ngClass]="orcamento.fases.packlist.status === 'concluido' ? 'done' : 'pending'">
                <span *ngIf="orcamento.fases.packlist.status === 'concluido'"><i class="bi bi-check-circle-fill"></i></span>
                <span *ngIf="orcamento.fases.packlist.status !== 'concluido'"><i class="bi bi-circle"></i></span>
                Packlist
              </div>
              <div class="lock-check" [ngClass]="orcamento.fases.custo.status === 'concluido' ? 'done' : 'pending'">
                <span *ngIf="orcamento.fases.custo.status === 'concluido'"><i class="bi bi-check-circle-fill"></i></span>
                <span *ngIf="orcamento.fases.custo.status !== 'concluido'"><i class="bi bi-circle"></i></span>
                Custo
              </div>
              <div class="lock-check" [ngClass]="orcamento.fases.venda.status === 'concluido' ? 'done' : 'pending'">
                <span *ngIf="orcamento.fases.venda.status === 'concluido'"><i class="bi bi-check-circle-fill"></i></span>
                <span *ngIf="orcamento.fases.venda.status !== 'concluido'"><i class="bi bi-circle"></i></span>
                Venda
              </div>
            </div>
          </div>
          <div *ngIf="podeIrAduana() && orcamento.fases.aduana.status === 'pendente'" class="resumo-empty">
            Processo aduaneiro ainda nao iniciado
          </div>

          <button class="btn-ver-detalhes"
            [ngClass]="{'disabled': !podeIrAduana()}"
            [disabled]="!podeIrAduana()"
            (click)="navigarParaAduana()">
            Ver processo aduaneiro &rarr;
          </button>
        </div>

      </div>

      <!-- Alertas -->
      <div class="alerts-panel" *ngIf="interacoes.length">
        <div class="alert-card" *ngFor="let alerta of interacoes" [ngClass]="'level-' + alerta.nivel">
          <div class="alert-title">{{ alerta.titulo }}</div>
          <div class="alert-desc">{{ alerta.descricao }}</div>
          <button *ngIf="alerta.acao" class="alert-action" (click)="onAlertAction(alerta)">{{ alerta.acao.label }}</button>
        </div>
      </div>

    </div>

    <!-- Modo Packlist -->
    <div *ngIf="modo === 'packlist'" class="modal-backdrop">
      <div class="modal modal-xl">
        <app-packlist-detalhe [orcamentoId]="orcamento?.id || ''" (voltarClicked)="voltarParaOverview()"></app-packlist-detalhe>
      </div>
    </div>

    <!-- Modo Custo -->
    <div *ngIf="modo === 'custo'" class="modal-backdrop">
      <div class="modal modal-xl">
        <app-custo-detail [orcamentoIdInput]="orcamento?.id || ''" (voltarClicked)="voltarParaOverview()"></app-custo-detail>
      </div>
    </div>

    <!-- Modo Venda -->
    <div *ngIf="modo === 'venda'" class="modal-backdrop">
      <div class="modal modal-xl">
        <app-venda-detail [orcamentoIdInput]="orcamento?.id || ''" (voltarClicked)="voltarParaOverview()"></app-venda-detail>
      </div>
    </div>

    <!-- Modo Aduana -->
    <div *ngIf="modo === 'aduana'" class="modal-backdrop">
      <div class="modal modal-xl">
        <app-aduana-detail [orcamentoIdInput]="orcamento?.id || ''" (voltarClicked)="voltarParaOverview()"></app-aduana-detail>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Layout ===== */
    .container-standard {
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    /* ===== Timeline ===== */
    .timeline-card {
      background: white;
      padding: 24px 32px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 1px 8px rgba(15,23,42,0.04);
      border: 1px solid #e2e8f0;
    }

    .timeline-track {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
    }

    .timeline-item {
      flex: 1;
      text-align: center;
      position: relative;
    }

    .timeline-connector {
      position: absolute;
      top: 22px;
      left: -50%;
      width: 100%;
      height: 3px;
      background: #e5e7eb;
      z-index: 0;
    }
    .timeline-connector.connector-concluido { background: #a7f3d0; }
    .timeline-connector.connector-em-andamento { background: #a5b4fc; }

    .timeline-step {
      display: flex;
      justify-content: center;
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
    }

    .step-indicator {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      background: #f1f5f9;
      color: #94a3b8;
      border: 3px solid #e2e8f0;
      transition: all 0.2s;
    }

    .timeline-step.status-concluido .step-indicator {
      background: #059669; color: white; border-color: #047857;
    }
    .timeline-step.status-em-andamento .step-indicator {
      background: #4f46e5; color: white; border-color: #4338ca;
      animation: pulse 2s infinite;
    }

    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

    .step-label {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-top: 6px;
    }

    /* ===== Section Card (Capa) ===== */
    .section-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 1px 8px rgba(15,23,42,0.04);
      border: 1px solid #e2e8f0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 2px solid #f1f5f9;
    }

    .section-icon {
      font-size: 18px;
      color: #4f46e5;
    }

    .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field-full { grid-column: 1 / -1; }
    .field-half { grid-column: span 1; }

    .field-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .field-label i { color: #818cf8; font-size: 13px; }

    .field-value {
      font-size: 15px;
      color: #1e293b;
      font-weight: 500;
    }

    .field-value.strong { font-size: 16px; font-weight: 700; color: #0f172a; }
    .field-value.mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; letter-spacing: 0.06em; color: #4f46e5; background: #eef2ff; padding: 2px 8px; border-radius: 4px; }
    .field-value.descricao-text {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .field-empty {
      font-size: 14px;
      color: #cbd5e1;
      font-style: italic;
    }

    .section-title i {
      color: #6366f1;
      font-size: 17px;
    }
    .btn-editar-capa {
      margin-left: auto;
      padding: 6px 14px;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 8px;
      color: #4338ca;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .btn-editar-capa:hover { background: #e0e7ff; border-color: #a5b4fc; color: #3730a3; }

    .edit-actions { margin-left: auto; display: flex; gap: 8px; }
    .btn-salvar-edicao {
      padding: 6px 16px;
      background: #059669;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .btn-salvar-edicao:hover { background: #047857; }
    .btn-cancelar-edicao {
      padding: 6px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #64748b;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .btn-cancelar-edicao:hover { background: #f1f5f9; border-color: #cbd5e1; }

    .edit-form { margin-top: 4px; }
    .edit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .edit-field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .edit-field-full { grid-column: 1 / -1; }
    .edit-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .edit-label i { color: #818cf8; font-size: 13px; }
    .edit-input,
    .edit-select,
    .edit-textarea {
      padding: 9px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      color: #1e293b;
      background: #f8fafc;
      transition: border-color 0.15s, box-shadow 0.15s;
      width: 100%;
      box-sizing: border-box;
    }
    .edit-input:focus,
    .edit-select:focus,
    .edit-textarea:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
      background: white;
    }
    .edit-textarea { resize: vertical; min-height: 72px; }
    .radio-group {
      display: flex;
      gap: 10px;
    }
    .radio-option {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #475569;
      background: #f8fafc;
      transition: all 0.15s;
      user-select: none;
    }
    .radio-option input[type="radio"] { display: none; }
    .radio-option.selected {
      background: #eef2ff;
      border-color: #6366f1;
      color: #3730a3;
      font-weight: 700;
    }
    .radio-option:hover:not(.selected) { background: #f5f3ff; border-color: #c7d2fe; }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .badge-blue   { background: #eef2ff; color: #3730a3; }
    .badge-green  { background: #ecfdf5; color: #065f46; }
    .badge-purple { background: #f5f3ff; color: #4c1d95; }
    .badge-orange { background: #fffbeb; color: #78350f; }

    /* ===== Resumos Grid ===== */
    .resumos-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .resumo-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 1px 8px rgba(15,23,42,0.04);
      border: 1px solid #e2e8f0;
      border-top: 3px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .resumo-card:hover {
      box-shadow: 0 4px 12px rgba(15,23,42,0.1);
    }

    .resumo-card.card-status-concluido { border-top-color: #059669; }
    .resumo-card.card-status-em-andamento { border-top-color: #4f46e5; }
    .resumo-card.card-locked { border-top-color: #cbd5e1; background: #f8fafc; }

    .resumo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .resumo-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .resumo-title i { color: #6366f1; font-size: 16px; }

    .resumo-status-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .resumo-status-badge.status-concluido  { background: #ecfdf5; color: #065f46; }
    .resumo-status-badge.status-em-andamento { background: #eef2ff; color: #3730a3; }
    .resumo-status-badge.status-pendente   { background: #f1f5f9; color: #64748b; }

    /* Metrics (packlist) */
    .resumo-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
      gap: 12px;
    }

    .metric {
      text-align: center;
      padding: 12px 8px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
    }

    .metric-value {
      display: block;
      font-size: 22px;
      font-weight: 800;
      color: #4f46e5;
    }

    .metric-label {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .resumo-arquivo {
      font-size: 12px;
      color: #64748b;
      background: #f1f5f9;
      padding: 6px 10px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Financeiro table */
    .financeiro-table {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .financeiro-section-label {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 4px;
      padding-bottom: 4px;
      border-bottom: 1px solid #f1f5f9;
    }

    .mt-8 { margin-top: 8px; }

    .financeiro-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 6px;
      border-radius: 4px;
      font-size: 13px;
      color: #475569;
    }

    .financeiro-row:hover { background: #f8fafc; }

    .financeiro-row.subtotal {
      font-weight: 700;
      color: #1e293b;
      background: #f1f5f9;
      border-radius: 6px;
      padding: 7px 10px;
      margin-top: 4px;
    }

    .financeiro-row.total {
      font-weight: 800;
      background: #ecfdf5;
      border-radius: 6px;
      padding: 10px 10px;
      margin-top: 8px;
      border: 1px solid #a7f3d0;
    }

    .value-brl { font-weight: 600; font-variant-numeric: tabular-nums; color: #334155; }
    span.highlight { color: #059669; font-size: 15px; font-weight: 700; }

    .resumo-empty {
      font-size: 13px;
      color: #94a3b8;
      font-style: italic;
      text-align: center;
      padding: 16px 0;
    }

    /* Locked (Aduana) */
    .locked-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
    }
    .lock-icon { font-size: 28px; color: #94a3b8; }
    .lock-text { font-size: 12px; color: #94a3b8; text-align: center; }
    .lock-checklist { display: flex; flex-direction: column; gap: 4px; align-self: stretch; padding: 0 8px; }
    .lock-check { font-size: 12px; padding: 4px 6px; border-radius: 4px; display: flex; align-items: center; gap: 6px; }
    .lock-check.done { color: #059669; font-weight: 600; background: #ecfdf5; }
    .lock-check.pending { color: #94a3b8; }

    /* Botão ver detalhes */
    .btn-ver-detalhes {
      width: 100%;
      padding: 10px;
      background: transparent;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      color: #4f46e5;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
      margin-top: auto;
    }
    .btn-ver-detalhes:hover:not(.disabled) {
      background: #eef2ff;
      border-color: #a5b4fc;
      color: #3730a3;
    }
    .btn-ver-detalhes.disabled, .btn-ver-detalhes:disabled {
      color: #cbd5e1;
      cursor: not-allowed;
      border-color: #f1f5f9;
    }

    /* Alertas */
    .alerts-panel {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .alert-card {
      border-radius: 10px;
      padding: 14px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
    }
    .alert-card.level-warning { background: #fff7ed; border-color: #fdba74; }
    .alert-card.level-danger { background: #fef2f2; border-color: #fecdd3; }
    .alert-card.level-info { background: #eff6ff; border-color: #bfdbfe; }
    .alert-title { font-weight: 700; color: #1f2937; margin-bottom: 6px; }
    .alert-desc { color: #4b5563; font-size: 13px; margin-bottom: 8px; }
    .alert-action {
      padding: 6px 10px; border-radius: 6px; border: none;
      background: #4f46e5; color: #fff; cursor: pointer; font-weight: 600;
    }
    .alert-action:hover { background: #4338ca; }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }

    .modal {
      width: min(1200px, 96vw);
      max-height: 92vh;
      overflow: auto;
      background: var(--color-surface, white);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .fields-grid { grid-template-columns: 1fr; }
      .field-full, .field-half { grid-column: span 1; }
      .resumos-grid { grid-template-columns: 1fr; }
      .timeline-track { flex-wrap: wrap; gap: 12px; justify-content: center; }
      .timeline-connector { display: none; }
    }
  `]
})
export class OrçamentoDetailComponentV2 implements OnInit {
  orcamento: OrçamentoDetalhe | null = null;
  interacoes: Array<{ id: string; titulo: string; descricao: string; nivel: 'info' | 'warning' | 'danger'; acao?: { label: string; rota: any[]; query?: Record<string, any> } }> = [];
  modo: 'overview' | 'packlist' | 'custo' | 'venda' | 'aduana' = 'overview';
  modoEdicao = false;

  custoResumo: CustoResumo | null = null;
  packlistResumo: PacklistResumo | null = null;
  vendaResumo: VendaResumo | null = null;

  despachantes: Array<{ id: string; nome: string; contato?: string }> = [];
  portos: Array<{ id: string; nome: string }> = [];
  funcionarios: Array<{ id: string; nomeCompleto: string }> = [];

  edicao = {
    tipoOrcamento: 'Maritimo' as 'Maritimo' | 'Aereo',
    tipoImportacao: '' as string,
    despachanteId: '' as string,
    despachante: '' as string,
    portoDestinoId: '' as string,
    portoDestino: '' as string,
    funcionarioId: '' as string,
    funcionario: '' as string,
    dataSaida: '' as string,
    dataChegada: '' as string,
    descricao: '' as string
  };

  fases = [
    { key: 'criacao',  label: 'Criação',  status: 'concluido' },
    { key: 'packlist', label: 'Packlist', status: 'pendente' },
    { key: 'custo',    label: 'Custo',    status: 'pendente' },
    { key: 'venda',    label: 'Venda',    status: 'pendente' },
    { key: 'aduana',   label: 'Aduana',   status: 'pendente' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packlistService: PacklistService,
    private clientesService: ClientesService,
    private despachantesService: DespachantesService,
    private portosService: PortosService,
    private funcionariosService: FuncionariosService,
    private orcamentoService: OrcamentoService
  ) {}

  ngOnInit(): void {
    this.despachantesService.list$().subscribe(d => this.despachantes = d);
    this.portosService.list$().subscribe(p => this.portos = p);
    this.funcionariosService.list$().subscribe(f => this.funcionarios = f);
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.carregarOrçamento(params['id']);
      }
    });
  }

  iniciarEdicao(): void {
    if (!this.orcamento) return;
    this.edicao = {
      tipoOrcamento: (this.orcamento.tipoOrcamento as 'Maritimo' | 'Aereo') || 'Maritimo',
      tipoImportacao: this.orcamento.tipoImportacao || '',
      despachanteId: this.orcamento.despachanteId || '',
      despachante: this.orcamento.despachante || '',
      portoDestinoId: this.orcamento.portoDestinoId || '',
      portoDestino: this.orcamento.portoDestino || '',
      funcionarioId: this.orcamento.funcionarioId || '',
      funcionario: this.orcamento.funcionario || '',
      dataSaida: this.orcamento.dataSaida ? this.orcamento.dataSaida.substring(0, 10) : '',
      dataChegada: this.orcamento.dataChegada ? this.orcamento.dataChegada.substring(0, 10) : '',
      descricao: this.orcamento.descricao || ''
    };
    this.modoEdicao = true;
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
  }

  salvarEdicao(): void {
    if (!this.orcamento?.id) return;
    this.orcamentoService.update(this.orcamento.id, {
      tipoOrcamento: this.edicao.tipoOrcamento as 'Aereo' | 'Maritimo',
      tipoImportacao: this.edicao.tipoImportacao || undefined,
      despachanteId: this.edicao.despachanteId || undefined,
      despachante: this.edicao.despachante || undefined,
      portoDestinoId: this.edicao.portoDestinoId || undefined,
      portoDestino: this.edicao.portoDestino || undefined,
      funcionarioId: this.edicao.funcionarioId || undefined,
      funcionario: this.edicao.funcionario || undefined,
      dataSaida: this.edicao.dataSaida || undefined,
      dataChegada: this.edicao.dataChegada || undefined,
      descricao: this.edicao.descricao || undefined
    });
    this.modoEdicao = false;
    this.carregarOrçamento(this.orcamento.id);
  }

  onDespachanteSelecionado(id: string): void {
    const d = this.despachantes.find(x => x.id === id);
    this.edicao.despachante = d?.nome || '';
  }

  onPortoSelecionado(id: string): void {
    const p = this.portos.find(x => x.id === id);
    this.edicao.portoDestino = p?.nome || '';
  }

  onFuncionarioSelecionado(id: string): void {
    const f = this.funcionarios.find(x => x.id === id);
    this.edicao.funcionario = f?.nomeCompleto || '';
  }

  carregarOrçamento(id: string): void {
    const meta = this.getMockMetaData(id);
    const listItem = this.getListItem(id);
    const hoje = new Date();

    let nomeCliente = listItem?.cliente || meta.cliente || 'Cliente não informado';
    if (meta.clienteId && !nomeCliente) {
      this.clientesService.list$().subscribe(clientes => {
        const cliente = clientes.find(c => c.id === meta.clienteId);
        if (cliente && this.orcamento) {
          this.orcamento.cliente = cliente.nome;
        }
      });
    }

    this.orcamento = {
      id,
      numero: meta.codigo || listItem?.codigo || `ORC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      cliente: nomeCliente,
      clienteId: meta.clienteId || listItem?.clienteId,
      despachante: meta.despachante || listItem?.despachante,
      despachanteId: meta.despachanteId || listItem?.despachanteId,
      portoDestino: meta.portoDestino || listItem?.portoDestino,
      portoDestinoId: meta.portoDestinoId || listItem?.portoDestinoId,
      funcionario: meta.funcionario || listItem?.funcionario,
      funcionarioId: meta.funcionarioId || listItem?.funcionarioId,
      tipoOrcamento: meta.tipoOrcamento || listItem?.tipoOrcamento || 'Maritimo',
      tipoImportacao: meta.tipoImportacao || listItem?.tipoImportacao,
      dataSaida: meta.dataSaida || listItem?.dataSaida,
      dataChegada: meta.dataChegada || listItem?.dataChegada,
      descricao: meta.descricao || listItem?.descricao,
      codigo: meta.codigo || listItem?.codigo || '-',
      data: meta.createdAt || hoje.toISOString(),
      status: 'em-andamento',
      criadoEm: meta.createdAt || hoje.toISOString(),
      atualizadoEm: hoje.toISOString(),
      templatePacklistId: meta.templatePacklistId,
      fases: {
        criacao: { status: 'concluido', data: meta.createdAt || hoje.toISOString() },
        packlist: { status: 'pendente', itens: 0 },
        custo: { status: 'pendente', valor: 0 },
        venda: { status: 'pendente', valor: 0 },
        aduana: { status: 'pendente', valor: 0 }
      },
      historico: [{
        id: '1', acao: 'CREATE', usuario: 'Sistema',
        data: meta.createdAt || hoje.toISOString(),
        descricao: `Orçamento criado para ${nomeCliente}`
      }]
    };

    // Packlist
    const packlist = this.packlistService.getByOrcamentoId(id);
    if (packlist) {
      const itens = packlist.itens || packlist.previewItems || [];
      const totalItens = packlist.totalItems ?? itens.length ?? 0;
      const status = packlist.status || (totalItens > 0 ? 'em-andamento' : 'pendente');
      this.orcamento.fases.packlist = {
        status: status as any, itens: totalItens,
        data: packlist.enviadoEm, arquivoNome: packlist.arquivoNome
      };
      this.packlistResumo = {
        totalItens,
        totalVolumes: itens.reduce((s: number, i: any) => s + (i.quantidade || i.caixas || 0), 0),
        pesoBruto: itens.reduce((s: number, i: any) => s + (i.pesoBruto || 0), 0),
        pesoLiquido: itens.reduce((s: number, i: any) => s + (i.pesoLiquido || 0), 0),
        cbm: itens.reduce((s: number, i: any) => s + (i.cbm || i.volumeM3 || 0), 0),
        arquivoNome: packlist.arquivoNome
      };
    }

    // Custo
    const custoSnap = readJSON<any>(keys.custoSnapshot(id));
    if (custoSnap) {
      const f = custoSnap.premissas || {};
      const despesas = Array.isArray(custoSnap.despesas) ? custoSnap.despesas : [];
      const fobUsd = (f.fobUsd || 0) + (f.freteUsd || 0) + (f.seguroUsd || 0) + (f.thcUsd || 0);
      const baseCalculo = fobUsd * (f.taxaUsd || 1);
      const iiValor = baseCalculo * ((f.ii || 0) / 100);
      const ipiValor = (baseCalculo + iiValor) * ((f.ipi || 0) / 100);
      const pisValor = baseCalculo * ((f.pis || 0) / 100);
      const cofinsValor = baseCalculo * ((f.cofins || 0) / 100);
      const totalTributos = iiValor + ipiValor + pisValor + cofinsValor;
      const totalDespesas = despesas.reduce((s: number, d: any) => s + (d.valor || 0), 0);
      this.custoResumo = {
        baseCalculo, taxaUsd: f.taxaUsd || 0,
        ii: f.ii || 0, iiValor,
        ipi: f.ipi || 0, ipiValor,
        pis: f.pis || 0, pisValor,
        cofins: f.cofins || 0, cofinsValor,
        totalTributos, totalDespesas,
        totalDesembaraco: totalTributos + totalDespesas
      };
      this.orcamento.fases.custo.valor = this.custoResumo.totalDesembaraco + baseCalculo;
      this.orcamento.fases.custo.status = custoSnap.status || 'em-andamento';
    }

    // Venda
    const vendaSnap = readJSON<any>(keys.vendaSnapshot(id));
    if (vendaSnap) {
      const precoFinal = vendaSnap.precoVenda ?? vendaSnap.valorTotal ?? vendaSnap.valor ?? 0;
      const custoProduto = vendaSnap.custoProduto ?? vendaSnap.custoTotal ?? (this.orcamento.fases.custo.valor ?? 0);
      const margem = custoProduto > 0 ? ((precoFinal - custoProduto) / custoProduto) * 100 : vendaSnap.margem ?? 0;
      this.vendaResumo = { custoProduto, margem, precoFinal, moeda: vendaSnap.moeda || 'R$' };
      this.orcamento.fases.venda.valor = precoFinal;
      this.orcamento.fases.venda.status = vendaSnap.status || 'em-andamento';
    }

    // Aduana
    const aduanaSnap = readJSON<any>(keys.aduanaSnapshot(id));
    if (aduanaSnap) {
      this.orcamento.fases.aduana.valor = aduanaSnap.desembolsoTotal ?? aduanaSnap.valorTotal ?? 0;
      this.orcamento.fases.aduana.status = aduanaSnap.status || 'em-andamento';
    }

    // Atualizar fases do timeline
    this.fases = this.fases.map(f => ({
      ...f,
      status: this.orcamento?.fases[f.key as keyof typeof this.orcamento.fases]?.status || 'pendente'
    }));
    this.fases[0].status = 'concluido';

    this.interacoes = this.gerarInteracoes(id);
  }

  private getMockMetaData(id: string): any {
    const data = readJSON<any>(keys.orcamento(id));
    if (data) return data;
    return { cliente: 'Novo cliente', codigo: `ORC-${id.substring(0, 8)}`, createdAt: new Date().toISOString() };
  }

  private getListItem(id: string): any {
    const index = readJSON<any[]>(keys.orcamentosIndex()) || [];
    return index.find(item => item.id === id) || null;
  }

  private gerarInteracoes(id: string): any[] {
    const interacoes: any[] = [];
    if (this.orcamento?.fases.packlist.status === 'pendente') {
      interacoes.push({
        id: 'packlist-pendente',
        titulo: 'Enviar packlist',
        descricao: 'Inicie enviando o packlist do cliente com os itens a importar.',
        nivel: 'warning',
        acao: { label: 'Ir para packlist', rota: ['/packlist', id] }
      });
    }
    return interacoes;
  }

  getPhaseIcon(status: string): string {
    switch (status) {
      case 'concluido': return '\u2713';
      case 'em-andamento': return '\u23F3';
      default: return '\u25CB';
    }
  }

  formatStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      'concluido': 'Concluído',
      'em-andamento': 'Em Andamento',
      'pendente': 'Pendente'
    };
    return status ? (labels[status] || '-') : '-';
  }

  formatCurrency(value?: number): string {
    if (!value) return '0,00';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  navigarParaPacklist(): void { if (this.orcamento?.id) this.modo = 'packlist'; }
  navigarParaCusto(): void { if (this.orcamento?.id) this.modo = 'custo'; }
  navigarParaVenda(): void { if (this.orcamento?.id) this.modo = 'venda'; }
  navigarParaAduana(): void { if (this.orcamento?.id && this.podeIrAduana()) this.modo = 'aduana'; }

  podeIrAduana(): boolean {
    return !!(
      this.orcamento?.fases.packlist?.status === 'concluido' &&
      this.orcamento?.fases.custo?.status === 'concluido' &&
      this.orcamento?.fases.venda?.status === 'concluido'
    );
  }

  voltarParaOverview(): void {
    this.modo = 'overview';
    if (this.orcamento?.id) this.carregarOrçamento(this.orcamento.id);
  }

  onAlertAction(alerta: { acao?: { rota: any[]; query?: Record<string, any> } }): void {
    if (!alerta.acao) return;
    this.router.navigate(alerta.acao.rota, { queryParams: alerta.acao.query });
  }

  voltar(): void {
    this.router.navigate(['/orcamento']);
  }
}
