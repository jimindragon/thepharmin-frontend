import { pharmacyExampleImageList } from "@/config/pharmacyImages";

/**
 * 약국 공고 상세 id를 기준으로 대표 이미지 4종 중 하나를 결정론적으로 배정한다.
 * 같은 id는 항상 같은 사진을 반환한다.
 *
 * 병원·연구·산업 트랙이 slug FNV-1a 해시를 쓰는 것과 달리 약국만 id 문자코드 합이다 —
 * PharmacyJobDetailV2에 있던 배정을 그대로 옮긴 것이라 방식을 바꾸면 기존 공고의
 * 히어로 사진이 통째로 갈린다. 통일하고 싶으면 배정이 바뀌는 것을 감수하고 할 것.
 */
export function getPharmacyJobCoverImage(id: string): string {
  const index = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % pharmacyExampleImageList.length;
  return pharmacyExampleImageList[index];
}
