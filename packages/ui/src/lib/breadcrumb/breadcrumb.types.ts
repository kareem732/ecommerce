export interface BreadcrumbItem {
  label: string;
  value?: string;
}

export type Crumb =
  { kind: 'item'; item: BreadcrumbItem; last: boolean } | { kind: 'ellipsis' };
