import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Occasion } from '../../interfaces/home.model/home-model-response';
import { ALL_OCCASIONS_LABEL } from './occasion-filter.constants';

@Component({
  selector: 'app-occasion-filter',
  templateUrl: './occasion-filter.html',
  styleUrl: './occasion-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OccasionFilter {
  readonly selectedId = input<string | null>(null);
  readonly occasions = input.required<Occasion[]>();

  readonly selectedChange = output<string | null>();

  protected readonly allLabel = ALL_OCCASIONS_LABEL;

  protected select(id: string | null): void {
    if (id !== this.selectedId()) {
      this.selectedChange.emit(id);
    }
  }
}
