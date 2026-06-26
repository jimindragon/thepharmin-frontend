export interface BoostOption {
  id: string;
  label: string;
  weeks: number;
  originalKrw: number;
  discountedKrw: number;
  discountPct: number;
}

export const BOOST_OPTIONS: BoostOption[] = [
  { id: "1w", label: "부스트 1주", weeks: 1, originalKrw: 120000, discountedKrw: 84000, discountPct: 30 },
  { id: "2w", label: "부스트 2주", weeks: 2, originalKrw: 228000, discountedKrw: 148000, discountPct: 35 },
  { id: "4w", label: "부스트 4주", weeks: 4, originalKrw: 432000, discountedKrw: 259000, discountPct: 40 },
];
