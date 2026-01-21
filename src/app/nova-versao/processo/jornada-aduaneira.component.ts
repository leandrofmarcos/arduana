import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-jornada-aduaneira-nova',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <div class="header">
        <div class="title"><span class="pkg">📦</span>Jornada Aduaneira</div>
        <div class="subtitle">DI 24/1234567-8 • Importador: Empresa XYZ Ltda</div>
        <div class="panel panel-header">
          <div class="panel-inner">
            <div class="info">
              <div class="info-header">
                <div class="info-icon" [class]="gradientClass(current.color)">{{current.icon}}</div>
                <div>
                  <div class="info-title">{{current.title}}</div>
                  <div class="info-sub">{{current.subtitle}}</div>
                </div>
              </div>
              <div class="info-desc">{{current.description}}</div>
              <div class="chips">
                <div class="chip purple">Etapa {{currentStep + 1}} de {{steps.length}}</div>
                <div class="chip blue">{{progressPct}}% Completo</div>
              </div>
            </div>
            <div class="controls">
              <button class="btn prev" [disabled]="currentStep===0" (click)="prevStep()">← Anterior</button>
              <button class="btn next" [disabled]="currentStep===steps.length-1" (click)="nextStep()">Próximo →</button>
              <button class="btn reset" (click)="resetJourney()">🔄</button>
            </div>
          </div>
        </div>
      </div>
      <div class="board-wrapper">
        <div class="board">
          <svg class="board-svg" width="100%" height="100%" viewBox="0 0 1200 640" preserveAspectRatio="none">
            <path [attr.d]="path" fill="none" [attr.stroke]="'var(--color-border)'" stroke-width="6" stroke-dasharray="18,10"></path>
            <path [attr.d]="path" fill="none" [attr.stroke]="gradientUrl" stroke-width="8" stroke-dasharray="18,10" class="progress" [style.strokeDasharray]="'2000'" [style.strokeDashoffset]="dashOffset" marker-end="url(#arrow)"></path>
            <defs>
              <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#10b981"></stop>
                <stop offset="100%" stop-color="#3b82f6"></stop>
              </linearGradient>
              <marker id="arrow" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
                <path d="M0,0 L12,6 L0,12 Z" [attr.fill]="'var(--color-primary)'"></path>
              </marker>
            </defs>
          </svg>
          <div *ngFor="let step of steps; let index = index" class="step" [style.left.px]="step.position.x" [style.top.px]="step.position.y" [style.transform]="index===currentStep && animateToken ? 'scale(1.2)' : 'scale(1)'">
            <div class="circle" [class.current]="index===currentStep" [class.completed]="index<currentStep" [class.pending]="index>currentStep" [class]="gradientClass(step.color)">
              <div class="icon">{{step.icon}}</div>
              <div class="badge" *ngIf="index<currentStep">✅</div>
            </div>
            <div class="label" [class.scale]="index===currentStep">
              <div class="label-title">{{step.title}}</div>
              <div class="label-sub">{{step.subtitle}}</div>
            </div>
            <div class="here" *ngIf="index===currentStep">VOCÊ ESTÁ AQUI</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border-radius:12px;padding:24px}`,
    `.header{display:flex;flex-direction:column;margin-bottom:12px}`,
    `.title{display:flex;align-items:center;gap:10px;font-size:2rem;font-weight:800;color:var(--color-text)}`,
    `.pkg{font-size:1.6rem}`,
    `.subtitle{color:var(--color-text-secondary);margin-top:6px}`,
    `.board-wrapper{position:relative;padding:0 clamp(12px,3vw,24px)}`,
    `.board{position:relative;width:100%;max-width:1200px;height:clamp(420px,calc(100vh - 240px),640px);margin:0 auto;overflow:hidden;background:var(--color-bg);border-radius:12px;--circle-size:clamp(72px,10vh,110px)}`,
    `.board-svg{position:absolute;inset:0}`,
    `.progress{transition:all 1s ease-in-out}`,
    `.step{position:absolute;transition:all .5s}`,
    `.circle{position:relative;width:var(--circle-size);height:var(--circle-size);border-radius:999px;box-shadow:0 8px 16px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center}`,
    `.circle.current{animation:pulse 2s infinite}`,
    `.icon{font-size:calc(var(--circle-size) * .4);color:#fff}`,
    `.badge{position:absolute;top:-8px;right:-8px;background:#22c55e;color:#fff;border-radius:999px;padding:6px;box-shadow:0 10px 20px rgba(0,0,0,.4)}`,
    `.label{position:absolute;bottom:calc(-.6 * var(--circle-size));left:50%;transform:translateX(-50%);width:calc(var(--circle-size) * 1.5);text-align:center;transition:transform .3s}`,
    `.label.scale{transform:translateX(-50%) scale(1.1)}`,
    `.label-title{font-weight:800;color:var(--color-text);font-size:1rem}`,
    `.label-sub{color:var(--color-text-secondary);font-size:.85rem}`,
    `.here{position:absolute;top:calc(-.8 * var(--circle-size));left:50%;transform:translateX(-50%);background:#facc15;color:#111827;padding:8px 14px;border-radius:999px;font-weight:800;box-shadow:0 10px 20px rgba(0,0,0,.4)}`,
    `.panel{margin-top:16px;background:var(--color-surface);border-radius:12px}`,
    `.panel-header{margin-top:12px}`,
    `.panel-inner{padding:10px 14px;display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:10px}`,
    `@media (max-height:800px){.card{padding:16px}.panel{margin-top:10px}.panel-inner{padding:8px 12px;gap:8px}.btn{padding:8px 12px}.info-icon{width:50px;height:50px;font-size:24px}}`,
    `.info{flex:1;min-width:280px}`,
    `.info-header{display:flex;align-items:center;gap:14px;margin-bottom:12px}`,
    `.info-icon{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 20px rgba(0,0,0,.4);font-size:26px;color:#fff}`,
    `.info-title{font-weight:900;color:var(--color-text);font-size:1.25rem}`,
    `.info-sub{color:var(--color-text-secondary)}`,
    `.info-desc{color:var(--color-text-secondary);margin-bottom:10px}`,
    `.chips{display:flex;flex-wrap:wrap;align-items:center;gap:8px}`,
    `.chip{padding:6px 10px;border-radius:999px;color:#fff;font-weight:700}`,
    `.chip.purple{background:#7c3aed}`,
    `.chip.blue{background:#2563eb}`,
    `.controls{display:flex;gap:8px;min-width:280px}`,
    `.btn{padding:10px 16px;border-radius:12px;font-weight:800;color:#fff;border:none;box-shadow:0 10px 20px rgba(0,0,0,.4)}`,
    `.btn.prev{background:#374151}`,
    `.btn.next{background:linear-gradient(90deg,#7c3aed,#db2777)}`,
    `.btn.reset{background:#ea580c}`,
    `.btn:disabled{opacity:.5;cursor:not-allowed}`,
    `.completed{background:linear-gradient(135deg,#22c55e,#16a34a)}`,
    `.pending{background:linear-gradient(135deg,#4b5563,#1f2937)}`,
    `.grad-blue{background:linear-gradient(135deg,#60a5fa,#2563eb)}`,
    `.grad-cyan{background:linear-gradient(135deg,#22d3ee,#0891b2)}`,
    `.grad-purple{background:linear-gradient(135deg,#c084fc,#7c3aed)}`,
    `.grad-indigo{background:linear-gradient(135deg,#818cf8,#4338ca)}`,
    `.grad-orange{background:linear-gradient(135deg,#fb923c,#ea580c)}`,
    `.grad-green{background:linear-gradient(135deg,#34d399,#16a34a)}`,
    `.grad-teal{background:linear-gradient(135deg,#2dd4bf,#0f766e)}`,
    `.grad-emerald{background:linear-gradient(135deg,#10b981,#064e3b)}`,
    `@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}`
  ]
})
export class JornadaAduaneiraNovaComponent {
  steps = [
    { id: 0, title: 'Início', subtitle: 'Preparação', description: 'Documentação reunida e licenças obtidas', icon: '📄', color: 'blue', position: { x: 40, y: 460 } },
    { id: 1, title: 'Porto', subtitle: 'Chegada', description: 'Mercadoria chegou ao território nacional', icon: '🚢', color: 'cyan', position: { x: 220, y: 460 } },
    { id: 2, title: 'Registro DI', subtitle: 'Declaração', description: 'Declaração de Importação registrada', icon: '📋', color: 'purple', position: { x: 400, y: 460 } },
    { id: 3, title: 'Parametrização', subtitle: 'Sistema', description: 'Canal de conferência definido', icon: '🔎', color: 'indigo', position: { x: 580, y: 420 } },
    { id: 4, title: 'Fiscalização', subtitle: 'Conferência', description: 'Análise documental e física', icon: '⚖️', color: 'orange', position: { x: 760, y: 360 } },
    { id: 5, title: 'Tributos', subtitle: 'Pagamento', description: 'Impostos e taxas quitados', icon: '💵', color: 'green', position: { x: 940, y: 280 } },
    { id: 6, title: 'Desembaraço', subtitle: 'Liberação', description: 'Mercadoria nacionalizada', icon: '✅', color: 'teal', position: { x: 1080, y: 180 } },
    { id: 7, title: 'Entrega', subtitle: 'Finalização', description: 'Mercadoria liberada para retirada', icon: '🚚', color: 'emerald', position: { x: 980, y: 80 } }
  ];
  currentStep = 0;
  animateToken = false;
  get current(){ return this.steps[this.currentStep]; }
  get gradientUrl(){ return 'url(#journeyGradient)'; }
  get dashOffset(){ const total = 2000; const frac = this.currentStep / (this.steps.length - 1); return String(total - (total * frac)); }
  get path(){ return this.generatePath(); }
  get progressPct(){ return Math.round(((this.currentStep + 1) / this.steps.length) * 100); }
  gradientClass(c: string){ return { 'blue': 'grad-blue', 'cyan': 'grad-cyan', 'purple': 'grad-purple', 'indigo': 'grad-indigo', 'orange': 'grad-orange', 'green': 'grad-green', 'teal': 'grad-teal', 'emerald': 'grad-emerald' }[c] || 'grad-blue'; }
  nextStep(){ if(this.currentStep < this.steps.length - 1){ this.currentStep++; this.bump(); } }
  prevStep(){ if(this.currentStep > 0){ this.currentStep--; this.bump(); } }
  resetJourney(){ this.currentStep = 0; this.bump(); }
  bump(){ this.animateToken = true; setTimeout(() => { this.animateToken = false; }, 600); }
  generatePath(){ let path = `M ${this.steps[0].position.x + 60} ${this.steps[0].position.y + 60}`; for(let i=1;i<this.steps.length;i++){ const prev = this.steps[i-1].position; const curr = this.steps[i].position; const midX = (prev.x + curr.x)/2; const midY = (prev.y + curr.y)/2; path += ` Q ${midX} ${midY}, ${curr.x + 60} ${curr.y + 60}`; } return path; }
}