import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PlanilhasService } from '../planilhas/planilhas.service';

@Component({
  selector: 'app-versoes-processo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="content">
      <div class="card">
        <h2>Versões do Processo</h2>
        <div class="meta">{{meta?.produto}} · {{meta?.cliente}} · {{meta?.processo}} · Fase: {{meta?.faseAtual || '—'}}</div>
        <table class="grid">
          <thead><tr><th>#</th><th>Fase</th><th>Data</th></tr></thead>
          <tbody>
            <tr *ngFor="let v of versions; let i = index">
              <td>{{i+1}}</td>
              <td>{{v.fase}}</td>
              <td>{{v.createdAt | date:'short'}}</td>
            </tr>
          </tbody>
        </table>
        <div class="actions">
          <a class="btn" [routerLink]="['/processos']">Voltar</a>
          <a class="btn btn-primary" [routerLink]="['/importacao']">Abrir Editor</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.content{padding:24px}`,
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:16px}`,
    `.grid{width:100%;border-collapse:collapse;margin-top:12px}`,
    `.grid th,.grid td{padding:10px;border-bottom:1px solid var(--color-border);text-align:left}`,
    `.actions{display:flex;gap:10px;margin-top:12px}`,
    `.btn{padding:10px 14px;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff;border:none}`,
    `.meta{color:var(--color-muted);margin-top:6px}`
  ]
})
export class VersoesProcessoComponent {
  private route = inject(ActivatedRoute);
  private s = inject(PlanilhasService);
  id = '';
  versions: Array<{ id: string; fase: string; createdAt: string }> = [];
  meta: any;
  constructor(){
    this.route.params.subscribe(p => {
      this.id = p['id'];
      this.versions = this.s.versions(this.id);
      this.meta = this.s.meta(this.id);
    });
  }
}