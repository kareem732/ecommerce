import {ChangeDetectionStrategy,Component,ElementRef,HostListener,computed,forwardRef,inject,input,signal} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import parsePhoneNumberFromString, {CountryCode,getCountries,getCountryCallingCode} from 'libphonenumber-js';
import { LucideAngularModule, ChevronsUpDown } from 'lucide-angular';
import { Label } from '../label/label';
import { Country } from './phone.types';

let nextId = 0;

@Component({
  selector: 'app-phone',
  standalone: true,
  imports: [LucideAngularModule, Label],
  templateUrl: './phone.html',
  styleUrl: './phone.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Phone),
      multi: true,
    },
  ],
})
export class Phone implements ControlValueAccessor {
  private host = inject(ElementRef<HTMLElement>);
  private regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

  readonly id = `app-phone-${nextId++}`;
  readonly ChevronsUpDown = ChevronsUpDown;

  label = input<string>('');
  placeholder = input<string>('Phone number');
  error = input<string>('');
  disabled = input<boolean>(false);
  defaultCountry = input<CountryCode>('EG');

  countries: Country[] = getCountries()
    .map((code) => ({
      code,
      name: this.regionNames.of(code) ?? code,
      dial: getCountryCallingCode(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  country = signal<CountryCode | null>(null);
  national = signal('');
  open = signal(false);
  search = signal('');
  formDisabled = signal(false);
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  activeCode = computed<CountryCode>(
    () => this.country() ?? this.defaultCountry(),
  );
  activeCountry = computed(
    () =>
      this.countries.find((c) => c.code === this.activeCode()) ??
      this.countries[0],
  );

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.countries;
    return this.countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q.replace('+', '')),
    );
  });

  private onChange: (v: string) => void = () => {
    /* set by registerOnChange */
  };
  private onTouched: () => void = () => {
    /* set by registerOnTouched */
  };

  writeValue(v: string | null): void {
    if (!v) {
      this.national.set('');
      return;
    }
    const parsed = parsePhoneNumberFromString(v);
    if (parsed?.country) {
      this.country.set(parsed.country);
      this.national.set(parsed.nationalNumber);
    } else {
      this.national.set(v);
    }
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    this.national.set(digits);
    this.emit();
  }

  pick(country: Country): void {
    this.country.set(country.code);
    this.open.set(false);
    this.search.set('');
    this.emit();
  }

  toggle(): void {
    if (this.isDisabled()) return;
    this.open.update((v) => !v);
    if (!this.open()) this.search.set('');
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onBlur(): void {
    this.onTouched();
  }

  private emit(): void {
    const n = this.national();
    this.onChange(n ? `+${this.activeCountry().dial}${n}` : '');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target)) {
      this.open.set(false);
      this.search.set('');
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
    this.search.set('');
  }
}
