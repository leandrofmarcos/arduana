import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechamentoService } from './fechamento.service';
import { PlanilhaService } from '../planilha/planilha.service';

@Component({
  selector: 'app-fechamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content">
      <div class="card">
        <h2>Fechamento</h2>
        <div class="meta">{{meta?.produto}} · {{meta?.cliente}} · {{meta?.processo}}</div>
        <div class="grid-3" style="margin-top:12px">
          <div class="field"><label>Valores Pagos (R$)</label><input type="number" [(ngModel)]="valoresPagos" step="0.01"></div>
          <div class="field"><label>Data de Fechamento</label><input type="date" [(ngModel)]="dataFechamento"></div>
          <div class="field"><label>Observação</label><input type="text" [(ngModel)]="observacao"></div>
          <div class="field" style="grid-column:1/-1"><label>Diferenças</label><textarea [(ngModel)]="diferencas" rows="3" style="width:100%;padding:10px;border:2px solid var(--color-border);border-radius:8px"></textarea></div>
          <div class="field" style="grid-column:1/-1"><label>Ajustes</label><textarea [(ngModel)]="ajustes" rows="3" style="width:100%;padding:10px;border:2px solid var(--color-border);border-radius:8px"></textarea></div>
        </div>
        <div class="actions grid-3" style="margin-top:12px">
          <button class="btn btn-primary" (click)="confirmar()">Confirmar Fechamento</button>
          <button class="btn btn-secondary" (click)="limpar()">Limpar</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.content{padding:24px}`,
    `.field label{font-size:12px;color:var(--color-muted);margin-bottom:6px;display:block}`,
    `.field input{padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface)}`
  ]
})
export class FechamentoComponent {
  private s = inject(FechamentoService);
  private planilha = inject(PlanilhaService);
  meta = this.s.meta();
  valoresPagos = 0; dataFechamento = ''; observacao = ''; diferencas = ''; ajustes = '';
  confirmar(){ this.s.salvar({ valoresPagos: this.valoresPagos, dataFechamento: this.dataFechamento, observacao: this.observacao, diferencas: this.diferencas, ajustes: this.ajustes }); this.planilha.finalizarImportacao(); alert('Fechamento confirmado e processo finalizado.'); }
  limpar(){ this.valoresPagos = 0; this.dataFechamento=''; this.observacao=''; this.diferencas=''; this.ajustes=''; }
}