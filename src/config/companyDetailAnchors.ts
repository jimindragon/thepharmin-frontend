import type { AnchorSection } from "@/components/shared/SectionAnchorNav";
import type { JobTrack } from "@/types/jobs";

/**
 * 기업 상세 "개요" 탭의 ≤760px 섹션 앵커 목록. 공고 상세(jobDetailAnchors)와 같은 규칙이다 —
 * 트랙이 가질 수 있는 섹션을 전부 담고, 실제 렌더 여부는 SectionAnchorNav가 DOM에서 거른다.
 *
 * 소개·정보 두 카드만 트랙마다 제목이 다르고(기업/병원/약국/기관) 나머지 셋은 공통이라,
 * 앞의 둘만 트랙별로 갈고 뒤는 공유한다. 라벨은 화면에 실제로 찍히는 h2를 그대로 쓴다 —
 * 탭 문구와 도착지 제목이 다르면 눌러 놓고도 맞게 왔는지 확인해야 한다.
 */
export const companyAnchorIds = {
  intro: "company-intro",
  info: "company-info",
  jobs: "company-jobs",
  interviews: "company-interviews",
  reviews: "company-reviews",
  news: "company-news",
} as const;

/** 소개·정보 뒤에 붙는 공통 꼬리. 채용중인 공고·관련 뉴스는 0건이면 섹션째 빠진다(앵커가 DOM으로 거른다). */
const COMMON_TAIL: AnchorSection[] = [
  { id: companyAnchorIds.jobs, label: "채용중인 공고" },
  { id: companyAnchorIds.interviews, label: "면접 후기" },
  { id: companyAnchorIds.reviews, label: "기업 리뷰" },
  { id: companyAnchorIds.news, label: "관련 뉴스" },
];

export const companyDetailAnchors: Record<JobTrack, AnchorSection[]> = {
  industry: [
    { id: companyAnchorIds.intro, label: "기업 소개" },
    { id: companyAnchorIds.info, label: "기업 정보" },
    ...COMMON_TAIL,
  ],
  hospital: [
    { id: companyAnchorIds.intro, label: "병원 소개" },
    { id: companyAnchorIds.info, label: "병원 정보" },
    ...COMMON_TAIL,
  ],
  pharmacy: [
    { id: companyAnchorIds.intro, label: "약국 소개" },
    { id: companyAnchorIds.info, label: "약국 정보" },
    ...COMMON_TAIL,
  ],
  research: [
    { id: companyAnchorIds.intro, label: "기관 소개" },
    { id: companyAnchorIds.info, label: "연구기관 정보" },
    ...COMMON_TAIL,
  ],
};
