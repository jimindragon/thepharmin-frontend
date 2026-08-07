import { companyLogos } from "@/config/companyImages";
import { hospitalExampleImageList } from "@/config/hospitalImages";
import { industryExampleImageList } from "@/config/industryImages";
import { pharmacyExampleImageList } from "@/config/pharmacyImages";
import { researchExampleImageList } from "@/config/researchImages";
import { jobs } from "@/data/jobs";
import { getPharmacyJobDetail } from "@/data/pharmacyJobDetails";
import type { JobTrack, RecommendedJob } from "@/types/jobs";
import { formatJobDeadlineLabel } from "@/utils/dday";
import { getHospitalJobCoverImage } from "@/utils/hospitalImage";
import { getIndustryJobCoverImage } from "@/utils/industryImage";
import { getPharmacyJobCoverImage } from "@/utils/pharmacyImage";
import { getResearchJobCoverImage } from "@/utils/researchImage";

/**
 * slug → 광고 등급 매핑 (데이터에 없는 공고는 노출하지 않음).
 *
 * ⚠️ 아래 `orderedSlugs`와 항상 쌍으로 고친다. 한쪽만 건드리면 타입 에러 없이 조용히 어긋난다 —
 * tierMap에만 있으면 목록에서 빠지고, orderedSlugs에만 있으면 adTier가 undefined라 세 존
 * 어디에도 안 걸려 역시 사라진다. 둘 다 슬러그 문자열이 유일한 연결고리라 오타도 같은 결과다.
 */
const tierMap: Record<string, "premium" | "featured" | "standard"> = {
  // 산업 트랙
  "samsungbio-bioprocess": "premium",
  "gsk-oncology-msl":      "premium",
  "roche-cmc-qa":          "premium",
  "yuhan-ra-regulatory-strategy": "featured",
  "celltrionph-ra":        "featured",
  "medicoa-senior-cra":    "featured",
  "celltrionph-bd":        "featured",
  "bukwang-bd-lead":       "standard",
  "yuyu-ma-formulation":   "standard",
  "cellbion-qaqc":         "standard",
  "celltrionph-clinical":  "standard",
  "gsk-vaccine-msl-cvmd":  "standard",

  // 연구 트랙
  "kbri-dementia-postdoc":                               "premium",
  "amc-colorectal-surgery-researcher":                   "premium",
  "kist-neurophysiology-intern":                         "featured",
  "kangwon-univ-natural-product-postdoc":                "featured",
  "unt-brain-organoid-postdoc":                          "standard",
  "postech-life-sciences-structural-biology-researcher": "standard",
  "dongguk-pharmacy-dmpk-researcher":                    "standard",
  "konyang-myunggok-eye-researcher":                     "standard",
  "hallym-microbiology-lab-manager":                     "standard",

  // 병원 트랙
  "snuh-pharmacy-staff":                                  "premium",
  "nch-pharmacy-dept-manager":                            "premium",
  "osan-korea-hospital-contract-sunday-oncall-pharmacist": "premium",
  "national-firefighters-hospital-pharmacy-staff":        "featured",
  "sungae-hospital-morning-parttime-pharmacist":          "featured",
  "jeil-orthopedic-hospital-parttime-pharmacist":         "standard",
  "nsmc-clinical-specialist-pharmacist":                  "standard",
  "mirae-care-weekend-parttime-pharmacist":               "standard",

  // 약국 트랙: FEATURED 0건은 의도된 상태 — 중간 등급 광고 수요가 아직 없다.
  // 존 자체가 렌더되지 않으므로(RecommendedJobsGrid의 length > 0 가드) 빈 줄이 생기지는 않는다.
  "eunhaeng-pharmacy-part-time-pharmacist":        "premium",
  "shin-jungang-pharmacy-saturday-parttime":       "premium",
  "yeongdong-365-pharmacy-wed-parttime":           "premium",
  "hyundai-pharmacy-fulltime-pharmacist":          "standard",
  "hwagok-gibeum-pharmacy-short-term-pharmacist":  "standard",
  "buldang-central-pharmacy-fulltime":             "standard",
  "hyeongang-pharmacy-fulltime-pharmacist":        "standard",
  "bichina-pharmacy-fulltime":                     "standard",
};

/**
 * 노출 순서 — 트랙별로 묶고, 트랙 안에서 premium → featured → standard 순.
 * 존별 카드 순서가 이 배열 순서 그대로이므로 같은 등급 안에서의 우선순위도 여기서 정한다.
 * ⚠️ 위 `tierMap`과 쌍으로 관리할 것.
 */
const orderedSlugs = [
  // 산업 — P3 / F4 / S5
  "samsungbio-bioprocess", "gsk-oncology-msl", "roche-cmc-qa",
  "yuhan-ra-regulatory-strategy", "celltrionph-ra", "medicoa-senior-cra", "celltrionph-bd",
  "bukwang-bd-lead", "yuyu-ma-formulation", "cellbion-qaqc", "celltrionph-clinical", "gsk-vaccine-msl-cvmd",

  // 병원 — P3 / F2 / S3
  "snuh-pharmacy-staff", "nch-pharmacy-dept-manager", "osan-korea-hospital-contract-sunday-oncall-pharmacist",
  "national-firefighters-hospital-pharmacy-staff", "sungae-hospital-morning-parttime-pharmacist",
  "jeil-orthopedic-hospital-parttime-pharmacist", "nsmc-clinical-specialist-pharmacist",
  "mirae-care-weekend-parttime-pharmacist",

  // 연구 — P2 / F2 / S5
  "kbri-dementia-postdoc", "amc-colorectal-surgery-researcher",
  "kist-neurophysiology-intern", "kangwon-univ-natural-product-postdoc",
  "unt-brain-organoid-postdoc", "postech-life-sciences-structural-biology-researcher",
  "dongguk-pharmacy-dmpk-researcher", "konyang-myunggok-eye-researcher", "hallym-microbiology-lab-manager",

  // 약국 — P3 / F0 / S5
  "eunhaeng-pharmacy-part-time-pharmacist", "shin-jungang-pharmacy-saturday-parttime",
  "yeongdong-365-pharmacy-wed-parttime",
  "hyundai-pharmacy-fulltime-pharmacist", "hwagok-gibeum-pharmacy-short-term-pharmacist",
  "buldang-central-pharmacy-fulltime", "hyeongang-pharmacy-fulltime-pharmacist", "bichina-pharmacy-fulltime",
] as const;

const jobsBySlug = new Map(
  jobs.filter((j) => j.slug != null).map((j) => [j.slug!, j])
);

const trackImagePools: Record<JobTrack, readonly string[]> = {
  industry: industryExampleImageList,
  research: researchExampleImageList,
  hospital: hospitalExampleImageList,
  pharmacy: pharmacyExampleImageList,
};

/**
 * 공고 상세 히어로와 같은 사진이 나오도록 트랙별 배정 유틸을 그대로 재사용한다.
 * 약국만 키가 slug가 아니라 상세 id다 — 상세 화면이 id 문자코드 합으로 배정하기 때문이고,
 * 여기서 slug를 넘기면 카드와 상세의 사진이 서로 어긋난다.
 */
function trackCoverImage(track: JobTrack, slug: string): string {
  switch (track) {
    case "hospital":
      return getHospitalJobCoverImage(slug);
    case "research":
      return getResearchJobCoverImage(slug);
    case "pharmacy":
      return getPharmacyJobCoverImage(getPharmacyJobDetail(slug)?.id ?? slug);
    case "industry":
      return getIndustryJobCoverImage(slug);
  }
}

/**
 * PREMIUM 존만 카드에 사진을 그린다(`RecommendedJobs.tsx`의 `PremiumCard`). 한 행에 3장이
 * 나란히 서므로 해시 배정에 맡기면 같은 사진이 이웃할 확률이 낮지 않다 — 4장 풀 기준 62.5%.
 * 그래서 PREMIUM만 트랙 풀에서 순번대로 뽑아 행 안에서의 중복을 구조적으로 없앤다.
 * 풀보다 PREMIUM이 많아지면 그때부터는 다시 겹친다(순번 % 풀 길이).
 *
 * 대신 PREMIUM 카드는 상세 히어로와 사진이 다를 수 있다 — 카드끼리 안 겹치는 쪽을 택한 결과다.
 * FEATURED/STANDARD는 사진을 렌더하지 않으므로 해시 배정을 그대로 둔다.
 */
const premiumImageBySlug = new Map<string, string>();
{
  const assignedByTrack = new Map<JobTrack, number>();

  for (const slug of orderedSlugs) {
    if (tierMap[slug] !== "premium") continue;

    const job = jobsBySlug.get(slug);
    if (!job) continue;

    const pool = trackImagePools[job.track];
    const order = assignedByTrack.get(job.track) ?? 0;
    assignedByTrack.set(job.track, order + 1);
    premiumImageBySlug.set(slug, pool[order % pool.length]);
  }
}

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
    dDay: formatJobDeadlineLabel(job),
    applyMethod: job.applyMethod,
    image: job.coverImage ?? job.coverImageUrl ?? premiumImageBySlug.get(slug) ?? trackCoverImage(job.track, slug),
    track: job.track,
    postingSource: job.postingSource,
    adTier: tierMap[slug],
  }];
});

/**
 * 홈 전용 노출 선별 — P·F는 이 목록만 홈에 노출(각 한 줄), 트랙 랜딩은 전량 노출.
 * 선별 기준: 로고·이미지·키워드 완성도 최상급.
 */
export const homeSpotlightSlugs = new Set<string>([
  // premium 1행 (3)
  "samsungbio-bioprocess", "snuh-pharmacy-staff", "kbri-dementia-postdoc",
  // featured 1행 (4)
  "yuhan-ra-regulatory-strategy", "medicoa-senior-cra",
  "national-firefighters-hospital-pharmacy-staff",
  "kist-neurophysiology-intern",
]);
