import { ADDRESS_TITLES } from '../../constants/address.constants';
import { AddressLike } from '../../interfaces/address.model/address.types';

const TITLE_ORDER: readonly string[] = (ADDRESS_TITLES as readonly string[]).map((t) =>
  t.toLowerCase(),
);

const titleRank = (title: string): number => {
  const index = TITLE_ORDER.indexOf((title ?? '').trim().toLowerCase());
  return index === -1 ? TITLE_ORDER.length : index;
};

export const sortByTitle = (items: readonly AddressLike[]): AddressLike[] =>
  [...items].sort((a, b) => titleRank(a.title) - titleRank(b.title));

export const pickSelection = (
  list: readonly { id: string; isPrimary: boolean }[],
  current: string | null,
): string | null =>
  list.find((address) => address.id === current)?.id ??
  list.find((address) => address.isPrimary)?.id ??
  list[0]?.id ??
  null;
