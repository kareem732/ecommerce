import { ChangeDetectionStrategy,ChangeDetectorRef, Component,inject,input, output,} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Occasion } from '../../interfaces/home.model/home-model-response';
import { OccasionTitlePipe } from '../../pipes/occasion-title.pipe';

@Component({
  selector: 'app-occasion-filter',
  imports: [TranslatePipe, OccasionTitlePipe],
  templateUrl: './occasion-filter.html',
  styleUrl: './occasion-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OccasionFilter {
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly selectedId = input<string | null>(null);
  readonly occasions = input.required<Occasion[]>();

  readonly selectedChange = output<string | null>();

  constructor() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cdr.markForCheck());
  }

  protected select(id: string | null): void {
    if (id !== this.selectedId()) {
      this.selectedChange.emit(id);
    }
  }
}
