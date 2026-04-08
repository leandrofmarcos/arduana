import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-header">
      <div>
        <h1><span *ngIf="icon" [innerHTML]="safeIcon" class="page-header-icon"></span>{{ title }}</h1>
        <p class="subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <ng-content></ng-content>
    </div>
  `
})
export class PageHeaderComponent implements OnChanges {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  safeIcon: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    this.safeIcon = this.sanitizer.bypassSecurityTrustHtml(this.icon + ' ');
  }
}
