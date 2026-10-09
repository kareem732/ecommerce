import {ChangeDetectionStrategy,Component,ElementRef,HostListener,inject,input,output,signal} from '@angular/core';
import {LucideAngularModule,LucideIconData,User,CreditCard,Settings,Keyboard,Users,UserPlus,Plus,Github,LifeBuoy,Cloud,LogOut,ChevronRight,} from 'lucide-angular';

export interface AccountMenuItem {
  id: string;
  label: string;
  icon?: LucideIconData;
  shortcut?: string;
  hasSubmenu?: boolean;
  disabled?: boolean;
}

const DEFAULT_GROUPS: AccountMenuItem[][] = [
  [
    { id: 'profile', label: 'Profile Item', icon: User, shortcut: '⌘⇧B' },
    { id: 'billing', label: 'Billing', icon: CreditCard, shortcut: '⌘⇧B' },
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: '⌘⇧B' },
    { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard, shortcut: '⌘⇧B' },
  ],
  [
    { id: 'team', label: 'Team', icon: Users },
    { id: 'invite', label: 'Invite users', icon: UserPlus, hasSubmenu: true },
    { id: 'new-team', label: 'New team', icon: Plus, shortcut: '⌘⇧B' },
    { id: 'github', label: 'Github', icon: Github },
    { id: 'support', label: 'Support', icon: LifeBuoy, hasSubmenu: true },
    { id: 'api', label: 'API', icon: Cloud, disabled: true },
    { id: 'logout', label: 'Log out', icon: LogOut, shortcut: '⌘⇧B' },
  ],
];

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
  title = input<string>('My Account');
  groups = input<AccountMenuItem[][]>(DEFAULT_GROUPS);

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
