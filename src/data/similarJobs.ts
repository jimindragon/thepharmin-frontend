import { hasJobDetail } from "@/data/jobDetailIndex";
import { jobs } from "@/data/jobs";
import type { Job } from "@/types/jobs";

function computeSimilarityScore(current: Job, candidate: Job): number {
  let score = 0;

  const currentKeywords = current.coreKeywords ?? [];
  const keywordOverlap = (candidate.coreKeywords ?? []).filter((keyword) => currentKeywords.includes(keyword)).length;
  score += keywordOverlap * 2;

  if (candidate.jobSubcategoryIds.some((id) => current.jobSubcategoryIds.includes(id))) {
    score += 2;
  }

  if (candidate.regionId === current.regionId) {
    score += 1;
  }

  if (hasJobDetail(candidate.slug)) {
    score += 1;
  }

  return score;
}

/**
 * 공고 상세 하단 "비슷한 공고" 섹션용 추천 셀렉터. 같은 트랙 내에서 coreKeywords 겹침(개당 +2)·
 * jobSubcategoryIds 일치(+2)·regionId 일치(+1)·V2 상세 보유 여부(+1)로 점수를 매겨 정렬한다.
 * 동점은 id 오름차순으로 묶어 새로고침해도 항상 같은 결과가 나오게 한다(Math.random 등 비결정적
 * 요소는 쓰지 않는다). 점수가 있는 공고만으로 limit을 못 채우면 같은 트랙 최신 공고
 * (dateOrder 내림차순)로 나머지를 채워 섹션이 비지 않게 한다.
 */
export function getSimilarJobs(slug: string, limit = 3): Job[] {
  const currentJob = jobs.find((job) => job.slug === slug);
  if (!currentJob) {
    return [];
  }

  const candidates = jobs.filter((job) => job.track === currentJob.track && job.id !== currentJob.id);

  const scored = candidates
    .map((job) => ({ job, score: computeSimilarityScore(currentJob, job) }))
    .sort((a, b) => b.score - a.score || a.job.id - b.job.id);

  const matched = scored.filter((entry) => entry.score > 0).map((entry) => entry.job);
  if (matched.length >= limit) {
    return matched.slice(0, limit);
  }

  const matchedIds = new Set(matched.map((job) => job.id));
  const recentFill = candidates
    .filter((job) => !matchedIds.has(job.id))
    .sort((a, b) => b.dateOrder - a.dateOrder || a.id - b.id);

  return [...matched, ...recentFill].slice(0, limit);
}
