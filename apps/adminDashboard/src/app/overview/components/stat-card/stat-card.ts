import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

export type StatTone = 'rose' | 'blue' | 'green' | 'neutral';

const TONES: Record<StatTone, { card: string; accent: string }> = {
  rose: {
    card: 'bg-[#FBEAEA] dark:bg-rose-950/40',
    accent: 'text-rose-800 dark:text-rose-300',
  },
  blue: {
    card: 'bg-[#0063D00D] dark:bg-sky-950/40',
    accent: 'text-blue-700 dark:text-sky-300',
  },
  green: {
    card: 'bg-emerald-100/70 dark:bg-emerald-950/40',
    accent: 'text-emerald-800 dark:text-emerald-300',
  },
  neutral: {
    card: 'bg-violet-100/60 dark:bg-slate-800/60',
    accent: 'text-violet-800 dark:text-violet-300',
  },
};

@Component({
  selector: 'app-stat-card',
  imports: [DecimalPipe, LucideAngularModule],
  templateUrl: './stat-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input.required<LucideIconData>();
  readonly suffix = input('');
  readonly tone = input<StatTone>('neutral');

  protected readonly classes = computed(() => TONES[this.tone()]);
}
