import { companyExampleImages, companyLogos } from "@/config/companyImages";
import { jobs } from "@/data/jobs";
import type { RecommendedJob } from "@/types/jobs";

// slug → 광고 등급 매핑 (데이터에 없는 공고는 노출하지 않음)
const tierMap: Record<string, "premium" | "featured" | "standard"> = {
  "samsungbio-bioprocess": "premium",
  "gsk-oncology-msl":      "premium",
  "roche-cmc-qa":          "premium",
  "otsuka-mi-pv":          "featured",
  "celltrionph-ra":        "featured",
  "lgchem-mfg-pharmacist": "featured",
  "aju-clinical-pm":       "featured",
  "bukwang-bd-lead":       "standard",
  "yuyu-ma-formulation":   "standard",
  "cellbion-qaqc":         "standard",
  "dentium-device-ra":     "standard",
  "samsung-pharma-qc":     "standard",
};

// 노출 순서: premium 3 → featured 4 → standard 5
const orderedSlugs = [
  "samsungbio-bioprocess", "gsk-oncology-msl",      "roche-cmc-qa",
  "otsuka-mi-pv",          "celltrionph-ra",         "lgchem-mfg-pharmacist", "aju-clinical-pm",
  "bukwang-bd-lead",       "yuyu-ma-formulation",    "cellbion-qaqc",         "dentium-device-ra", "samsung-pharma-qc",
] as const;

const jobsBySlug = new Map(
  jobs.filter((j) => j.slug != null).map((j) => [j.slug!, j])
);

export const recommendedJobs: RecommendedJob[] = orderedSlugs.flatMap<RecommendedJob>((slug) => {
  const job = jobsBySlug.get(slug);
  if (!job) return [];

  return [{
    id: job.id,
    jobSlug: job.slug,
    company: job.company,
    logoText: job.logoText,
    logoUrl: (companyLogos as Record<string, string | undefined>)[job.company],
    title: job.title,
    condition: `${job.career} · ${job.education} · ${job.location}`,
    tags: job.tags,
    dDay: job.deadlineLabel.replace("마감 ", ""),
    applyMethod: job.applyMethod,
    image: job.coverImage ?? job.coverImageUrl ?? companyExampleImages.workspace,
    track: job.track,
    postingSource: job.postingSource,
    adTier: tierMap[slug],
  }];
});
