import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

function page(title: string) {
  @Component({
    standalone: true,
    selector: 'app-generic-page',
    imports: [CommonModule, RouterModule],
    template: `
      <div class="card">
        <h2>{{title}}</h2>
        <p>Esqueleto de tela</p>
      </div>
    `,
    styles: [
      `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
      `.btn{padding:10px 12px;border-radius:10px;background:var(--gradient-primary);color:#fff;font-weight:700;border:none}`
    ]
  })
  class GenericPageComponent {
    title = title;
  }
  return GenericPageComponent;
}

export const DashboardNovaComponent = page('Dashboard');