import { Directive, Input, HostBinding } from '@angular/core';

@Directive({
  selector: 'button[appLoadingBtn]',
  standalone: true
})
export class LoadingButtonDirective {
  @Input('appLoadingBtn') loading = false;

  @HostBinding('disabled')
  get isDisabled(): boolean { return this.loading; }

  @HostBinding('class.btn-loading')
  get isLoading(): boolean { return this.loading; }
}
