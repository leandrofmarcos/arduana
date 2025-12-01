import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prototype-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="host">
      <iframe src="/docs/prototipo-0003.html" title="Protótipo" class="frame"></iframe>
    </div>
  `,
  styles: [
    `.host{height:100%;}`,
    `.frame{width:100%;height:100%;border:none;background:#fff}`
  ]
})
export class PrototypeHostComponent {}