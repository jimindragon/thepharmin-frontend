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

/** getCompanyDetailCounts(companyDirectory)가 돌려주는 모양. 앵커가 라벨 뒤에 그대로 찍는다. */
export interface CompanyAnchorCounts {
  jobs: number;
  interviews: number;
  reviews: number;
  news: number;
}

/** 소개·정보 뒤에 붙는 공통 꼬리. 채용중인 공고·관련 뉴스는 0건이면 섹션째 빠진다(앵커가 DOM으로 거른다). */
const commonTail = (counts: CompanyAnchorCounts): AnchorSection[] => [
  { id: companyAnchorIds.jobs, label: "채용중인 공고", count: counts.jobs },
  { id: companyAnchorIds.interviews, label: "면접 후기", count: counts.interviews },
  { id: companyAnchorIds.reviews, label: "기업 리뷰", count: counts.reviews },
  { id: companyAnchorIds.news, label: "관련 뉴스", count: counts.news },
];

/** 트랙별 앞머리(소개·정보) — 세는 대상이 아니라 서술이라 카운트를 붙이지 않는다. */
const trackHead: Record<JobTrack, AnchorSection[]> = {
  industry: [
    { id: companyAnchorIds.intro, label: "기업 소개" },
    { id: companyAnchorIds.info, label: "기업 정보" },
  ],
  hospital: [
    { id: companyAnchorIds.intro, label: "병원 소개" },
    { id: companyAnchorIds.info, label: "병원 정보" },
  ],
  pharmacy: [
    { id: companyAnchorIds.intro, label: "약국 소개" },
    { id: companyAnchorIds.info, label: "약국 정보" },
  ],
  research: [
    { id: companyAnchorIds.intro, label: "기관 소개" },
    { id: companyAnchorIds.info, label: "연구기관 정보" },
  ],
};

/**
 * ≤760px에서는 이 앵커 행이 라우트 탭 행(CompanyDetailTabs)을 대신하므로, 탭 행이 갖고 있던 건수까지
 * 함께 흡수한다 — 탭 행을 숨기면서 카운트만 사라지면 "리뷰가 몇 건인지" 알 길이 없어진다.
 */
export function getCompanyDetailAnchors(track: JobTrack, counts: CompanyAnchorCounts): AnchorSection[] {
  return [...trackHead[track], ...commonTail(counts)];
}
