import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './core/components/toast-container.component';
import { ConfirmDialogComponent } from './core/components/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
    <app-confirm-dialog></app-confirm-dialog>
  `
})
export class AppComponent {
  title = 'import-costs';
}
