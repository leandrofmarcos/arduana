import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type CurrencyCode = 'BRL' | 'USD';
type MaskMode = 'currency' | 'number';

@Directive({
  selector: 'input[appCurrencyMask]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyMaskDirective),
      multi: true
    }
  ]
})
export class CurrencyMaskDirective implements ControlValueAccessor {
  @Input('appCurrencyMask') currencyCode: CurrencyCode = 'BRL';
  @Input() currencyMaskDecimals = 2;
  @Input() currencyMaskMode: MaskMode = 'currency';
  @Input() currencyMaskUnit = '';

  private value: number | null = null;
  private focused = false;
  private disabled = false;
  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  writeValue(value: number | null): void {
    this.value = this.normalize(value);
    this.render();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.el.nativeElement.disabled = isDisabled;
  }

  @HostListener('focus')
  handleFocus(): void {
    this.focused = true;
    this.render();
    this.selectAll();
  }

  @HostListener('input')
  handleInput(): void {
    if (this.disabled) return;
    const raw = this.el.nativeElement.value;
    const parsed = this.parseRawValue(raw);
    this.value = parsed;
    this.onChange(parsed);
    this.render();
    this.moveCursorToEnd();
  }

  @HostListener('blur')
  handleBlur(): void {
    this.focused = false;
    this.onTouched();
    this.render();
  }

  private render(): void {
    const el = this.el.nativeElement;
    const val = this.value;
    el.value = val !== null ? this.format(val, this.focused) : '';
  }

  private moveCursorToEnd(): void {
    requestAnimationFrame(() => {
      const len = this.el.nativeElement.value.length;
      this.el.nativeElement.setSelectionRange(len, len);
    });
  }

  private selectAll(): void {
    requestAnimationFrame(() => {
      const len = this.el.nativeElement.value.length;
      this.el.nativeElement.setSelectionRange(0, len);
    });
  }

  private format(value: number, editing: boolean): string {
    const minFractionDigits = this.currencyMaskMode === 'number'
      ? 0
      : (editing ? 0 : this.currencyMaskDecimals);
    const formatter = new Intl.NumberFormat(this.locale, {
      style: 'decimal',
      useGrouping: true,
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: this.currencyMaskDecimals
    });
    const numericPart = formatter.format(value);

    if (this.currencyMaskMode === 'number') {
      const unit = (this.currencyMaskUnit ?? '').trim();
      return unit ? `${numericPart} ${unit.toLowerCase()}` : numericPart;
    }

    const symbol = this.currencyCode === 'USD' ? '$' : 'R$';
    return this.currencyCode === 'USD' ? `${symbol}${numericPart}` : `${symbol} ${numericPart}`;
  }

  private parseRawValue(raw: string): number | null {
    const cleaned = (raw ?? '').trim();
    if (!cleaned) return null;

    const sanitized = cleaned.replace(/[^\d,.-]/g, '');
    if (!sanitized) return null;

    const hasNegative = sanitized.includes('-');
    const unsigned = sanitized.replace(/-/g, '');

    const primaryDecimal = this.currencyCode === 'USD' ? '.' : ',';
    const altDecimal = primaryDecimal === '.' ? ',' : '.';

    let intPartRaw = unsigned;
    let fracPartRaw = '';

    if (unsigned.includes(primaryDecimal)) {
      const idx = unsigned.lastIndexOf(primaryDecimal);
      intPartRaw = unsigned.slice(0, idx);
      fracPartRaw = unsigned.slice(idx + 1);
    } else if (unsigned.includes(altDecimal)) {
      const idx = unsigned.lastIndexOf(altDecimal);
      const rightDigits = unsigned.slice(idx + 1).replace(/\D/g, '');
      if (rightDigits.length > 0 && rightDigits.length <= this.currencyMaskDecimals) {
        intPartRaw = unsigned.slice(0, idx);
        fracPartRaw = unsigned.slice(idx + 1);
      }
    }

    const intDigits = intPartRaw.replace(/\D/g, '');
    const fracDigits = fracPartRaw.replace(/\D/g, '').slice(0, this.currencyMaskDecimals);
    if (!intDigits && !fracDigits) return null;

    const normalizedInt = intDigits || '0';
    const normalized = fracDigits ? `${normalizedInt}.${fracDigits}` : normalizedInt;
    const parsed = Number.parseFloat(normalized);
    if (Number.isNaN(parsed)) return null;

    const signed = hasNegative ? -parsed : parsed;
    return this.round(signed);
  }

  private round(value: number): number {
    const factor = Math.pow(10, this.currencyMaskDecimals);
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  private normalize(value: number | null | undefined): number | null {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
    return this.round(Number(value));
  }

  private get locale(): string {
    return this.currencyCode === 'USD' ? 'en-US' : 'pt-BR';
  }
}
