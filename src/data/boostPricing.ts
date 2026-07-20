import type { JobTrack } from "@/types/jobs";

export type PricingCat = "industry" | "hospital" | "pharmacy";
export type BoostGrade = "premium" | "featured" | "standard";

export const BOOST_GRADE_LABEL: Record<BoostGrade, string> = {
  premium: "PREMIUM",
  featured: "FEATURED",
  standard: "STANDARD",
};

export interface BoostPricePoint {
  weeks: 1 | 2 | 3 | 4;
  originalKrw: number;
  discountedKrw: number;
}

export const BOOST_PRICING: Record<BoostGrade, Record<PricingCat, BoostPricePoint[]>> = {
  premium: {
    industry: [
      { weeks: 1, originalKrw: 1_200_000, discountedKrw: 1_200_000 },
      { weeks: 2, originalKrw: 2_400_000, discountedKrw: 1_680_000 },
      { weeks: 3, originalKrw: 3_600_000, discountedKrw: 2_160_000 },
      { weeks: 4, originalKrw: 4_800_000, discountedKrw: 2_400_000 },
    ],
    hospital: [
      { weeks: 1, originalKrw: 690_000, discountedKrw: 690_000 },
      { weeks: 2, originalKrw: 1_380_000, discountedKrw: 966_000 },
      { weeks: 3, originalKrw: 2_070_000, discountedKrw: 1_242_000 },
      { weeks: 4, originalKrw: 2_760_000, discountedKrw: 1_380_000 },
    ],
    pharmacy: [
      { weeks: 1, originalKrw: 80_000, discountedKrw: 80_000 },
      { weeks: 2, originalKrw: 160_000, discountedKrw: 112_000 },
      { weeks: 3, originalKrw: 240_000, discountedKrw: 144_000 },
      { weeks: 4, originalKrw: 320_000, discountedKrw: 160_000 },
    ],
  },
  featured: {
    industry: [
      { weeks: 1, originalKrw: 690_000, discountedKrw: 690_000 },
      { weeks: 2, originalKrw: 1_380_000, discountedKrw: 966_000 },
      { weeks: 3, originalKrw: 2_070_000, discountedKrw: 1_242_000 },
      { weeks: 4, originalKrw: 2_760_000, discountedKrw: 1_380_000 },
    ],
    hospital: [
      { weeks: 1, originalKrw: 440_000, discountedKrw: 440_000 },
      { weeks: 2, originalKrw: 880_000, discountedKrw: 616_000 },
      { weeks: 3, originalKrw: 1_320_000, discountedKrw: 792_000 },
      { weeks: 4, originalKrw: 1_760_000, discountedKrw: 880_000 },
    ],
    pharmacy: [
      { weeks: 1, originalKrw: 55_000, discountedKrw: 55_000 },
      { weeks: 2, originalKrw: 110_000, discountedKrw: 77_000 },
      { weeks: 3, originalKrw: 165_000, discountedKrw: 99_000 },
      { weeks: 4, originalKrw: 220_000, discountedKrw: 110_000 },
    ],
  },
  standard: {
    industry: [
      { weeks: 1, originalKrw: 350_000, discountedKrw: 350_000 },
      { weeks: 2, originalKrw: 700_000, discountedKrw: 490_000 },
      { weeks: 3, originalKrw: 1_050_000, discountedKrw: 630_000 },
      { weeks: 4, originalKrw: 1_400_000, discountedKrw: 700_000 },
    ],
    hospital: [
      { weeks: 1, originalKrw: 330_000, discountedKrw: 330_000 },
      { weeks: 2, originalKrw: 660_000, discountedKrw: 462_000 },
      { weeks: 3, originalKrw: 990_000, discountedKrw: 594_000 },
      { weeks: 4, originalKrw: 1_320_000, discountedKrw: 660_000 },
    ],
    pharmacy: [
      { weeks: 1, originalKrw: 20_000, discountedKrw: 20_000 },
      { weeks: 2, originalKrw: 40_000, discountedKrw: 28_000 },
      { weeks: 3, originalKrw: 60_000, discountedKrw: 36_000 },
      { weeks: 4, originalKrw: 80_000, discountedKrw: 40_000 },
    ],
  },
};

export function trackToPricingCat(track: JobTrack): PricingCat {
  if (track === "research") return "industry";
  return track;
}
