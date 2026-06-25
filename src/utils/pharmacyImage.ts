import { pharmacyExampleImageList } from "@/config/pharmacyImages";
import { hashName } from "@/utils/pharmacyLogo";

/** 약국명을 기준으로 대표 이미지 4종 중 하나를 결정론적으로 배정한다. 같은 약국명은 항상 같은 사진을 반환한다 */
export function getPharmacyCoverImage(name: string): string {
  const index = hashName(name) % pharmacyExampleImageList.length;
  return pharmacyExampleImageList[index];
}
