import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PlanilhasService } from '../planilhas/planilhas.service';

@Component({
  selector: 'app-comparar-versoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content">
      <div class="card">
        <h2>Comparar Versões</h2>
        <div class="meta">{{meta?.produto}} · {{meta?.cliente}} · {{meta?.processo}}</div>
        <div class="grid-3" style="margin-top:12px">
          <div class="field"><label>Versão A</label><select [(ngModel)]="vidA" (ngModelChange)="load()"><option *ngFor="let v of versions" [value]="v.id">{{v.fase}} · {{v.createdAt | date:'short'}}</option></select></div>
          <div class="field"><label>Versão B</label><select [(ngModel)]="vidB" (ngModelChange)="load()"><option *ngFor="let v of versions" [value]="v.id">{{v.fase}} · {{v.createdAt | date:'short'}}</option></select></div>
        </div>
      </div>

      <div class="card" style="margin-top:16px" *ngIf="a && b">
        <h3>Resumo</h3>
        <table class="grid">
          <thead><tr><th>Campo</th><th>Versão A</th><th>Versão B</th><th>Δ</th></tr></thead>
          <tbody>
            <tr><td>Tributos</td><td>{{a.resumo.tributos | currency:'BRL'}}</td><td>{{b.resumo.tributos | currency:'BRL'}}</td><td>{{(b.resumo.tributos - a.resumo.tributos) | currency:'BRL'}}</td></tr>
            <tr><td>Despesas</td><td>{{a.totalDespesas | currency:'BRL'}}</td><td>{{b.totalDespesas | currency:'BRL'}}</td><td>{{(b.totalDespesas - a.totalDespesas) | currency:'BRL'}}</td></tr>
            <tr><td>Desembolso Total</td><td>{{a.resumo.desembolsoTotal | currency:'BRL'}}</td><td>{{b.resumo.desembolsoTotal | currency:'BRL'}}</td><td>{{(b.resumo.desembolsoTotal - a.resumo.desembolsoTotal) | currency:'BRL'}}</td></tr>
          </tbody>
        </table>

        <h3 style="margin-top:16px">Premissas</h3>
        <table class="grid">
          <thead><tr><th>Campo</th><th>A</th><th>B</th><th>Δ</th></tr></thead>
          <tbody>
            <tr><td>FOB (USD)</td><td>{{a.premissas.fobUsd}}</td><td>{{b.premissas.fobUsd}}</td><td>{{b.premissas.fobUsd - a.premissas.fobUsd}}</td></tr>
            <tr><td>Frete (USD)</td><td>{{a.premissas.freteUsd}}</td><td>{{b.premissas.freteUsd}}</td><td>{{b.premissas.freteUsd - a.premissas.freteUsd}}</td></tr>
            <tr><td>Seguro (USD)</td><td>{{a.premissas.seguroUsd}}</td><td>{{b.premissas.seguroUsd}}</td><td>{{b.premissas.seguroUsd - a.premissas.seguroUsd}}</td></tr>
            <tr><td>THC (USD)</td><td>{{a.premissas.thcUsd}}</td><td>{{b.premissas.thcUsd}}</td><td>{{b.premissas.thcUsd - a.premissas.thcUsd}}</td></tr>
            <tr><td>Taxa USD</td><td>{{a.premissas.taxaUsd}}</td><td>{{b.premissas.taxaUsd}}</td><td>{{b.premissas.taxaUsd - a.premissas.taxaUsd}}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `.content{padding:24px}`,
    `.grid{width:100%;border-collapse:collapse}`,
    `.grid th{background:var(--color-subtle-bg);color:var(--color-text);text-align:left;padding:10px;border-bottom:1px solid var(--color-border)}`,
    `.grid td{padding:10px;border-bottom:1px solid var(--color-border)}`,
    `.field label{font-size:12px;color:var(--color-muted);margin-bottom:6px;display:block}`,
    `.field select{padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface)}`
  ]
})
export class CompararVersoesComponent {
  private route = inject(ActivatedRoute);
  private s = inject(PlanilhasService);
  id = '';
  versions: Array<{ id: string; fase: string; createdAt: string }> = [];
  vidA = '';
  vidB = '';
  a: any; b: any; meta: any;
  constructor(){ this.route.params.subscribe(p => { this.id = p['id']; this.versions = this.s.versions(this.id); this.meta = this.s.meta(this.id); if(this.versions.length){ this.vidA = this.versions[0].id; this.vidB = this.versions[Math.min(1,this.versions.length-1)].id; this.load(); } }); }
  load(){ this.a = this.s.versionSnapshot(this.id, this.vidA); this.b = this.s.versionSnapshot(this.id, this.vidB); }
}