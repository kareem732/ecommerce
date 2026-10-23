export interface PromoCta {
  labelKey: string;
  link: string;
  withArrow?: boolean;
}

export interface PromoBanner {
  id: string;
  image: string;
  titleKey: string;
  badgeKey?: string;
  subtitleKey?: string;
  /** Renders a visible button. Takes precedence over `link`. */
  cta?: PromoCta;
  /** Makes the whole card clickable when there is no `cta`. */
  link?: string;
}

export type PromoCardVariant = 'default' | 'hero';
