/**
 * 산업 트랙 공고 상세 페이지 대표 이미지 풀. _4~_7을 우선 사용하고, 필요 시 _0~_3까지 확장된다.
 *
 * `company_pic_example_5.jpg`는 제외한다 — 2832×3965 세로 사진이라 히어로(약 3.4:1)와
 * PREMIUM 카드(19:6)의 가로 크롭에서 중앙 띠만 남아 구도가 무너진다. 프로필 커버 키
 * `companyExampleImages.meeting`으로는 계속 살아 있으니 파일을 지우지는 말 것.
 * 이 목록에 세로 사진을 다시 넣으면 같은 문제가 재발한다.
 */
export const industryExampleImageList = [
  "/images/company/company_pic_example_4.jpg",
  "/images/company/company_pic_example_6.jpg",
  "/images/company/company_pic_example_7.jpg",
  "/images/company/company_pic_example.jpg",
  "/images/company/company_pic_example_1.jpg",
  "/images/company/company_pic_example_2.jpg",
  "/images/company/company_pic_example_3.jpg",
] as const;
