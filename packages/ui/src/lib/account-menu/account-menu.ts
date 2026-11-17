import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ChevronRight, LucideAngularModule } from 'lucide-angular';
import { AccountMenuItem } from './account-menu.types';

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './account-menu.html',
  styleUrl: './account-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMenu {
  private host = inject(ElementRef<HTMLElement>);

  readonly ChevronRight = ChevronRight;

  triggerLabel = input<string>('Account');
  title = input<string>('');
  groups = input<AccountMenuItem[][]>([]);

  itemSelected = output<AccountMenuItem>();

  open = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
  }

  select(item: AccountMenuItem): void {
    if (item.disabled) return;
    this.itemSelected.emit(item);
    if (!item.hasSubmenu) {
      this.open.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}