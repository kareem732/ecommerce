export enum GiftFinderStep {
  Occasion = 'OCCASION',
  Recipient = 'RECIPIENT',
  Budget = 'BUDGET',
  Category = 'CATEGORY',
  Results = 'RESULTS',
}

/** Question steps, in the order they are asked. */
export const GIFT_FINDER_QUESTIONS: readonly GiftFinderStep[] = [
  GiftFinderStep.Occasion,
  GiftFinderStep.Recipient,
  GiftFinderStep.Budget,
  GiftFinderStep.Category,
];
