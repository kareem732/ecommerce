import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [ProgressSpinner, TranslatePipe],
  templateUrl: './loading.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  private readonly loadingService = inject(LoadingService);

  readonly isLoading = computed(() => this.loadingService.isLoading());
  readonly loadingLabel = signal<string>('COMMON.LOADING');
}
