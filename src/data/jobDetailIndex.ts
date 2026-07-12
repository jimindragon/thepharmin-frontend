import { hospitalJobDetails } from "@/data/hospitalJobDetails";
import { industryJobDetails } from "@/data/industryJobDetails";
import { pharmacyJobDetails } from "@/data/pharmacyJobDetails";
import { researchJobDetails } from "@/data/researchJobDetails";

const jobDetailSlugs = new Set<string>([
  ...Object.values(industryJobDetails).map((detail) => detail.slug),
  ...pharmacyJobDetails.map((detail) => detail.slug),
  ...hospitalJobDetails.map((detail) => detail.slug),
  ...researchJobDetails.map((detail) => detail.slug),
]);

export function hasJobDetail(slug: string | undefined): boolean {
  if (!slug) {
    return false;
  }

  return jobDetailSlugs.has(slug);
}
