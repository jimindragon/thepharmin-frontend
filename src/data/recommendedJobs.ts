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

  // 약국 트랙: PREMIUM/FEATURED 광고 수요가 없어 STANDARD만 사용
  "eunhaeng-pharmacy-part-time-pharmacist":        "standard",
  "hyundai-pharmacy-fulltime-pharmacist":          "standard",
  "hwagok-gibeum-pharmacy-short-term-pharmacist":  "standard",
  "yeongdong-365-pharmacy-wed-parttime":           "standard",
  "buldang-central-pharmacy-fulltime":             "standard",

  // 연구 트랙: 기관유형별 대표 공고 STANDARD 노출
  "snuh-neurology-data-researcher":                      "standard",
  "kist-neurochannel-postdoc":                           "standard",
  "kbri-dementia-postdoc":                               "standard",
  "unt-brain-organoid-postdoc":                          "standard",
  "kangwon-univ-natural-product-postdoc":                "standard",

  // 병원 트랙: 근무형태·기관종류 다양성 기준 STANDARD 노출
  "hanbit-hospital-multi-dept-pharmacist":             "standard",
  "nsmc-clinical-specialist-pharmacist":               "standard",
  "national-firefighters-hospital-pharmacy-staff":     "standard",
  "muju-county-care-hospital-twice-weekly-pharmacist": "standard",
  "sungae-hospital-morning-parttime-pharmacist":       "standard",
};

// 노출 순서: premium 3 → featured 4 → standard 5
const orderedSlugs = [
  "samsungbio-bioprocess", "gsk-oncology-msl",      "roche-cmc-qa",
  "otsuka-mi-pv",          "celltrionph-ra",         "lgchem-mfg-pharmacist", "aju-clinical-pm",
  "bukwang-bd-lead",       "yuyu-ma-formulation",    "cellbion-qaqc",         "dentium-device-ra", "samsung-pharma-qc",
  "eunhaeng-pharmacy-part-time-pharmacist", "hyundai-pharmacy-fulltime-pharmacist",
  "hwagok-gibeum-pharmacy-short-term-pharmacist", "yeongdong-365-pharmacy-wed-parttime",
  "buldang-central-pharmacy-fulltime",
  "snuh-neurology-data-researcher", "kist-neurochannel-postdoc", "kbri-dementia-postdoc",
  "unt-brain-organoid-postdoc", "kangwon-univ-natural-product-postdoc",
  "hanbit-hospital-multi-dept-pharmacist", "nsmc-clinical-specialist-pharmacist", "national-firefighters-hospital-pharmacy-staff",
  "muju-county-care-hospital-twice-weekly-pharmacist", "sungae-hospital-morning-parttime-pharmacist",
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
    tags: job.coreKeywords ?? [],
    dDay: job.deadlineLabel.replace("마감 ", ""),
    applyMethod: job.applyMethod,
    image: job.coverImage ?? job.coverImageUrl ?? companyExampleImages.workspace,
    track: job.track,
    postingSource: job.postingSource,
    adTier: tierMap[slug],
  }];
});
