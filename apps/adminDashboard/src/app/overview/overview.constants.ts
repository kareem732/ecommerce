import { RevenuePeriod } from './interfaces/overview.req';

export const PERIOD_OPTIONS: { value: RevenuePeriod; key: string }[] = [
  { value: 'monthly', key: 'ADMIN.OVERVIEW.PERIOD.MONTHLY' },
  { value: 'week', key: 'ADMIN.OVERVIEW.PERIOD.LAST_WEEK' },
];
