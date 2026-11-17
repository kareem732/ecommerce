import { Params } from '@angular/router';

/** View model for a browsable collection (category, occasion…) linking to filtered products. */
export interface CollectionCardItem {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  productCount: number | null;
  link: string | readonly string[];
  queryParams?: Params;
}
