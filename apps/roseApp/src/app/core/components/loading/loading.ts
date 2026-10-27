import { ChangeDetectionStrategy,Component,DestroyRef,effect,inject,signal,untracked} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingService } from '../../services/loading.service';

const SHOW_DELAY_MS = 300;
const MIN_VISIBLE_MS = 400;

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(false);
  readonly loadingLabel = signal<string>('COMMON.LOADING');

  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private shownAt = 0;

  constructor() {
    effect(() => {
      const active = this.loadingService.isLoading();
      untracked(() => (active ? this.scheduleShow() : this.scheduleHide()));
    });

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.showTimer);
      clearTimeout(this.hideTimer);
    });
  }

  private scheduleShow(): void {
    clearTimeout(this.hideTimer);
    if (this.isLoading() || this.showTimer) return;
    this.showTimer = setTimeout(() => {
      this.showTimer = undefined;
      this.shownAt = Date.now();
      this.isLoading.set(true);
    }, SHOW_DELAY_MS);
  }

  private scheduleHide(): void {
    clearTimeout(this.showTimer);
    this.showTimer = undefined;
    if (!this.isLoading()) return;
    const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - this.shownAt));
    this.hideTimer = setTimeout(() => this.isLoading.set(false), remaining);
  }
}
