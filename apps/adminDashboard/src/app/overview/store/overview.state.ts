import { RevenuePeriod } from '../interfaces/overview.req';
import { OverviewPayload } from '../interfaces/overview.res';

export interface OverviewState {
  data: OverviewPayload | null;
  period: RevenuePeriod;
  loading: boolean;
  error: boolean;
}

export const initialOverviewState: OverviewState = {
  data: null,
  period: 'monthly',
  loading: false,
  error: false,
};
