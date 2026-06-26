import { industryExampleImageList } from "@/config/industryImages";

function hashSlug(value: string): number {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/** 공고 slug를 기준으로 대표 이미지를 결정론적으로 배정한다. 같은 slug는 항상 같은 사진을 반환한다 */
export function getIndustryJobCoverImage(slug: string): string {
  const index = hashSlug(slug) % industryExampleImageList.length;
  return industryExampleImageList[index];
}
