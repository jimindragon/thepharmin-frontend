import type { AnchorSection } from "@/components/shared/SectionAnchorNav";
import type { JobTrack } from "@/types/jobs";

/**
 * 기업 상세 "개요" 탭의 ≤760px 상단 바 항목. 앞쪽은 공고 상세(jobDetailAnchors)와 같은 규칙의
 * 섹션 앵커다 — 트랙이 가질 수 있는 섹션을 전부 담고, 실제 렌더 여부는 SectionAnchorNav가 DOM에서
 * 거른다. 뒤쪽 둘(면접 후기·기업 리뷰)만 성격이 다르다: 이 폭에서는 개요 본문에 그 미리보기를
 * 두지 않고(CompanyReviewsPreviewSection의 max-[760px]:hidden) 하위 탭 페이지로 이동시키므로
 * 앵커가 아니라 href를 든 라우트 항목이다.
 *
 * 소개·정보 두 카드만 트랙마다 제목이 다르고(기업/병원/약국/기관) 나머지는 공통이라,
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

/** 소개·정보 뒤에 붙는 앵커 꼬리. 채용중인 공고·관련 뉴스는 0건이면 섹션째 빠진다(앵커가 DOM으로 거른다). */
const anchorTail = (counts: CompanyAnchorCounts): AnchorSection[] => [
  { id: companyAnchorIds.jobs, label: "채용중인 공고", count: counts.jobs },
  { id: companyAnchorIds.news, label: "관련 뉴스", count: counts.news },
];

/**
 * 바 맨 뒤의 라우트 이동 항목. 앵커 뒤에 두는 것은 순서 취향이 아니라 읽는 순서다 —
 * 앞쪽은 "이 화면 안"이고 뒤쪽은 "이 화면 밖"이라, 경계(SectionAnchorNav의 세로 칸막이)가
 * 한 번만 생기려면 같은 성격끼리 붙어 있어야 한다.
 *
 * 건수는 앵커 항목과 같은 출처(getCompanyDetailCounts)를 그대로 쓴다 — 라우트 탭 행
 * (CompanyDetailTabs)도 같은 값을 써서, 폭을 넘나들 때 같은 항목의 숫자가 달라지지 않는다.
 */
const routeTail = (companyId: string, counts: CompanyAnchorCounts): AnchorSection[] => [
  {
    id: companyAnchorIds.interviews,
    label: "면접 후기",
    count: counts.interviews,
    href: `/companies/${companyId}/interviews`,
  },
  { id: companyAnchorIds.reviews, label: "기업 리뷰", count: counts.reviews, href: `/companies/${companyId}/reviews` },
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
 * ≤760px에서는 이 행이 라우트 탭 행(CompanyDetailTabs)을 대신하므로, 탭 행이 갖고 있던 건수까지
 * 함께 흡수한다 — 탭 행을 숨기면서 카운트만 사라지면 "리뷰가 몇 건인지" 알 길이 없어진다.
 *
 * 면접 후기·기업 리뷰가 라우트 항목이라 companyId가 필요하다. 이 둘은 DOM 섹션 유무와 무관하게
 * 항상 렌더되므로, 개요 본문이 짧은 기관(섹션 2개)에서도 행 전체가 MIN_SECTIONS 아래로 내려가지 않는다.
 */
export function getCompanyDetailAnchors(companyId: string, track: JobTrack, counts: CompanyAnchorCounts): AnchorSection[] {
  return [...trackHead[track], ...anchorTail(counts), ...routeTail(companyId, counts)];
}
